"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  FolderPlus,
  Info,
  Layers,
  PlusCircle,
  Tag,
  XCircle,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { FormInputModule } from "components/ui/Input/Input"
import {
  addCategory,
  clearAddCategoryState,
  fetchCustomerCategories,
  selectAddCategoryError,
  selectAddCategoryLoading,
  selectAddCategoryResponse,
  selectAddCategorySuccess,
} from "lib/redux/customersCategoriesSlice"

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

const CreateCategoryPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Get state from Redux store
  const addCategoryLoading = useAppSelector(selectAddCategoryLoading)
  const addCategoryError = useAppSelector(selectAddCategoryError)
  const addCategorySuccess = useAppSelector(selectAddCategorySuccess)
  const addCategoryResponse = useAppSelector(selectAddCategoryResponse)
  const categories = useAppSelector((state) => state.customerCategories.categories)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [isDuplicateName, setIsDuplicateName] = useState(false)

  // Check for duplicate category name
  useEffect(() => {
    const trimmedName = formData.name.trim()

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

    const lowerName = trimmedName.toLowerCase()
    const checkDuplicate = categories.some((cat) => cat.name.toLowerCase() === lowerName)

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
  }, [formData.name, categories, touched.name, errors.name])

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAddCategoryState())
    }
  }, [dispatch])

  // Handle success notification and redirect
  useEffect(() => {
    if (addCategorySuccess && addCategoryResponse) {
      notify("success", `Category "${formData.name}" has been created successfully`)

      // Refresh categories list
      dispatch(fetchCustomerCategories())

      // Redirect to the category's details page after a short delay
      const timer = setTimeout(() => {
        router.push(`/customer-categories`)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [addCategorySuccess, addCategoryResponse, formData.name, router, dispatch])

  // Handle error notification
  useEffect(() => {
    if (addCategoryError) {
      notify("error", addCategoryError)
    }
  }, [addCategoryError])

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

    // Prepare category data
    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    }

    try {
      const result = await dispatch(addCategory(categoryData))

      if (addCategory.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to create category"
        notify("error", errorMessage)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to create category")
    }
  }

  const handleCancel = () => {
    router.push("/customers/categories")
  }

  const getError = (field: keyof typeof formData): string => {
    return touched[field] ? errors[field] || "" : ""
  }

  const isLoading = addCategoryLoading

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
                      <h1 className="text-2xl font-bold text-gray-900">Create New Category</h1>
                      <p className="text-gray-600">Define a new customer category for organizing customers</p>
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="size-4" />
                          Create Category
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
                    <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Layers className="size-5" />
                      Category Information
                    </h2>

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
                      Category Preview
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Category Name</div>
                        <div className="text-lg font-semibold text-gray-900">{formData.name || "(Not set)"}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Type</div>
                        <div className="text-lg font-semibold text-blue-600">Main Category</div>
                      </div>
                      <div className="rounded-lg bg-white p-4 md:col-span-2">
                        <div className="mb-2 text-xs font-medium text-gray-500">Description</div>
                        <div className="text-gray-900">{formData.description || "No description provided"}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Status</div>
                        <div className="text-lg font-semibold text-green-600">Will be Active</div>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-xs font-medium text-gray-500">Sub-Categories</div>
                        <div className="text-lg font-semibold text-gray-900">0 (initially)</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Benefits Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-green-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-900">
                      <BarChart3 className="size-5" />
                      Benefits of Using Categories
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-sm font-medium text-gray-900">Organization</div>
                        <p className="text-sm text-gray-600">Group customers logically for better management</p>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-sm font-medium text-gray-900">Filtering</div>
                        <p className="text-sm text-gray-600">Easily filter and search for specific customer groups</p>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-sm font-medium text-gray-900">Reporting</div>
                        <p className="text-sm text-gray-600">Generate reports by customer category</p>
                      </div>
                      <div className="rounded-lg bg-white p-4">
                        <div className="mb-2 text-sm font-medium text-gray-900">Targeting</div>
                        <p className="text-sm text-gray-600">Target communications and offers to specific groups</p>
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
                      <FolderPlus className="size-4" />
                      Actions
                    </h3>
                    <div className="space-y-3">
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
                            Creating...
                          </span>
                        ) : (
                          "Create Category"
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
                    </div>
                  </motion.div>

                  {/* Help Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Tips for Creating Categories</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Use broad, descriptive names that encompass multiple customer types</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Keep categories distinct to avoid overlap</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Add descriptions to clarify the purpose of the category</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Consider future expansion - will this category scale?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Think about how categories will be used in reports and analytics</span>
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
                      Example Category Names
                    </h3>
                    <div className="space-y-2">
                      <div className="text-sm text-purple-700">Common customer categories:</div>
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
                        <li className="flex items-center gap-2">
                          <div className="size-1 rounded-full bg-purple-400"></div>
                          <span>Non-Profit Organizations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="size-1 rounded-full bg-purple-400"></div>
                          <span>International Partners</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="size-1 rounded-full bg-purple-400"></div>
                          <span>VIP Customers</span>
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
                  {addCategorySuccess && addCategoryResponse && (
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
                        <p>Category created successfully!</p>
                        <div className="mt-2 rounded bg-white p-3">
                          <div className="font-medium">Category ID: {addCategoryResponse.id}</div>
                          <div className="text-xs text-gray-600">Redirecting to category details...</div>
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

export default CreateCategoryPage
