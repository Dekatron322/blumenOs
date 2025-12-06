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
  clearCurrentAreaOffice,
  clearUpdateState,
  fetchAreaOfficeById,
  updateAreaOffice,
  UpdateAreaOfficeRequest,
} from "lib/redux/areaOfficeSlice"

interface AreaOfficeFormData {
  companyId: number
  oldNercCode: string
  newNercCode: string
  oldKaedcoCode: string
  newKaedcoCode: string
  nameOfOldOAreaffice: string
  nameOfNewOAreaffice: string
  latitude: number
  longitude: number
}

const UpdateAreaOfficePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const {
    updateLoading,
    updateError,
    updateSuccess,
    currentAreaOffice,
    currentAreaOfficeLoading,
    currentAreaOfficeError,
  } = useSelector((state: RootState) => state.areaOffices)

  const [formData, setFormData] = useState<AreaOfficeFormData>({
    companyId: 0,
    oldNercCode: "",
    newNercCode: "",
    oldKaedcoCode: "",
    newKaedcoCode: "",
    nameOfOldOAreaffice: "",
    nameOfNewOAreaffice: "",
    latitude: 0,
    longitude: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch area office data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      const areaOfficeId = parseInt(id as string)
      if (!isNaN(areaOfficeId)) {
        dispatch(fetchAreaOfficeById(areaOfficeId))
      } else {
        notify("error", "Invalid area office ID", {
          description: "The provided area office ID is invalid",
          duration: 4000,
        })
        router.push("/assets-management/area-offices") // Redirect back to area offices list
      }
    } else {
      notify("error", "Area office ID is required", {
        description: "Please provide a valid area office ID",
        duration: 4000,
      })
      router.push("/assets-management/area-offices") // Redirect back to area offices list
    }
  }, [dispatch, id, router])

  // Populate form when current area office data is loaded
  useEffect(() => {
    if (currentAreaOffice) {
      setFormData({
        companyId: currentAreaOffice.company.id,
        oldNercCode: currentAreaOffice.oldNercCode || currentAreaOffice.company.nercCode || "",
        newNercCode: currentAreaOffice.newNercCode,
        oldKaedcoCode: currentAreaOffice.oldKaedcoCode || "",
        newKaedcoCode: currentAreaOffice.newKaedcoCode,
        nameOfOldOAreaffice: currentAreaOffice.nameOfOldOAreaffice || "",
        nameOfNewOAreaffice: currentAreaOffice.nameOfNewOAreaffice,
        latitude: currentAreaOffice.latitude,
        longitude: currentAreaOffice.longitude,
      })
    }
  }, [currentAreaOffice])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Area office updated successfully", {
        description: `${formData.nameOfNewOAreaffice} has been updated in the system`,
        duration: 5000,
      })
      // Navigate back to area offices list after successful update
      setTimeout(() => {
        router.push("/assets-management/area-offices")
      }, 2000)
    }

    if (updateError) {
      notify("error", "Failed to update area office", {
        description: updateError,
        duration: 6000,
      })
    }

    if (currentAreaOfficeError) {
      notify("error", "Failed to load area office data", {
        description: currentAreaOfficeError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, currentAreaOfficeError, formData.nameOfNewOAreaffice, router])

  // Company options (you might want to fetch these from an API)
  const companyOptions = [
    { value: 0, label: "Select company" },
    { value: 1, label: "KAEDCO - Kano Electricity Distribution Company" },
    { value: 2, label: "JED - Jos Electricity Distribution" },
    { value: 3, label: "AEDC - Abuja Electricity Distribution Company" },
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (["companyId", "latitude", "longitude"].includes(name)) {
      processedValue = Number(value)
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

    if (formData.companyId === 0) {
      errors.companyId = "Company is required"
    }

    if (!formData.nameOfNewOAreaffice.trim()) {
      errors.nameOfNewOAreaffice = "New area office name is required"
    }

    if (!formData.newKaedcoCode.trim()) {
      errors.newKaedcoCode = "New KAEDCO code is required"
    }

    if (!formData.newNercCode.trim()) {
      errors.newNercCode = "New NERC code is required"
    }

    if (!formData.nameOfOldOAreaffice.trim()) {
      errors.nameOfOldOAreaffice = "Old area office name is required"
    }

    if (!formData.oldKaedcoCode.trim()) {
      errors.oldKaedcoCode = "Old KAEDCO code is required"
    }

    if (!formData.oldNercCode.trim()) {
      errors.oldNercCode = "Old NERC code is required"
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
    await submitAreaOfficeUpdate()
  }

  const submitAreaOfficeUpdate = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    if (!id) {
      notify("error", "Area office ID is missing", {
        description: "Cannot update area office without a valid ID",
        duration: 4000,
      })
      return
    }

    try {
      const areaOfficeId = parseInt(id)
      if (isNaN(areaOfficeId)) {
        notify("error", "Invalid area office ID", {
          description: "The provided area office ID is invalid",
          duration: 4000,
        })
        return
      }

      const updateData: UpdateAreaOfficeRequest = {
        companyId: formData.companyId,
        oldNercCode: formData.oldNercCode,
        newNercCode: formData.newNercCode,
        oldKaedcoCode: formData.oldKaedcoCode,
        newKaedcoCode: formData.newKaedcoCode,
        nameOfOldOAreaffice: formData.nameOfOldOAreaffice,
        nameOfNewOAreaffice: formData.nameOfNewOAreaffice,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }

      const result = await dispatch(updateAreaOffice({ id: areaOfficeId, areaOfficeData: updateData })).unwrap()

      if (result.isSuccess) {
        // Success is handled in the useEffect above
      }
    } catch (error: any) {
      console.error("Failed to update area office:", error)
      // Error is handled in the useEffect above
    }
  }

  const handleReset = () => {
    if (currentAreaOffice) {
      setFormData({
        companyId: currentAreaOffice.company.id,
        oldNercCode: currentAreaOffice.company.nercCode || "",
        newNercCode: currentAreaOffice.newNercCode,
        oldKaedcoCode: "",
        newKaedcoCode: currentAreaOffice.newKaedcoCode,
        nameOfOldOAreaffice: "",
        nameOfNewOAreaffice: currentAreaOffice.nameOfNewOAreaffice,
        latitude: currentAreaOffice.latitude,
        longitude: currentAreaOffice.longitude,
      })
    }
    setFormErrors({})
    dispatch(clearUpdateState())
  }

  const handleCancel = () => {
    router.push("/assets-management/area-offices") // Navigate back to area offices list
  }

  const isFormValid = (): boolean => {
    return (
      formData.companyId !== 0 &&
      formData.nameOfNewOAreaffice.trim() !== "" &&
      formData.newKaedcoCode.trim() !== "" &&
      formData.newNercCode.trim() !== "" &&
      formData.nameOfOldOAreaffice.trim() !== "" &&
      formData.oldKaedcoCode.trim() !== "" &&
      formData.oldNercCode.trim() !== "" &&
      formData.latitude !== 0 &&
      formData.longitude !== 0
    )
  }

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUpdateState())
      dispatch(clearCurrentAreaOffice())
    }
  }, [dispatch])

  // Show loading state while fetching area office data
  if (currentAreaOfficeLoading) {
    return (
      <section className="size-full">
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-1 items-center justify-center">
              <div className="text-center">
                {/* <div className="mb-4 size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div> */}
                <p className="text-gray-600">Loading area office data...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state if failed to load area office
  if (currentAreaOfficeError && !currentAreaOffice) {
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
                <h3 className="mb-2 text-lg font-semibold">Failed to load area office</h3>
                <p className="mb-4 text-gray-600">{currentAreaOfficeError}</p>
                <ButtonModule variant="primary" onClick={() => router.push("/assets-management/area-offices")}>
                  Back to Area Offices
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
                <h4 className="text-2xl font-semibold">Update Area Office</h4>
                <p className="text-gray-600">
                  {currentAreaOffice
                    ? `Update details for ${currentAreaOffice.nameOfNewOAreaffice}`
                    : "Update area office details"}
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
                  onClick={submitAreaOfficeUpdate}
                  disabled={!isFormValid() || updateLoading}
                  iconPosition="start"
                >
                  {updateLoading ? "Updating Area Office..." : "Update Area Office"}
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
                    <h3 className="text-lg font-semibold text-gray-900">Area Office Information</h3>
                    <p className="text-sm text-gray-600">Update the required fields to modify the area office</p>
                  </div>

                  {/* Area Office Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Company Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Company Information</h4>
                        <p className="text-sm text-gray-600">Select the company this area office belongs to</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormSelectModule
                          label="Company"
                          name="companyId"
                          value={formData.companyId}
                          onChange={handleInputChange}
                          options={companyOptions}
                          error={formErrors.companyId}
                          required
                        />
                      </div>
                    </div>

                    {/* Section 2: Area Office Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Area Office Details</h4>
                        <p className="text-sm text-gray-600">Update the area office naming and coding information</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Old Area Office Name"
                          name="nameOfOldOAreaffice"
                          type="text"
                          placeholder="Enter old area office name"
                          value={formData.nameOfOldOAreaffice}
                          onChange={handleInputChange}
                          error={formErrors.nameOfOldOAreaffice}
                          required
                        />

                        <FormInputModule
                          label="New Area Office Name"
                          name="nameOfNewOAreaffice"
                          type="text"
                          placeholder="Enter new area office name"
                          value={formData.nameOfNewOAreaffice}
                          onChange={handleInputChange}
                          error={formErrors.nameOfNewOAreaffice}
                          required
                        />

                        <FormInputModule
                          label="Old KAEDCO Code"
                          name="oldKaedcoCode"
                          type="text"
                          placeholder="Enter old KAEDCO code"
                          value={formData.oldKaedcoCode}
                          onChange={handleInputChange}
                          error={formErrors.oldKaedcoCode}
                          required
                        />

                        <FormInputModule
                          label="New KAEDCO Code"
                          name="newKaedcoCode"
                          type="text"
                          placeholder="Enter new KAEDCO code"
                          value={formData.newKaedcoCode}
                          onChange={handleInputChange}
                          error={formErrors.newKaedcoCode}
                          required
                        />

                        <FormInputModule
                          label="Old NERC Code"
                          name="oldNercCode"
                          type="text"
                          placeholder="Enter old NERC code"
                          value={formData.oldNercCode}
                          onChange={handleInputChange}
                          error={formErrors.oldNercCode}
                          required
                        />

                        <FormInputModule
                          label="New NERC Code"
                          name="newNercCode"
                          type="text"
                          placeholder="Enter new NERC code"
                          value={formData.newNercCode}
                          onChange={handleInputChange}
                          error={formErrors.newNercCode}
                          required
                        />
                      </div>
                    </div>

                    {/* Section 3: Geographical Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Geographical Information</h4>
                        <p className="text-sm text-gray-600">Update the geographical coordinates of the area office</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Latitude"
                          name="latitude"
                          type="number"
                          placeholder="Enter latitude (e.g., 12.3456)"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          error={formErrors.latitude}
                          required
                        />

                        <FormInputModule
                          label="Longitude"
                          name="longitude"
                          type="number"
                          placeholder="Enter longitude (e.g., 7.8901)"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          error={formErrors.longitude}
                          required
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
                        {updateLoading ? "Updating Area Office..." : "Update Area Office"}
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

export default UpdateAreaOfficePage
