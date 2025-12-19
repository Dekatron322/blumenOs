"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Briefcase,
  Building,
  CheckCircle,
  Edit,
  Info,
  Save,
  XCircle,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import type { RootState } from "lib/redux/store"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import {
  clearCurrentDepartment,
  clearOperationState,
  fetchDepartmentById,
  selectCurrentDepartment,
  selectCurrentDepartmentError,
  selectCurrentDepartmentLoading,
  selectOperationError,
  selectOperationLoading,
  selectOperationSuccess,
  updateDepartment,
  UpdateDepartmentRequest,
} from "lib/redux/departmentSlice"
import { type Company, fetchCompanies } from "lib/redux/companySlice"

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-9 rounded-md bg-gray-200"></div>
          <div>
            <div className="mb-2 h-8 w-64 rounded bg-gray-200"></div>
            <div className="h-4 w-40 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-28 rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column Skeleton */}
        <div className="space-y-6 md:col-span-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 h-6 w-48 rounded bg-gray-200"></div>
              <div className="space-y-4">
                <div className="h-12 w-full rounded bg-gray-200"></div>
                <div className="h-12 w-full rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6">
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const EditDepartmentPage = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()

  // Get the department ID from the URL parameters
  const departmentId = Number(params.id)

  // Get state from Redux store
  const operationLoading = useAppSelector(selectOperationLoading)
  const operationError = useAppSelector(selectOperationError)
  const operationSuccess = useAppSelector(selectOperationSuccess)
  const currentDepartment = useAppSelector(selectCurrentDepartment)
  const currentDepartmentLoading = useAppSelector(selectCurrentDepartmentLoading)
  const currentDepartmentError = useAppSelector(selectCurrentDepartmentError)
  const { companies, companiesLoading } = useAppSelector((state: RootState) => state.companies)

  const [formData, setFormData] = useState<UpdateDepartmentRequest>({
    id: departmentId,
    companyId: 0,
    name: "",
    description: "",
    isActive: true,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearOperationState())
      dispatch(clearCurrentDepartment())
    }
  }, [dispatch])

  // Fetch department data when component mounts or departmentId changes
  useEffect(() => {
    if (departmentId && !isNaN(departmentId)) {
      dispatch(fetchDepartmentById(departmentId))
    }
  }, [departmentId, dispatch])

  // Fetch companies for the company select
  useEffect(() => {
    dispatch(
      fetchCompanies({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  // Update form data when current department is loaded
  useEffect(() => {
    if (currentDepartment) {
      const newFormData = {
        id: currentDepartment.id,
        companyId: currentDepartment.companyId,
        name: currentDepartment.name,
        description: currentDepartment.description,
        isActive: currentDepartment.isActive,
      }

      setFormData(newFormData)
      setHasChanges(false)
    }
  }, [currentDepartment])

  // Check for changes in form data
  useEffect(() => {
    if (currentDepartment) {
      const hasFormChanged =
        formData.companyId !== currentDepartment.companyId ||
        formData.name !== currentDepartment.name ||
        formData.description !== currentDepartment.description ||
        formData.isActive !== currentDepartment.isActive

      setHasChanges(hasFormChanged)
    }
  }, [formData, currentDepartment])

  // Handle success notification and redirect
  useEffect(() => {
    if (operationSuccess) {
      notify("success", `Department "${formData.name}" has been updated successfully`)

      // Redirect to the departments page after a short delay
      const timer = setTimeout(() => {
        router.push("/departments")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [operationSuccess, formData.name, router, dispatch])

  // Handle error notification
  useEffect(() => {
    if (operationError) {
      notify("error", operationError)
    }
  }, [operationError])

  // Handle department fetch error
  useEffect(() => {
    if (currentDepartmentError) {
      notify("error", currentDepartmentError)
      // Redirect if department not found
      const timer = setTimeout(() => {
        router.push("/departments")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [currentDepartmentError, router])

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = field === "isActive" ? (e.target as HTMLSelectElement).value === "true" : e.target.value

      setFormData((prev) => ({
        ...prev,
        [field]: field === "companyId" ? parseInt(e.target.value) || 0 : value,
      }))

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }))
      }

      // Mark field as touched
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }))
    }

  const toggleActiveStatus = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }))

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      isActive: true,
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate company
    if (!formData.companyId || formData.companyId <= 0) {
      newErrors.companyId = "Please select a company"
    }

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Department name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Department name must be at least 2 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Department name must be less than 100 characters"
    }

    // Validate description
    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    setTouched({
      companyId: true,
      name: true,
      description: true,
      isActive: true,
    })

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    if (!hasChanges) {
      notify("info", "No changes detected")
      return
    }

    // Prepare department data
    const departmentData: UpdateDepartmentRequest = {
      id: formData.id,
      companyId: formData.companyId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
    }

    try {
      const result = await dispatch(updateDepartment(departmentData))

      if (updateDepartment.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to update department"
        notify("error", errorMessage)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to update department")
    }
  }

  const handleCancel = () => {
    router.push("/departments")
  }

  const getError = (field: keyof typeof formData): string => {
    return touched[field] ? errors[field] || "" : ""
  }

  const isLoading = operationLoading || currentDepartmentLoading || companiesLoading

  // Get selected company name
  const selectedCompany = companies.find((company: Company) => company.id === formData.companyId)
  const selectedCompanyName = selectedCompany ? selectedCompany.name : ""

  const companyOptions = [
    { value: 0, label: "Select a company" },
    ...companies.map((company: Company) => ({ value: company.id, label: company.name })),
  ]

  // Show loading skeleton if loading
  if (currentDepartmentLoading) {
    return <LoadingSkeleton />
  }

  // Show error state if department not found
  if (currentDepartmentError || !currentDepartment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <DashboardNav />
        <div className="container mx-auto p-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto size-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-red-900">Department Not Found</h2>
            <p className="mt-2 text-red-700">
              {currentDepartmentError || "The department you are trying to edit does not exist or has been deleted."}
            </p>
            <ButtonModule variant="secondary" className="mt-6" onClick={() => router.push("/departments")}>
              Return to Departments
            </ButtonModule>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            {/* Header */}
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-16 py-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      aria-label="Go back"
                      title="Go back"
                    >
                      <ArrowLeft className="size-5" />
                    </motion.button>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Edit Department</h1>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>Editing: {currentDepartment?.name}</span>
                        <span className="font-mono text-sm text-gray-500">(ID: #{currentDepartment?.id})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <XCircle className="size-4" />
                      Cancel
                    </ButtonModule>

                    <ButtonModule
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleSubmit}
                      disabled={isLoading || !hasChanges}
                    >
                      {isLoading ? (
                        <>
                          <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="size-4" />
                          Save Changes
                        </>
                      )}
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                {/* Main Form Content - 2/3 width */}
                <div className="space-y-6 md:col-span-2">
                  {/* Company & Department Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Edit className="size-5" />
                      Edit Department Information
                    </h2>

                    <div className="space-y-6">
                      {/* Department ID (Read-only) */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700">Department ID</label>
                        <div className="mt-1">
                          <input
                            type="text"
                            value={`#${currentDepartment?.id}`}
                            disabled
                            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-gray-600"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            This ID is automatically assigned and cannot be changed
                          </p>
                        </div>
                      </div> */}

                      {/* Company Selection */}
                      <FormSelectModule
                        label="Company"
                        name="companyId"
                        value={formData.companyId}
                        onChange={(e) => handleInputChange("companyId")(e as any)}
                        options={companyOptions}
                        required
                        disabled={isLoading}
                        error={getError("companyId")}
                      />

                      {/* Department Name */}
                      <FormInputModule
                        label="Department Name"
                        type="text"
                        name="name"
                        placeholder="Enter department name (e.g., 'Engineering', 'Sales', 'Human Resources')"
                        value={formData.name}
                        onChange={handleInputChange("name")}
                        required
                        disabled={isLoading}
                        error={getError("name")}
                      />

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <div className="mt-1">
                          <textarea
                            value={formData.description}
                            onChange={handleInputChange("description")}
                            placeholder="Enter a brief description of this department's purpose, responsibilities, and functions..."
                            rows={4}
                            className={`
                              w-full rounded-md border px-3 py-2 text-sm
                              ${getError("description") ? "border-[#D14343]" : "border-[#E0E0E0]"}
                              bg-[#F9F9F9] transition-all duration-200 focus:bg-[#FBFAFC] focus:outline-none
                              focus:ring-2
                              focus:ring-[#004B23] disabled:bg-gray-100
                            `}
                            disabled={isLoading}
                            maxLength={500}
                          />
                          {getError("description") && (
                            <p className="mt-1 text-xs text-[#D14343]">{getError("description")}</p>
                          )}
                          <div className="mt-1 flex justify-between text-xs text-gray-500">
                            <span>Optional, but recommended for clarity</span>
                            <span>{formData.description.length}/500 characters</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={toggleActiveStatus}
                            disabled={isLoading}
                            className={`
                              relative inline-flex h-6 w-11 items-center rounded-full
                              ${formData.isActive ? "bg-green-500" : "bg-gray-300"}
                              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                              disabled:opacity-50
                            `}
                          >
                            <span
                              className={`
                                inline-block size-4 transform rounded-full bg-white transition-transform duration-200
                                ${formData.isActive ? "translate-x-6" : "translate-x-1"}
                              `}
                            />
                          </button>
                          <div>
                            <div className="font-medium text-gray-900">{formData.isActive ? "Active" : "Inactive"}</div>
                            <div className="text-xs text-gray-500">
                              {formData.isActive
                                ? "Department is active and available for use"
                                : "Department is inactive and not available for use"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Metadata (Read-only) */}
                      <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Created At</label>
                          <div className="mt-1 font-medium text-gray-900">
                            {currentDepartment?.createdAt
                              ? new Date(currentDepartment.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Last Updated</label>
                          <div className="mt-1 font-medium text-gray-900">
                            {currentDepartment?.lastUpdated
                              ? new Date(currentDepartment.lastUpdated).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Never updated"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Preview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                      <CheckCircle className="size-5" />
                      Department Preview
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Department Name</div>
                        <div className="text-lg font-semibold text-gray-900">{formData.name || "(Not set)"}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Company</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {selectedCompanyName || "(Not selected)"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Company ID</div>
                        <div className="font-mono text-lg font-semibold text-gray-900">
                          {formData.companyId > 0 ? `#${formData.companyId}` : "N/A"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Status</div>
                        <div
                          className={`text-lg font-semibold ${formData.isActive ? "text-green-600" : "text-gray-600"}`}
                        >
                          {formData.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4 md:col-span-2">
                        <div className="mb-2 text-xs font-medium text-gray-500">Description</div>
                        <div className="text-gray-900">{formData.description || "No description provided"}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Original Values Card (for comparison) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-yellow-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-yellow-900">
                      <Building className="size-5" />
                      Original Values
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Original Name</div>
                        <div
                          className={`font-semibold ${
                            formData.name !== currentDepartment?.name ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {currentDepartment?.name || "N/A"}
                          {formData.name !== currentDepartment?.name && <span className="ml-2 text-xs">← Changed</span>}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Original Company</div>
                        <div
                          className={`font-semibold ${
                            formData.companyId !== currentDepartment?.companyId ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {currentDepartment?.companyName || "N/A"}
                          {formData.companyId !== currentDepartment?.companyId && (
                            <span className="ml-2 text-xs">← Changed</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Original Status</div>
                        <div
                          className={`font-semibold ${
                            formData.isActive !== currentDepartment?.isActive ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {currentDepartment?.isActive ? "Active" : "Inactive"}
                          {formData.isActive !== currentDepartment?.isActive && (
                            <span className="ml-2 text-xs">← Changed</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Original Description</div>
                        <div
                          className={`text-sm ${
                            formData.description !== currentDepartment?.description ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {currentDepartment?.description || "No description"}
                          {formData.description !== currentDepartment?.description && (
                            <span className="ml-2 text-xs">← Changed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-6">
                  {/* Actions Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Briefcase className="size-4" />
                      Actions
                    </h3>
                    <div className="space-y-3">
                      <ButtonModule
                        variant="primary"
                        className="w-full justify-center"
                        onClick={handleSubmit}
                        disabled={isLoading || !hasChanges}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          "Save Changes"
                        )}
                      </ButtonModule>
                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Cancel
                      </ButtonModule>
                      {hasChanges && (
                        <div className="rounded-md bg-yellow-50 p-3 text-center">
                          <p className="text-sm font-medium text-yellow-800">You have unsaved changes</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Help Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Tips for Editing Departments</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Review all changes carefully before saving</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Changing the company may affect department assignments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Deactivating a department will make it unavailable for new assignments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Keep descriptions up-to-date for better team understanding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Consider the impact of changes on existing team members and resources</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Status Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Info className="size-4" />
                      Status Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Form Status:</span>
                        <span
                          className={`font-semibold ${
                            Object.keys(errors).length === 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {Object.keys(errors).length === 0 ? "Valid" : "Has Errors"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Company Selected:</span>
                        <span className={`font-semibold ${formData.companyId > 0 ? "text-green-600" : "text-red-600"}`}>
                          {formData.companyId > 0 ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Changes Made:</span>
                        <span className={`font-semibold ${hasChanges ? "text-green-600" : "text-gray-600"}`}>
                          {hasChanges ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name Length:</span>
                        <span
                          className={`font-semibold ${
                            formData.name.length >= 2 ? "text-green-600" : "text-yellow-600"
                          }`}
                        >
                          {formData.name.length}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Description Length:</span>
                        <span
                          className={`font-semibold ${
                            formData.description.length <= 500 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formData.description.length}/500
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Department Status:</span>
                        <span className={`font-semibold ${formData.isActive ? "text-green-600" : "text-gray-600"}`}>
                          {formData.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Department Statistics Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-lg border border-gray-200 bg-purple-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-purple-900">
                      <BarChart3 className="size-4" />
                      Department Information
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-white p-4">
                        <div className="text-sm font-medium text-gray-700">Department ID</div>
                        <div className="mt-1 font-mono text-xl font-bold text-purple-600">#{currentDepartment?.id}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="text-sm font-medium text-gray-700">Created</div>
                        <div className="mt-1 text-gray-900">
                          {currentDepartment?.createdAt
                            ? new Date(currentDepartment.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="text-sm font-medium text-gray-700">Last Updated</div>
                        <div className="mt-1 text-gray-900">
                          {currentDepartment?.lastUpdated
                            ? new Date(currentDepartment.lastUpdated).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Error Display Card */}
                  {Object.keys(errors).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm"
                    >
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-900">
                        <AlertCircle className="size-4" />
                        Validation Issues
                      </h3>
                      <ul className="space-y-2">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field} className="flex items-start gap-2 text-sm text-red-700">
                            <div className="mt-0.5 size-1.5 rounded-full bg-red-400"></div>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Success Preview Card */}
                  {operationSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm"
                    >
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-900">
                        <CheckCircle className="size-4" />
                        Success!
                      </h3>
                      <div className="space-y-2 text-sm text-green-700">
                        <p>Department updated successfully!</p>
                        <div className="mt-2 rounded bg-white p-3">
                          <div className="font-medium">{formData.name}</div>
                          <div className="text-xs text-gray-600">Redirecting to departments list...</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EditDepartmentPage
