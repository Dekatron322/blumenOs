"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, ArrowLeft, CheckCircle, Edit3, Shield, Tag, Users, XCircle } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearCurrentRole, fetchRoleById, resetUpdateState, updateRole, UpdateRoleRequest } from "lib/redux/roleSlice"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

// Define category options (these should match your backend categories)
const categoryOptions = [
  { value: "ADMINISTRATIVE", label: "Administrative" },
  { value: "OPERATIONAL", label: "Operational" },
  { value: "MANAGERIAL", label: "Managerial" },
  { value: "SUPPORT", label: "Support" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "FINANCIAL", label: "Financial" },
  { value: "CUSTOM", label: "Custom" },
]

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
            <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column Skeleton */}
        <div className="space-y-6 md:col-span-2">
          {[1, 2, 3, 4].map((item) => (
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

const EditRolePage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const roleId = params.id as string

  // Get role details from Redux store
  const { currentRole, currentRoleLoading, updateRoleLoading, updateRoleError, updateRoleSuccess } = useAppSelector(
    (state) => state.roles
  )
  const { user } = useAppSelector((state) => state.auth)

  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [formData, setFormData] = useState<UpdateRoleRequest>({
    name: "",
    description: "",
    category: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch role details when page loads
  useEffect(() => {
    if (roleId) {
      const id = parseInt(roleId)
      if (!isNaN(id)) {
        dispatch(fetchRoleById(id))
      }
    }

    return () => {
      dispatch(clearCurrentRole())
      dispatch(resetUpdateState())
    }
  }, [dispatch, roleId])

  // Populate form with current role data when it's loaded
  useEffect(() => {
    if (currentRole) {
      setFormData({
        name: currentRole.name || "",
        description: currentRole.description || "",
        category: currentRole.category || "",
      })
    }
  }, [currentRole])

  // Handle success notification and redirect
  useEffect(() => {
    if (updateRoleSuccess && currentRole) {
      notify("success", `Role "${formData.name}" has been updated successfully`)

      // Redirect back to role details page after a short delay
      const timer = setTimeout(() => {
        router.push(`/roles/details/${currentRole.id}`)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [updateRoleSuccess, currentRole, formData.name, router])

  // Handle error notification
  useEffect(() => {
    if (updateRoleError) {
      notify("error", updateRoleError)
      setIsSubmitting(false)
    }
  }, [updateRoleError])

  const handleInputChange =
    (field: keyof UpdateRoleRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value
      setFormData((prev) => ({
        ...prev,
        [field]: value,
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

  const handleSelectChange =
    (field: keyof UpdateRoleRequest) =>
    (e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string | number } }) => {
      const value = "target" in e ? e.target.value : e

      setFormData((prev) => ({
        ...prev,
        [field]: String(value),
      }))

      // Clear error when user selects an option
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Role name must be at least 2 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Role name must be less than 100 characters"
    }

    // Validate category
    if (!formData.category.trim()) {
      newErrors.category = "Category is required"
    }

    // Validate description
    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    setTouched({
      name: true,
      description: true,
      category: true,
    })

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    if (!currentRole) {
      notify("error", "Role data not loaded")
      return
    }

    if (currentRole.isSystem) {
      notify("error", "System roles cannot be updated")
      return
    }

    if (!canUpdate) {
      notify("error", "You don't have permission to update roles")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await dispatch(
        updateRole({
          roleId: currentRole.id,
          roleData: formData,
        })
      )

      if (updateRole.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to update role"
        notify("error", errorMessage)
        setIsSubmitting(false)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to update role")
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (currentRole) {
      router.push(`/roles/details/${currentRole.id}`)
    } else {
      router.push("/roles")
    }
  }

  const getError = (field: keyof UpdateRoleRequest): string => {
    return touched[field] ? errors[field] || "" : ""
  }

  const isLoading = currentRoleLoading || isSubmitting

  if (currentRoleLoading) {
    return <LoadingSkeleton />
  }

  if (!currentRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Role Not Found</h1>
          <p className="mb-6 text-gray-600">The role you&apos;re trying to edit doesn&apos;t exist.</p>
          <ButtonModule variant="primary" onClick={() => router.push("/roles")}>
            Back to Roles
          </ButtonModule>
        </div>
      </div>
    )
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
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
                      <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
                      <p className="text-gray-600">Update role information and settings</p>
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

                    {!currentRole.isSystem && canUpdate && (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleSubmit}
                        disabled={isLoading}
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
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="size-4" />
                            Update Role
                          </>
                        )}
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                {/* Main Form Content - 2/3 width */}
                <div className="space-y-6 md:col-span-2">
                  {/* Info message for system roles */}
                  {currentRole.isSystem ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-purple-50 p-6"
                    >
                      <div className="flex items-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-purple-100">
                          <Shield className="size-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-purple-800">System Role</h3>
                          <p className="mt-1 text-purple-700">
                            This is a system role. System roles cannot be modified as they are required for system
                            functionality.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Role Information Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                      >
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                          <Edit3 className="size-5" />
                          Role Information
                        </h2>

                        <div className="space-y-6">
                          {/* Role Name */}
                          <FormInputModule
                            label="Role Name"
                            type="text"
                            name="name"
                            placeholder="Enter role name"
                            value={formData.name}
                            onChange={handleInputChange("name")}
                            required
                            disabled={isLoading || currentRole.isSystem}
                            error={getError("name")}
                          />

                          {/* Role Slug (Read-only) */}
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="mb-2 text-sm font-medium text-gray-700">Role Slug</div>
                            <div className="flex items-center justify-between">
                              <code className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm text-gray-800">
                                {currentRole.slug}
                              </code>
                              <span className="text-xs text-gray-500">Auto-generated, cannot be changed</span>
                            </div>
                          </div>

                          {/* Category */}
                          <FormSelectModule
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleSelectChange("category")}
                            options={[{ value: "", label: "Select category" }, ...categoryOptions]}
                            required
                            disabled={isLoading || currentRole.isSystem}
                            error={getError("category")}
                          />

                          {/* Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <div className="mt-1">
                              <textarea
                                value={formData.description}
                                onChange={handleInputChange("description")}
                                placeholder="Enter a brief description of this role's purpose and responsibilities..."
                                rows={4}
                                className={`
                                  w-full rounded-md border px-3 py-2 text-sm
                                  ${getError("description") ? "border-[#D14343]" : "border-[#E0E0E0]"}
                                  bg-[#F9F9F9] transition-all duration-200 focus:bg-[#FBFAFC] focus:outline-none
                                  focus:ring-2
                                  focus:ring-[#004B23] disabled:bg-gray-100
                                  ${currentRole.isSystem ? "cursor-not-allowed opacity-50" : ""}
                                `}
                                disabled={isLoading || currentRole.isSystem}
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
                          Preview
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="rounded-lg bg-white p-4">
                            <div className="mb-2 text-xs font-medium text-gray-500">Role Name</div>
                            <div className="text-lg font-semibold text-gray-900">{formData.name || "(Not set)"}</div>
                          </div>
                          <div className="rounded-lg bg-white p-4">
                            <div className="mb-2 text-xs font-medium text-gray-500">Category</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {formData.category
                                ? categoryOptions.find((opt) => opt.value === formData.category)?.label ||
                                  formData.category
                                : "(Not set)"}
                            </div>
                          </div>
                          <div className="rounded-lg bg-white p-4 md:col-span-2">
                            <div className="mb-2 text-xs font-medium text-gray-500">Description</div>
                            <div className="text-gray-900">{formData.description || "No description provided"}</div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-6">
                  {/* Role Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Tag className="size-4" />
                      Role Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role ID:</span>
                        <span className="font-semibold text-gray-900">{currentRole.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Original Name:</span>
                        <span className="font-semibold text-gray-900">{currentRole.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Slug:</span>
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800">
                          {currentRole.slug}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className={`font-semibold ${currentRole.isSystem ? "text-purple-600" : "text-blue-600"}`}>
                          {currentRole.isSystem ? "System Role" : "Custom Role"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Editable:</span>
                        <span className={`font-semibold ${currentRole.isSystem ? "text-red-600" : "text-green-600"}`}>
                          {currentRole.isSystem ? "No" : "Yes"}
                        </span>
                      </div>
                      {currentRole.privileges && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Privileges:</span>
                          <span className="font-semibold text-blue-600">{currentRole.privileges.length}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* System Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Shield className="size-4" />
                      System Information
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-xs font-medium text-gray-500">Role Type</div>
                        <div
                          className={`mt-1 text-sm font-medium ${
                            currentRole.isSystem ? "text-purple-600" : "text-blue-600"
                          }`}
                        >
                          {currentRole.isSystem ? "System Role" : "Custom Role"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-xs font-medium text-gray-500">Permissions</div>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {currentRole.privileges?.length || 0} privilege(s)
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <div className="text-xs font-medium text-gray-500">Status</div>
                        <div className="mt-1 text-sm font-medium text-gray-900">Active</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Actions Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Users className="size-4" />
                      Actions
                    </h3>
                    <div className="space-y-3">
                      {!currentRole.isSystem && canUpdate ? (
                        <>
                          <ButtonModule
                            variant="primary"
                            className="w-full justify-center"
                            onClick={handleSubmit}
                            disabled={isLoading}
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
                                Updating Role...
                              </span>
                            ) : (
                              "Update Role"
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
                        </>
                      ) : (
                        <>
                          <ButtonModule
                            variant="secondary"
                            className="w-full justify-center"
                            onClick={handleCancel}
                            disabled={isLoading}
                          >
                            Back to Details
                          </ButtonModule>
                          {currentRole.isSystem && (
                            <div className="rounded-lg bg-red-50 p-3">
                              <p className="text-sm text-red-700">
                                System roles cannot be modified. Please contact an administrator if you need changes.
                              </p>
                            </div>
                          )}
                          {!canUpdate && (
                            <div className="rounded-lg bg-red-50 p-3">
                              <p className="text-sm text-red-700">You don&apos;t have permission to update roles.</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* Help Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Tips</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Keep role names clear and descriptive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Choose appropriate categories for better organization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Add descriptions to explain the role&apos;s purpose</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>System roles cannot be edited for security reasons</span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EditRolePage
