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
  clearCurrentInjectionSubstation,
  clearUpdateState,
  fetchInjectionSubstationById,
  updateInjectionSubstation,
  UpdateInjectionSubstationRequest,
} from "lib/redux/injectionSubstationSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"

interface InjectionSubstationFormData {
  areaOfficeId: number
  nercCode: string
  injectionSubstationCode: string
}

const UpdateInjectionSubstationPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const {
    updateLoading,
    updateError,
    updateSuccess,
    currentInjectionSubstation,
    currentInjectionSubstationLoading,
    currentInjectionSubstationError,
  } = useSelector((state: RootState) => state.injectionSubstations)

  const {
    areaOffices,
    loading: areaOfficesLoading,
    error: areaOfficesError,
  } = useSelector((state: RootState) => state.areaOffices)

  const [formData, setFormData] = useState<InjectionSubstationFormData>({
    areaOfficeId: 0,
    nercCode: "",
    injectionSubstationCode: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch injection substation data and area offices when component mounts or ID changes
  useEffect(() => {
    if (id) {
      const injectionSubstationId = parseInt(id as string)
      if (!isNaN(injectionSubstationId)) {
        dispatch(fetchInjectionSubstationById(injectionSubstationId))
      } else {
        notify("error", "Invalid injection substation ID", {
          description: "The provided injection substation ID is invalid",
          duration: 4000,
        })
        router.push("/assets-management/injection-substations") // Redirect back to injection substations list
      }
    } else {
      notify("error", "Injection substation ID is required", {
        description: "Please provide a valid injection substation ID",
        duration: 4000,
      })
      router.push("/assets-management/injection-substations") // Redirect back to injection substations list
    }

    // Fetch area offices for the dropdown
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )
  }, [dispatch, id, router])

  // Populate form when current injection substation data is loaded
  useEffect(() => {
    if (currentInjectionSubstation) {
      setFormData({
        areaOfficeId: currentInjectionSubstation.areaOffice.id,
        nercCode: currentInjectionSubstation.nercCode,
        injectionSubstationCode: currentInjectionSubstation.injectionSubstationCode,
      })
    }
  }, [currentInjectionSubstation])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Injection substation updated successfully", {
        description: `${formData.injectionSubstationCode} has been updated in the system`,
        duration: 5000,
      })
      // Navigate back to injection substations list after successful update
      setTimeout(() => {
        router.push("/assets-management/injection-substations")
      }, 2000)
    }

    if (updateError) {
      notify("error", "Failed to update injection substation", {
        description: updateError,
        duration: 6000,
      })
    }

    if (currentInjectionSubstationError) {
      notify("error", "Failed to load injection substation data", {
        description: currentInjectionSubstationError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, currentInjectionSubstationError, formData.injectionSubstationCode, router])

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

    // Handle number fields
    let processedValue = value
    if (["areaOfficeId"].includes(name)) {
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

    if (formData.areaOfficeId === 0) {
      errors.areaOfficeId = "Area office is required"
    }

    if (!formData.nercCode.trim()) {
      errors.nercCode = "NERC code is required"
    }

    if (!formData.injectionSubstationCode.trim()) {
      errors.injectionSubstationCode = "Injection substation code is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitInjectionSubstationUpdate()
  }

  const submitInjectionSubstationUpdate = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    if (!id) {
      notify("error", "Injection substation ID is missing", {
        description: "Cannot update injection substation without a valid ID",
        duration: 4000,
      })
      return
    }

    try {
      const injectionSubstationId = parseInt(id)
      if (isNaN(injectionSubstationId)) {
        notify("error", "Invalid injection substation ID", {
          description: "The provided injection substation ID is invalid",
          duration: 4000,
        })
        return
      }

      const updateData: UpdateInjectionSubstationRequest = {
        areaOfficeId: formData.areaOfficeId,
        nercCode: formData.nercCode,
        injectionSubstationCode: formData.injectionSubstationCode,
      }

      const result = await dispatch(
        updateInjectionSubstation({ id: injectionSubstationId, injectionSubstationData: updateData })
      ).unwrap()

      if (result.isSuccess) {
        // Success is handled in the useEffect above
      }
    } catch (error: any) {
      console.error("Failed to update injection substation:", error)
      // Error is handled in the useEffect above
    }
  }

  const handleReset = () => {
    if (currentInjectionSubstation) {
      setFormData({
        areaOfficeId: currentInjectionSubstation.areaOffice.id,
        nercCode: currentInjectionSubstation.nercCode,
        injectionSubstationCode: currentInjectionSubstation.injectionSubstationCode,
      })
    }
    setFormErrors({})
    dispatch(clearUpdateState())
  }

  const handleCancel = () => {
    router.push("/assets-management/injection-substations") // Navigate back to injection substations list
  }

  const isFormValid = (): boolean => {
    return (
      formData.areaOfficeId !== 0 && formData.nercCode.trim() !== "" && formData.injectionSubstationCode.trim() !== ""
    )
  }

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUpdateState())
      dispatch(clearCurrentInjectionSubstation())
    }
  }, [dispatch])

  // Show loading state while fetching injection substation data
  if (currentInjectionSubstationLoading) {
    return (
      <section className="size-full">
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-600">Loading injection substation data...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state if failed to load injection substation
  if (currentInjectionSubstationError && !currentInjectionSubstation) {
    return (
      <section className="size-full">
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
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
                <h3 className="mb-2 text-lg font-semibold">Failed to load injection substation</h3>
                <p className="mb-4 text-gray-600">{currentInjectionSubstationError}</p>
                <ButtonModule variant="primary" onClick={() => router.push("/assets-management/injection-substations")}>
                  Back to Injection Substations
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
                <h4 className="text-2xl font-semibold">Update Injection Substation</h4>
                <p className="text-gray-600">
                  {currentInjectionSubstation
                    ? `Update details for ${currentInjectionSubstation.injectionSubstationCode}`
                    : "Update injection substation details"}
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
                  onClick={submitInjectionSubstationUpdate}
                  disabled={!isFormValid() || updateLoading}
                  iconPosition="start"
                >
                  {updateLoading ? "Updating Injection Substation..." : "Update Injection Substation"}
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
                    <h3 className="text-lg font-semibold text-gray-900">Injection Substation Information</h3>
                    <p className="text-sm text-gray-600">
                      Update the required fields to modify the injection substation
                    </p>
                  </div>

                  {/* Injection Substation Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Area Office Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Area Office Information</h4>
                        <p className="text-sm text-gray-600">
                          Select the area office this injection substation belongs to
                        </p>
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
                          disabled={areaOfficesLoading}
                        />
                        {areaOfficesLoading && <p className="text-sm text-gray-500">Loading area offices...</p>}
                        {areaOfficesError && (
                          <p className="text-sm text-red-500">Error loading area offices: {areaOfficesError}</p>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Injection Substation Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Injection Substation Details</h4>
                        <p className="text-sm text-gray-600">Update the injection substation coding information</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                          label="Injection Substation Code"
                          name="injectionSubstationCode"
                          type="text"
                          placeholder="Enter injection substation code"
                          value={formData.injectionSubstationCode}
                          onChange={handleInputChange}
                          error={formErrors.injectionSubstationCode}
                          required
                        />
                      </div>
                    </div>

                    {/* Current Information Display */}
                    {currentInjectionSubstation && (
                      <div className="space-y-6 rounded-lg bg-blue-50 p-6">
                        <div className="border-b border-blue-200 pb-4">
                          <h4 className="text-lg font-medium text-blue-900">Current Information</h4>
                          <p className="text-sm text-blue-700">
                            This is the current data for this injection substation
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current Area Office</label>
                            <p className="font-semibold text-blue-900">
                              {currentInjectionSubstation.areaOffice.nameOfNewOAreaffice}
                            </p>
                            <p className="text-sm text-blue-700">
                              KAEDCO: {currentInjectionSubstation.areaOffice.newKaedcoCode}
                            </p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current NERC Code</label>
                            <p className="font-semibold text-blue-900">{currentInjectionSubstation.nercCode}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">
                              Current Injection Substation Code
                            </label>
                            <p className="font-semibold text-blue-900">
                              {currentInjectionSubstation.injectionSubstationCode}
                            </p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Company</label>
                            <p className="font-semibold text-blue-900">
                              {currentInjectionSubstation.areaOffice.company.name}
                            </p>
                            <p className="text-sm text-blue-700">
                              NERC: {currentInjectionSubstation.areaOffice.company.nercCode}
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
                        {updateLoading ? "Updating Injection Substation..." : "Update Injection Substation"}
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

export default UpdateInjectionSubstationPage
