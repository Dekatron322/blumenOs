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
  clearCurrentFeeder,
  clearUpdateState,
  fetchFeederById,
  updateFeeder,
  UpdateFeederRequest,
} from "lib/redux/feedersSlice"
import { fetchInjectionSubstations } from "lib/redux/injectionSubstationSlice"
import { fetchPoles } from "lib/redux/polesSlice"

interface FeederFormData {
  injectionSubstationId: number
  htPoleId: number
  name: string
  nercCode: string
  kaedcoFeederCode: string
  feederVoltage: number
}

const UpdateFeederPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const { updateLoading, updateError, updateSuccess, currentFeeder, currentFeederLoading, currentFeederError } =
    useSelector((state: RootState) => state.feeders)

  const {
    injectionSubstations,
    loading: injectionSubstationsLoading,
    error: injectionSubstationsError,
  } = useSelector((state: RootState) => state.injectionSubstations)

  const { poles, loading: polesLoading, error: polesError } = useSelector((state: RootState) => state.poles)

  const [formData, setFormData] = useState<FeederFormData>({
    injectionSubstationId: 0,
    htPoleId: 0,
    name: "",
    nercCode: "",
    kaedcoFeederCode: "",
    feederVoltage: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch injection substations and poles on component mount
  useEffect(() => {
    dispatch(
      fetchInjectionSubstations({
        pageNumber: 1,
        pageSize: 100,
      })
    )
    dispatch(
      fetchPoles({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  // Fetch feeder data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      const feederId = parseInt(id as string)
      if (!isNaN(feederId)) {
        dispatch(fetchFeederById(feederId))
      } else {
        notify("error", "Invalid feeder ID", {
          description: "The provided feeder ID is invalid",
          duration: 4000,
        })
        router.push("/assets-management/feeders")
      }
    } else {
      notify("error", "Feeder ID is required", {
        description: "Please provide a valid feeder ID",
        duration: 4000,
      })
      router.push("/assets-management/feeders")
    }
  }, [dispatch, id, router])

  // Populate form when current feeder data is loaded
  useEffect(() => {
    if (currentFeeder) {
      setFormData({
        injectionSubstationId: currentFeeder.injectionSubstation?.id || 0,
        htPoleId: currentFeeder.htPole?.id || 0,
        name: currentFeeder.name || "",
        nercCode: currentFeeder.nercCode || "",
        kaedcoFeederCode: currentFeeder.kaedcoFeederCode || "",
        feederVoltage: currentFeeder.feederVoltage || 0,
      })
    }
  }, [currentFeeder])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Feeder updated successfully", {
        description: `${formData.name} has been updated in the system`,
        duration: 5000,
      })
      setTimeout(() => {
        router.push("/assets-management/feeders")
      }, 2000)
    }

    if (updateError) {
      notify("error", "Failed to update feeder", {
        description: updateError,
        duration: 6000,
      })
    }

    if (currentFeederError) {
      notify("error", "Failed to load feeder data", {
        description: currentFeederError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, currentFeederError, formData.name, router])

  // Injection substation options from fetched data
  const injectionSubstationOptions = [
    { value: 0, label: "Select injection substation" },
    ...injectionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.injectionSubstationCode} (${substation.nercCode}) - ${substation.areaOffice.nameOfNewOAreaffice}`,
    })),
  ]

  // HT Pole options from fetched data
  const htPoleOptions = [
    { value: 0, label: "Select HT pole" },
    ...poles.map((pole) => ({
      value: pole.id,
      label: `${pole.htPoleNumber}`,
    })),
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (["injectionSubstationId", "htPoleId", "feederVoltage"].includes(name)) {
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

    if (formData.injectionSubstationId === 0) {
      errors.injectionSubstationId = "Injection substation is required"
    }

    if (formData.htPoleId === 0) {
      errors.htPoleId = "HT pole is required"
    }

    if (!formData.name.trim()) {
      errors.name = "Feeder name is required"
    }

    if (!formData.nercCode.trim()) {
      errors.nercCode = "NERC code is required"
    }

    if (!formData.kaedcoFeederCode.trim()) {
      errors.kaedcoFeederCode = "KAEDCO feeder code is required"
    }

    if (formData.feederVoltage === 0) {
      errors.feederVoltage = "Feeder voltage is required"
    } else if (formData.feederVoltage < 0) {
      errors.feederVoltage = "Feeder voltage must be a positive number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitFeederUpdate()
  }

  const submitFeederUpdate = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    if (!id) {
      notify("error", "Feeder ID is missing", {
        description: "Cannot update feeder without a valid ID",
        duration: 4000,
      })
      return
    }

    try {
      const feederId = parseInt(id)
      if (isNaN(feederId)) {
        notify("error", "Invalid feeder ID", {
          description: "The provided feeder ID is invalid",
          duration: 4000,
        })
        return
      }

      const updateData: UpdateFeederRequest = {
        injectionSubstationId: formData.injectionSubstationId,
        htPoleId: formData.htPoleId,
        name: formData.name,
        nercCode: formData.nercCode,
        kaedcoFeederCode: formData.kaedcoFeederCode,
        feederVoltage: formData.feederVoltage,
      }

      const result = await dispatch(updateFeeder({ id: feederId, feederData: updateData })).unwrap()

      if (result.isSuccess) {
        // Success is handled in the useEffect above
      }
    } catch (error: any) {
      console.error("Failed to update feeder:", error)
      // Error is handled in the useEffect above
    }
  }

  const handleReset = () => {
    if (currentFeeder) {
      setFormData({
        injectionSubstationId: currentFeeder.injectionSubstation?.id || 0,
        htPoleId: currentFeeder.htPole?.id || 0,
        name: currentFeeder.name || "",
        nercCode: currentFeeder.nercCode || "",
        kaedcoFeederCode: currentFeeder.kaedcoFeederCode || "",
        feederVoltage: currentFeeder.feederVoltage || 0,
      })
    }
    setFormErrors({})
    dispatch(clearUpdateState())
  }

  const handleCancel = () => {
    router.push("/assets-management/feeders")
  }

  const isFormValid = (): boolean => {
    return (
      formData.injectionSubstationId !== 0 &&
      formData.htPoleId !== 0 &&
      formData.name.trim() !== "" &&
      formData.nercCode.trim() !== "" &&
      formData.kaedcoFeederCode.trim() !== "" &&
      formData.feederVoltage !== 0
    )
  }

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUpdateState())
      dispatch(clearCurrentFeeder())
    }
  }, [dispatch])

  // Show loading state while fetching feeder data
  if (currentFeederLoading) {
    return (
      <section className="size-full">
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-600">Loading feeder data...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state if failed to load feeder
  if (currentFeederError && !currentFeeder) {
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
                <h3 className="mb-2 text-lg font-semibold">Failed to load feeder</h3>
                <p className="mb-4 text-gray-600">{currentFeederError}</p>
                <ButtonModule variant="primary" onClick={() => router.push("/assets-management/feeders")}>
                  Back to Feeders
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
                <h4 className="text-2xl font-semibold">Update Feeder</h4>
                <p className="text-gray-600">
                  {currentFeeder ? `Update details for ${currentFeeder.name}` : "Update feeder details"}
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
                  onClick={submitFeederUpdate}
                  disabled={!isFormValid() || updateLoading}
                >
                  {updateLoading ? "Updating Feeder..." : "Update Feeder"}
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
                    <h3 className="text-lg font-semibold text-gray-900">Feeder Information</h3>
                    <p className="text-sm text-gray-600">Update the required fields to modify the feeder</p>
                  </div>

                  {/* Feeder Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Associated Assets */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Associated Assets</h4>
                        <p className="text-sm text-gray-600">
                          Select the injection substation and HT pole this feeder belongs to
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                          label="HT Pole"
                          name="htPoleId"
                          value={formData.htPoleId}
                          onChange={handleInputChange}
                          options={htPoleOptions}
                          error={formErrors.htPoleId}
                          required
                          disabled={polesLoading}
                        />
                      </div>
                      {injectionSubstationsLoading && (
                        <p className="text-sm text-gray-500">Loading injection substations...</p>
                      )}
                      {polesLoading && <p className="text-sm text-gray-500">Loading HT poles...</p>}
                    </div>

                    {/* Section 2: Feeder Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Feeder Details</h4>
                        <p className="text-sm text-gray-600">
                          Update the feeder identification and technical information
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Feeder Name"
                          name="name"
                          type="text"
                          placeholder="Enter feeder name"
                          value={formData.name}
                          onChange={handleInputChange}
                          error={formErrors.name}
                          required
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
                        />

                        <FormInputModule
                          label="KAEDCO Feeder Code"
                          name="kaedcoFeederCode"
                          type="text"
                          placeholder="Enter KAEDCO feeder code"
                          value={formData.kaedcoFeederCode}
                          onChange={handleInputChange}
                          error={formErrors.kaedcoFeederCode}
                          required
                        />

                        <FormInputModule
                          label="Feeder Voltage (V)"
                          name="feederVoltage"
                          type="number"
                          placeholder="Enter feeder voltage"
                          value={formData.feederVoltage}
                          onChange={handleInputChange}
                          error={formErrors.feederVoltage}
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
                        {updateLoading ? "Updating Feeder..." : "Update Feeder"}
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

export default UpdateFeederPage
