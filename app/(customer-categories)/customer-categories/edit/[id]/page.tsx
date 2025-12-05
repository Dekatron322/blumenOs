"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle,
  Save,
  XCircle,
  FolderPlus,
  Tag,
  Info,
  AlertCircle,
  Layers,
  BarChart3,
  Edit,
  History,
  RefreshCw,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { FormInputModule } from "components/ui/Input/Input"
import {
  editCategory,
  clearEditCategoryState,
  selectEditCategoryLoading,
  selectEditCategoryError,
  selectEditCategorySuccess,
  selectEditCategoryResponse,
  fetchCustomerCategories,
  selectCategoryById,
  selectCategoryExists,
  fetchSubCategoriesByCategoryId,
  selectSubCategoriesByCategoryId,
} from "lib/redux/customersCategoriesSlice"

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-md bg-gray-200"></div>
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

const EditCategoryPage = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()

  // Get categoryId from URL parameters
  const categoryId = params.id ? parseInt(params.id as string) : undefined

  // Get state from Redux store
  const editCategoryLoading = useAppSelector(selectEditCategoryLoading)
  const editCategoryError = useAppSelector(selectEditCategoryError)
  const editCategorySuccess = useAppSelector(selectEditCategorySuccess)
  const editCategoryResponse = useAppSelector(selectEditCategoryResponse)

  // Get the category data
  const category = useAppSelector((state) => (categoryId ? selectCategoryById(categoryId)(state) : null))

  // Get subcategories for this category
  const subCategories = useAppSelector((state) =>
    categoryId ? selectSubCategoriesByCategoryId(categoryId)(state) : []
  )

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const [originalData, setOriginalData] = useState({
    name: "",
    description: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [isDuplicateName, setIsDuplicateName] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Normalized category name and duplicate check
  const trimmedName = formData.name.trim()
  const lowerName = trimmedName.toLowerCase()
  const checkDuplicate = useAppSelector((state) => selectCategoryExists(lowerName, categoryId)(state))

  // Load category data if not available
  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCustomerCategories())
      dispatch(fetchSubCategoriesByCategoryId(categoryId))
    }
  }, [categoryId, dispatch])

  // Initialize form data when category is loaded
  useEffect(() => {
    if (category) {
      const newFormData = {
        name: category.name || "",
        description: category.description || "",
      }
      setFormData(newFormData)
      setOriginalData(newFormData)
    }
  }, [category])

  // Check for changes
  useEffect(() => {
    if (category) {
      const hasNameChanged = formData.name !== originalData.name
      const hasDescriptionChanged = formData.description !== originalData.description
      setHasChanges(hasNameChanged || hasDescriptionChanged)
    }
  }, [formData, originalData, category])

  // Check for duplicate category name (excluding current category)
  useEffect(() => {
    if (!trimmedName) {
      setIsDuplicateName(false)
      if (errors.name === "A category with this name already exists") {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.name
          return newErrors
        })
      }
      return
    }

    setIsDuplicateName(checkDuplicate)

    // Update error if duplicate exists
    if (checkDuplicate && touched.name) {
      setErrors((prev) => ({
        ...prev,
        name: "A category with this name already exists",
      }))
    } else if (errors.name === "A category with this name already exists") {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.name
        return newErrors
      })
    }
  }, [trimmedName, checkDuplicate, touched.name, errors.name])

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearEditCategoryState())
    }
  }, [dispatch])

  // Handle success notification and redirect
  useEffect(() => {
    if (editCategorySuccess && editCategoryResponse) {
      notify("success", `Category "${formData.name}" has been updated successfully`)

      // Refresh categories list
      dispatch(fetchCustomerCategories())

      // Refresh subcategories for this category
      if (categoryId) {
        dispatch(fetchSubCategoriesByCategoryId(categoryId))
      }

      // Update original data to match new state
      setOriginalData({
        name: editCategoryResponse.name || "",
        description: editCategoryResponse.description || "",
      })
      setHasChanges(false)
    }
  }, [editCategorySuccess, editCategoryResponse, formData.name, categoryId, router, dispatch])

  // Handle error notification
  useEffect(() => {
    if (editCategoryError) {
      notify("error", editCategoryError)
    }
  }, [editCategoryError])

  const handleInputChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleResetForm = () => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
      })
      setErrors({})
      setTouched({})
      setIsDuplicateName(false)
      setHasChanges(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Category name must be less than 100 characters"
    } else if (isDuplicateName) {
      newErrors.name = "A category with this name already exists"
    }

    // Validate description
    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    setTouched({
      name: true,
      description: true,
    })

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    if (!categoryId) {
      notify("error", "Category ID is missing")
      return
    }

    if (!hasChanges) {
      notify("info", "No changes detected")
      return
    }

    // Prepare category data
    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    }

    try {
      const result = await dispatch(
        editCategory({
          id: categoryId,
          categoryData,
        })
      )

      if (editCategory.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to update category"
        notify("error", errorMessage)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to update category")
    }
  }

  const handleCancel = () => {
    if (categoryId) {
      router.push(`/customers/categories/details/${categoryId}`)
    } else {
      router.push("/customers/categories")
    }
  }

  const getError = (field: keyof typeof formData): string => {
    return touched[field] ? errors[field] || "" : ""
  }

  const isLoading = editCategoryLoading

  // Show loading skeleton if category is being fetched
  if (!category) {
    return <LoadingSkeleton />
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
                      <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
                      <p className="text-gray-600">
                        Update category: <span className="font-semibold">{category.name}</span>
                      </p>
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
                  {/* Category Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Edit className="size-5" />
                        Edit Category Information
                      </h2>
                      {hasChanges && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          Unsaved Changes
                        </span>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Category Name */}
                      <FormInputModule
                        label="Category Name"
                        type="text"
                        name="name"
                        placeholder="Enter category name (e.g., 'Corporate Clients', 'Retail Customers', 'Government')"
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
                            placeholder="Enter a brief description of this category's purpose and characteristics..."
                            rows={4}
                            className={`
                              w-full rounded-md border px-3 py-2 text-sm
                              ${getError("description") ? "border-[#D14343]" : "border-[#E0E0E0]"}
                              bg-[#F9F9F9] transition-all duration-200 focus:bg-[#FBFAFC] focus:outline-none
                              focus:ring-2
                              focus:ring-[#0a0a0a] disabled:bg-gray-100
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

                      {/* Reset Form Button */}
                      {hasChanges && (
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={handleResetForm}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                            disabled={isLoading}
                          >
                            <RefreshCw className="size-4" />
                            Reset to original values
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Current Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                      <History className="size-5" />
                      Current Category Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Category ID</div>
                        <div className="font-mono text-lg font-semibold text-gray-900">{category.id}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Sub-Categories</div>
                        <div className="text-lg font-semibold text-gray-900">{subCategories.length}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4 md:col-span-2">
                        <div className="mb-2 text-xs font-medium text-gray-500">Current Name</div>
                        <div className="text-lg font-semibold text-gray-900">{category.name}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4 md:col-span-2">
                        <div className="mb-2 text-xs font-medium text-gray-500">Current Description</div>
                        <div className="text-gray-900">{category.description || "No description provided"}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Preview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-green-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-900">
                      <CheckCircle className="size-5" />
                      Updated Category Preview
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Updated Name</div>
                        <div className="text-lg font-semibold text-gray-900">{formData.name || "(Not set)"}</div>
                        {formData.name !== originalData.name && (
                          <div className="mt-1 text-xs text-green-600">
                            Changed from: <span className="line-through">{originalData.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Type</div>
                        <div className="text-lg font-semibold text-blue-600">Main Category</div>
                      </div>
                      <div className="rounded-lg bg-white p-4 md:col-span-2">
                        <div className="mb-2 text-xs font-medium text-gray-500">Updated Description</div>
                        <div className="text-gray-900">{formData.description || "No description provided"}</div>
                        {formData.description !== originalData.description && (
                          <div className="mt-1 text-xs text-green-600">
                            Changed from:{" "}
                            <span className="line-through">{originalData.description || "No description"}</span>
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Status</div>
                        <div className="text-lg font-semibold text-green-600">Active</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Sub-Categories</div>
                        <div className="text-lg font-semibold text-gray-900">{subCategories.length}</div>
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
                      <Save className="size-4" />
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
                      <ButtonModule
                        variant="outline"
                        className="w-full justify-center"
                        onClick={handleResetForm}
                        disabled={isLoading || !hasChanges}
                      >
                        <RefreshCw className="mr-2 size-4" />
                        Reset Form
                      </ButtonModule>
                    </div>
                    {!hasChanges && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-center text-sm text-gray-600">No changes to save</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Help Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Editing Tips</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Consider how name changes affect existing customers in this category</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Update descriptions to reflect current business needs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Ensure category names remain distinct to avoid confusion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Sub-categories will remain unchanged when editing the main category</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Review changes carefully before saving</span>
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
                        <span className="text-sm text-gray-600">Changes:</span>
                        <span className={`font-semibold ${hasChanges ? "text-yellow-600" : "text-gray-600"}`}>
                          {hasChanges ? "Unsaved" : "No Changes"}
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
                        <span className="text-sm text-gray-600">Duplicate Check:</span>
                        <span className={`font-semibold ${isDuplicateName ? "text-red-600" : "text-green-600"}`}>
                          {isDuplicateName ? "Exists" : "Unique"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sub-Categories:</span>
                        <span className="font-semibold text-purple-600">{subCategories.length}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Example Categories Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-lg border border-gray-200 bg-purple-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-purple-900">
                      <Tag className="size-4" />
                      Category Naming Examples
                    </h3>
                    <div className="space-y-2">
                      <div className="text-sm text-purple-700">Clear, descriptive names:</div>
                      <ul className="space-y-1 text-sm text-purple-600">
                        <li className="flex items-center gap-2">
                          <div className="size-1 rounded-full bg-purple-400"></div>
                          <span>Corporate Clients</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="size-1 rounded-full bg-purple-400"></div>
                          <span>Retail Customers</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="size-1 rounded-full bg-purple-400"></div>
                          <span>Government Agencies</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="size-1 rounded-full bg-purple-400"></div>
                          <span>Educational Institutions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="size-1 rounded-full bg-purple-400"></div>
                          <span>Healthcare Providers</span>
                        </li>
                      </ul>
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
                  {editCategorySuccess && editCategoryResponse && (
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
                        <p>Category updated successfully!</p>
                        <div className="mt-2 rounded bg-white p-3">
                          <div className="font-medium">Category ID: {editCategoryResponse.id}</div>
                          <div className="text-xs text-gray-600">Changes saved successfully</div>
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

export default EditCategoryPage
