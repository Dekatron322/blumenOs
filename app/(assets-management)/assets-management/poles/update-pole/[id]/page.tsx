"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearCurrentPole, clearUpdateState, fetchPoleById, updatePole, UpdatePoleRequest } from "lib/redux/polesSlice"

interface PoleFormData {
  htPoleNumber: string
}

const UpdatePolePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const { updateLoading, updateError, updateSuccess, currentPole, currentPoleLoading, currentPoleError } = useSelector(
    (state: RootState) => state.poles
  )

  const [formData, setFormData] = useState<PoleFormData>({
    htPoleNumber: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch pole data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      const poleId = parseInt(id as string)
      if (!isNaN(poleId)) {
        dispatch(fetchPoleById(poleId))
      } else {
        notify("error", "Invalid HT Pole ID", {
          description: "The provided HT Pole ID is invalid",
          duration: 4000,
        })
        router.push("/assets-management/poles") // Redirect back to poles list
      }
    } else {
      notify("error", "HT Pole ID is required", {
        description: "Please provide a valid HT Pole ID",
        duration: 4000,
      })
      router.push("/assets-management/poles") // Redirect back to poles list
    }
  }, [dispatch, id, router])

  // Populate form when current pole data is loaded
  useEffect(() => {
    if (currentPole) {
      setFormData({
        htPoleNumber: currentPole.htPoleNumber,
      })
    }
  }, [currentPole])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "HT Pole updated successfully", {
        description: `${formData.htPoleNumber} has been updated in the system`,
        duration: 5000,
      })
      // Navigate back to poles list after successful update
      setTimeout(() => {
        router.push("/assets-management/poles")
      }, 2000)
    }

    if (updateError) {
      notify("error", "Failed to update HT Pole", {
        description: updateError,
        duration: 6000,
      })
    }

    if (currentPoleError) {
      notify("error", "Failed to load HT Pole data", {
        description: currentPoleError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, currentPoleError, formData.htPoleNumber, router])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.htPoleNumber.trim()) {
      errors.htPoleNumber = "HT Pole number is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitPoleUpdate()
  }

  const submitPoleUpdate = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    if (!id) {
      notify("error", "HT Pole ID is missing", {
        description: "Cannot update HT Pole without a valid ID",
        duration: 4000,
      })
      return
    }

    try {
      const poleId = parseInt(id)
      if (isNaN(poleId)) {
        notify("error", "Invalid HT Pole ID", {
          description: "The provided HT Pole ID is invalid",
          duration: 4000,
        })
        return
      }

      const updateData: UpdatePoleRequest = {
        htPoleNumber: formData.htPoleNumber,
      }

      const result = await dispatch(updatePole({ id: poleId, poleData: updateData })).unwrap()

      if (result.isSuccess) {
        // Success is handled in the useEffect above
      }
    } catch (error: any) {
      console.error("Failed to update HT Pole:", error)
      // Error is handled in the useEffect above
    }
  }

  const handleReset = () => {
    if (currentPole) {
      setFormData({
        htPoleNumber: currentPole.htPoleNumber,
      })
    }
    setFormErrors({})
    dispatch(clearUpdateState())
  }

  const handleCancel = () => {
    router.push("/assets-management/poles") // Navigate back to poles list
  }

  const isFormValid = (): boolean => {
    return formData.htPoleNumber.trim() !== ""
  }

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUpdateState())
      dispatch(clearCurrentPole())
    }
  }, [dispatch])

  // Show loading state while fetching pole data
  if (currentPoleLoading) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-600">Loading HT Pole data...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Show error state if failed to load pole
  if (currentPoleError && !currentPole) {
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
                <h3 className="mb-2 text-lg font-semibold">Failed to load HT Pole</h3>
                <p className="mb-4 text-gray-600">{currentPoleError}</p>
                <ButtonModule variant="primary" onClick={() => router.push("/assets-management/poles")}>
                  Back to HT Poles
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
                <h4 className="text-2xl font-semibold">Update HT Pole</h4>
                <p className="text-gray-600">
                  {currentPole ? `Update details for ${currentPole.htPoleNumber}` : "Update HT Pole details"}
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
                  onClick={submitPoleUpdate}
                  disabled={!isFormValid() || updateLoading}
                >
                  {updateLoading ? "Updating HT Pole..." : "Update HT Pole"}
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
                    <h3 className="text-lg font-semibold text-gray-900">HT Pole Information</h3>
                    <p className="text-sm text-gray-600">Update the required field to modify the HT Pole</p>
                  </div>

                  {/* Pole Form */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section: Pole Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Pole Details</h4>
                        <p className="text-sm text-gray-600">Update the HT Pole identification information</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormInputModule
                          label="HT Pole Number"
                          name="htPoleNumber"
                          type="text"
                          placeholder="Enter HT Pole number"
                          value={formData.htPoleNumber}
                          onChange={handleInputChange}
                          error={formErrors.htPoleNumber}
                          required
                        />
                      </div>
                    </div>

                    {/* Current Pole Information */}
                    {currentPole && (
                      <div className="space-y-6 rounded-lg bg-blue-50 p-6">
                        <div className="border-b border-blue-200 pb-4">
                          <h4 className="text-lg font-medium text-blue-900">Current Information</h4>
                          <p className="text-sm text-blue-700">This is the current data for this HT Pole</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">Current HT Pole Number</label>
                            <p className="font-semibold text-blue-900">{currentPole.htPoleNumber}</p>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-4">
                            <label className="text-sm font-medium text-blue-600">HT Pole ID</label>
                            <p className="font-semibold text-blue-900">{currentPole.id}</p>
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
                        {updateLoading ? "Updating HT Pole..." : "Update HT Pole"}
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

export default UpdatePolePage
