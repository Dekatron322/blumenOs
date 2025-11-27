"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  fetchOutageById,
  updateOutage,
  UpdateOutageRequest,
  clearCurrentOutage,
  clearUpdateOutageState,
} from "lib/redux/outageSlice"

interface UpdateOutageFormData {
  status: string
  priority: string
  details: string
  resolutionSummary: string
  restoredAt: string
}

const UpdateOutage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const outageId = parseInt(id || "0")

  const { currentOutage, currentOutageLoading, currentOutageError, updateError, updateSuccess } = useSelector(
    (state: RootState) => state.outages
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<UpdateOutageFormData>({
    status: "",
    priority: "",
    details: "",
    resolutionSummary: "",
    restoredAt: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (outageId) {
      dispatch(fetchOutageById(outageId))
    }

    return () => {
      dispatch(clearCurrentOutage())
      dispatch(clearUpdateOutageState())
    }
  }, [dispatch, outageId])

  useEffect(() => {
    if (currentOutage) {
      setFormData({
        status: currentOutage.status ? String(currentOutage.status) : "",
        priority: currentOutage.priority ? String(currentOutage.priority) : "",
        details: currentOutage.details || "",
        resolutionSummary: currentOutage.resolutionSummary || "",
        restoredAt: currentOutage.restoredAt ? new Date(currentOutage.restoredAt).toISOString().slice(0, 16) : "",
      })
    }
  }, [currentOutage])

  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Outage updated successfully", {
        description: `Outage ${currentOutage?.referenceCode} has been updated`,
        duration: 5000,
      })
      // Navigate back to outages list or stay on page
      setTimeout(() => {
        router.push("/outage-management/view-outages")
      }, 2000)
    }

    if (updateError) {
      notify("error", "Failed to update outage", {
        description: updateError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, currentOutage?.referenceCode, router])

  // Options for dropdowns
  const statusOptions = [
    { value: "", label: "Select status" },
    { value: "1", label: "Reported" },
    { value: "2", label: "Investigating" },
    { value: "3", label: "Repairing" },
    { value: "4", label: "Restored" },
    { value: "5", label: "Cancelled" },
  ]

  const priorityOptions = [
    { value: "", label: "Select priority" },
    { value: "1", label: "Low" },
    { value: "2", label: "Medium" },
    { value: "3", label: "High" },
    { value: "4", label: "Critical" },
  ]

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | number } }
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

    if (!formData.status) {
      errors.status = "Status is required"
    }

    if (!formData.priority) {
      errors.priority = "Priority is required"
    }

    if (!formData.details.trim()) {
      errors.details = "Outage details are required"
    } else if (formData.details.length < 10) {
      errors.details = "Details must be at least 10 characters long"
    }

    if (formData.status === "4" && !formData.resolutionSummary.trim()) {
      errors.resolutionSummary = "Resolution summary is required when status is Restored"
    } else if (formData.status === "4" && formData.resolutionSummary.length < 10) {
      errors.resolutionSummary = "Resolution summary must be at least 10 characters long"
    }

    if (formData.status === "4" && !formData.restoredAt) {
      errors.restoredAt = "Restoration time is required when status is Restored"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitOutageUpdate = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const updateData: UpdateOutageRequest = {
        status: Number(formData.status),
        priority: Number(formData.priority),
        details: formData.details,
        ...(formData.resolutionSummary && { resolutionSummary: formData.resolutionSummary }),
        ...(formData.restoredAt && { restoredAt: new Date(formData.restoredAt).toISOString() }),
      }

      await dispatch(updateOutage({ id: outageId, updateData })).unwrap()
    } catch (error: any) {
      console.error("Failed to update outage:", error)
      // Error handling is done in the useEffect above
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitOutageUpdate()
  }

  const handleReset = () => {
    if (currentOutage) {
      setFormData({
        status: currentOutage.status ? String(currentOutage.status) : "",
        priority: currentOutage.priority ? String(currentOutage.priority) : "",
        details: currentOutage.details || "",
        resolutionSummary: currentOutage.resolutionSummary || "",
        restoredAt: currentOutage.restoredAt ? new Date(currentOutage.restoredAt).toISOString().slice(0, 16) : "",
      })
    }
    setFormErrors({})
  }

  const handleCancel = () => {
    router.push("/outage-management/view-outages")
  }

  const isFormValid = (): boolean => {
    return (
      formData.status !== "" &&
      formData.priority !== "" &&
      formData.details.trim() !== "" &&
      (formData.status !== "4" || (formData.resolutionSummary.trim() !== "" && formData.restoredAt !== ""))
    )
  }

  if (currentOutageLoading) {
    return (
      <section className="size-full">
        <DashboardNav />
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Loading outage details...</p>
          </div>
        </div>
      </section>
    )
  }

  if (currentOutageError) {
    return (
      <section className="size-full">
        <DashboardNav />
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to load outage</h3>
            <p className="mb-4 text-gray-600">{currentOutageError}</p>
            <ButtonModule variant="primary" onClick={() => router.push("/outage-management/view-outage")}>
              Back to Outages
            </ButtonModule>
          </div>
        </div>
      </section>
    )
  }

  if (!currentOutage) {
    return (
      <section className="size-full">
        <DashboardNav />
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Outage not found</h3>
            <p className="mb-4 text-gray-600">The requested outage could not be found.</p>
            <ButtonModule variant="primary" onClick={() => router.push("/outage-management/view-outages")}>
              Back to Outages
            </ButtonModule>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="size-full">
      <DashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          {/* Page Header */}
          <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
            <div className="mx-auto w-full px-16 py-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-[#f9f9f9] text-gray-700 hover:bg-[#f9f9f9]"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    aria-label="Go back"
                    title="Go back"
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
                      ></path>
                    </svg>
                  </motion.button>

                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Update Outage</h1>
                    <p className="text-gray-600">Review outage details and update status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto mt-10 flex w-full flex-col">
            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg bg-white p-6 shadow-sm"
                >
                  {/* Outage Summary */}
                  <div className="mb-6 rounded-lg bg-blue-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-blue-800">Outage Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Reference:</span> {currentOutage.referenceCode}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Title:</span> {currentOutage.title}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Location:</span>{" "}
                        {currentOutage.distributionSubstationName} - {currentOutage.feederName}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Reported:</span>{" "}
                        {new Date(currentOutage.reportedAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Affected Customers:</span>{" "}
                        {currentOutage.affectedCustomerCount}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Customer Reports:</span>{" "}
                        {currentOutage.customerReportCount}
                      </div>
                    </div>
                  </div>

                  {/* Update Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status and Priority */}
                    <div className="rounded-lg bg-[#f9f9f9] p-4">
                      <h4 className="mb-4 font-medium text-gray-900">Status & Priority</h4>
                      <div className="grid grid-cols-2 gap-4">
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
                          label="Priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          options={priorityOptions}
                          error={formErrors.priority}
                          required
                        />
                      </div>
                    </div>

                    {/* Outage Details */}
                    <div className="rounded-lg bg-[#f9f9f9] p-4">
                      <h4 className="mb-4 font-medium text-gray-900">Outage Details</h4>
                      <FormInputModule
                        label="Outage Details"
                        name="details"
                        type="textarea"
                        placeholder="Provide detailed description of the outage, current situation, and repair progress"
                        value={formData.details}
                        onChange={handleInputChange}
                        error={formErrors.details}
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Resolution Information (Conditional) */}
                    {(formData.status === "4" || currentOutage.status === 4) && (
                      <div className="rounded-lg bg-green-50 p-4">
                        <h4 className="mb-4 font-medium text-gray-900">Resolution Information</h4>

                        <div className="mb-4">
                          <FormInputModule
                            label="Resolution Summary"
                            name="resolutionSummary"
                            placeholder="Describe how the outage was resolved, what repairs were made, and any follow-up actions needed"
                            value={formData.resolutionSummary}
                            onChange={handleInputChange}
                            error={formErrors.resolutionSummary}
                            required={formData.status === "4"}
                            type={""}
                          />
                        </div>

                        <FormInputModule
                          label="Restoration Time"
                          name="restoredAt"
                          type="datetime-local"
                          value={formData.restoredAt}
                          onChange={handleInputChange}
                          error={formErrors.restoredAt}
                          required={formData.status === "4"}
                          placeholder={""}
                        />
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
                                  <span key={index}>{error}</span>
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
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        type="button"
                      >
                        Cancel
                      </ButtonModule>
                      <ButtonModule
                        variant="outline"
                        size="lg"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        type="button"
                      >
                        Reset
                      </ButtonModule>
                      <ButtonModule variant="primary" size="lg" type="submit" disabled={!isFormValid() || isSubmitting}>
                        {isSubmitting ? "Updating Outage..." : "Update Outage"}
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

export default UpdateOutage
