"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Edit3, Key, PlusCircle, Shield, Tag, Users, XCircle } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  createRole,
  CreateRoleRequest,
  fetchPrivileges,
  PrivilegeAssignment,
  resetCreateState,
} from "lib/redux/roleSlice"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

// Define privilege action options (Approve and View All removed)
const actionOptions = [
  { value: "1", label: "Create (C)", bit: 1 },
  { value: "2", label: "Read (R)", bit: 2 },
  { value: "4", label: "Update (U)", bit: 4 },
  { value: "8", label: "Delete (D)", bit: 8 },
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

const CreateRolePage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Get role creation state from Redux store
  const { createRoleLoading, createRoleSuccess, createRoleError, createdRole } = useAppSelector((state) => state.roles)
  const { user } = useAppSelector((state) => state.auth)

  // Get privileges from Redux store
  const { privileges, privilegesLoading, privilegesError, privilegesSuccess, privilegesCategories } = useAppSelector(
    (state) => state.roles
  )

  // Temporarily allow creating roles for any authenticated user
  const canCreate = true

  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: "",
    description: "",
    category: "",
    privileges: [],
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [selectedPrivileges, setSelectedPrivileges] = useState<Map<number, Set<number>>>(new Map())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  // Filter privileges based on search and category
  const filteredPrivileges = privileges.filter((privilege) => {
    const matchesSearch =
      privilege.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      privilege.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (privilege.description && privilege.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || privilege.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories from privileges
  const privilegeCategories = privilegesCategories

  // Define category options dynamically from API
  const categoryOptions = privilegeCategories.map((category) => ({
    value: category,
    label: category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, " "),
  }))

  // Fetch privileges on component mount
  useEffect(() => {
    dispatch(fetchPrivileges())
  }, [dispatch])

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetCreateState())
    }
  }, [dispatch])

  // Handle success notification and redirect
  useEffect(() => {
    if (createRoleSuccess && createdRole) {
      notify("success", `Role "${formData.name}" has been created successfully`)

      // Redirect to the newly created role's details page after a short delay
      const timer = setTimeout(() => {
        router.push(`/roles/details/${createdRole.id}`)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [createRoleSuccess, createdRole, formData.name, router])

  // Handle error notification
  useEffect(() => {
    if (createRoleError) {
      notify("error", createRoleError)
    }
  }, [createRoleError])

  // Handle privileges error notification
  useEffect(() => {
    if (privilegesError) {
      notify("error", privilegesError)
    }
  }, [privilegesError])

  const handleInputChange =
    (field: keyof Omit<CreateRoleRequest, "privileges">) =>
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
    (field: keyof Omit<CreateRoleRequest, "privileges">) =>
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

  // Handle privilege selection
  const handlePrivilegeActionToggle = (privilegeId: number, actionBit: number) => {
    setSelectedPrivileges((prev) => {
      // Clone the outer map to avoid mutating previous state
      const newMap = new Map(prev)
      // Clone the inner set so each update uses a fresh instance
      const existingActions = prev.get(privilegeId)
      const actions = new Set<number>(existingActions ?? [])

      if (actions.has(actionBit)) {
        actions.delete(actionBit)
        if (actions.size === 0) {
          newMap.delete(privilegeId)
        } else {
          newMap.set(privilegeId, actions)
        }
      } else {
        actions.add(actionBit)
        newMap.set(privilegeId, actions)
      }

      return newMap
    })
  }

  // Select all available actions for a privilege
  const handleSelectAllActions = (privilegeId: number, availableActions: number) => {
    const privilege = privileges.find((p) => p.id === privilegeId)
    if (!privilege) return

    const actions = new Set<number>()
    actionOptions.forEach((option) => {
      if (privilege.availableActions & option.bit) {
        actions.add(option.bit)
      }
    })

    setSelectedPrivileges((prev) => {
      const newMap = new Map(prev)
      newMap.set(privilegeId, actions)
      return newMap
    })
  }

  // Clear all actions for a privilege
  const handleClearAllActions = (privilegeId: number) => {
    setSelectedPrivileges((prev) => {
      const newMap = new Map(prev)
      newMap.delete(privilegeId)
      return newMap
    })
  }

  // Calculate total actions for a privilege
  const calculateActionsTotal = (actions: Set<number>): number => {
    let total = 0
    actions.forEach((action) => (total += action))
    return total
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

    // Validate at least one privilege is selected
    if (selectedPrivileges.size === 0) {
      newErrors.privileges = "At least one privilege must be selected"
    }

    setErrors(newErrors)
    setTouched({
      name: true,
      description: true,
      category: true,
      privileges: true,
    })

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    if (!canCreate) {
      notify("error", "You don't have permission to create roles")
      return
    }

    // Prepare privileges array
    const privileges: PrivilegeAssignment[] = []
    selectedPrivileges.forEach((actions, privilegeId) => {
      const actionsTotal = calculateActionsTotal(actions)
      privileges.push({
        privilegeId,
        actions: actionsTotal,
      })
    })

    const submitData: CreateRoleRequest = {
      ...formData,
      privileges,
    }

    try {
      const result = await dispatch(createRole(submitData))

      if (createRole.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to create role"
        notify("error", errorMessage)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to create role")
    }
  }

  const handleCancel = () => {
    router.push("/roles-management/roles")
  }

  const getError = (field: keyof Omit<CreateRoleRequest, "privileges"> | "privileges"): string => {
    return touched[field] ? errors[field] || "" : ""
  }

  const isLoading = createRoleLoading || privilegesLoading

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="sticky top-16 z-40 border-b border-gray-200 bg-white ">
            <div className="mx-auto w-full px-3 py-4 2xl:container sm:px-4  md:px-6 2xl:px-16">
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
                    <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
                    <p className="text-gray-600">Define a new role with specific permissions</p>
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

                  {canCreate && (
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
                          Create Role
                        </>
                      )}
                    </ButtonModule>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto flex w-full flex-col px-3 2xl:container  md:px-6 2xl:px-16">
            {/* Header */}

            <div className="flex w-full py-8">
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                {/* Main Form Content - 2/3 width */}
                <div className="space-y-6 md:col-span-2">
                  {/* Role Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <PlusCircle className="size-5" />
                      Role Information
                    </h2>

                    <div className="space-y-6">
                      {/* Role Name */}
                      <FormInputModule
                        label="Role Name"
                        type="text"
                        name="name"
                        placeholder="Enter role name (e.g., 'Administrator', 'Manager')"
                        value={formData.name}
                        onChange={handleInputChange("name")}
                        required
                        disabled={isLoading}
                        error={getError("name")}
                      />

                      {/* Category */}
                      <FormSelectModule
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleSelectChange("category")}
                        options={[{ value: "", label: "Select category" }, ...categoryOptions]}
                        required
                        disabled={isLoading}
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

                  {/* Privileges Selection Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Shield className="size-5" />
                        Privileges & Permissions
                      </h2>
                      {getError("privileges") && <p className="text-sm text-[#D14343]">{getError("privileges")}</p>}
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-6 space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <FormInputModule
                            label="Search Privileges"
                            type="text"
                            name="privilegeSearch"
                            placeholder="Search by name or key..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <FormSelectModule
                            label="Filter by Category"
                            name="privilegeCategory"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as string)}
                            options={[
                              { value: "", label: "All Categories" },
                              ...privilegeCategories.map((cat) => ({
                                value: cat,
                                label: cat,
                              })),
                            ]}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Selected Privileges Summary */}
                      {selectedPrivileges.size > 0 && (
                        <div className="rounded-lg bg-green-50 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-green-700">
                                {selectedPrivileges.size} privilege(s) selected
                              </span>
                              <p className="mt-1 text-xs text-green-600">
                                Total actions:{" "}
                                {Array.from(selectedPrivileges.values()).reduce(
                                  (total, actions) => total + actions.size,
                                  0
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedPrivileges(new Map())}
                              className="text-sm text-green-600 hover:text-green-800"
                              disabled={isLoading}
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Privileges List */}
                    <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
                      {filteredPrivileges.length === 0 ? (
                        <div className="py-8 text-center">
                          <Shield className="mx-auto size-12 text-gray-400" />
                          <p className="mt-2 text-gray-500">No privileges found matching your criteria</p>
                        </div>
                      ) : (
                        filteredPrivileges.map((privilege) => {
                          const selectedActions = selectedPrivileges.get(privilege.id) || new Set<number>()
                          const isSelected = selectedActions.size > 0

                          return (
                            <div
                              key={privilege.id}
                              className={`rounded-lg border p-4 ${
                                isSelected ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{privilege.name}</h4>
                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
                                      {privilege.category}
                                    </span>
                                  </div>
                                  <p className="mb-3 text-sm text-gray-600">{privilege.key}</p>

                                  {/* Available Actions */}
                                  <div>
                                    <div className="mb-2 flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">Select Actions:</span>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleSelectAllActions(privilege.id, privilege.availableActions)
                                          }
                                          className="text-xs text-blue-600 hover:text-blue-800"
                                          disabled={isLoading}
                                        >
                                          Select All
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleClearAllActions(privilege.id)}
                                          className="text-xs text-gray-600 hover:text-gray-800"
                                          disabled={isLoading}
                                        >
                                          Clear
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      {actionOptions.map((action) => {
                                        const isAvailable = privilege.availableActions & action.bit
                                        const isSelected = selectedActions.has(action.bit)

                                        if (!isAvailable) return null

                                        return (
                                          <button
                                            key={action.value}
                                            type="button"
                                            onClick={() => handlePrivilegeActionToggle(privilege.id, action.bit)}
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                              isSelected
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                            disabled={isLoading}
                                            title={action.label}
                                          >
                                            {isSelected ? (
                                              <CheckCircle className="size-3" />
                                            ) : (
                                              <div className="size-3 rounded-full border border-gray-300" />
                                            )}
                                            {action.label.split(" ")[0]}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </motion.div>

                  {/* Preview Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                      <CheckCircle className="size-5" />
                      Role Preview
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
                            ? categoryOptions.find((opt) => opt.value === formData.category)?.label || formData.category
                            : "(Not set)"}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4 md:col-span-2">
                        <div className="mb-2 text-xs font-medium text-gray-500">Description</div>
                        <div className="text-gray-900">{formData.description || "No description provided"}</div>
                      </div>
                      <div className="rounded-lg bg-white p-4 md:col-span-2">
                        <div className="mb-2 text-xs font-medium text-gray-500">Selected Privileges</div>
                        <div className="text-gray-900">
                          {selectedPrivileges.size === 0 ? (
                            <span className="text-gray-500">No privileges selected</span>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700">
                                {selectedPrivileges.size} privilege(s) with{" "}
                                {Array.from(selectedPrivileges.values()).reduce(
                                  (total, actions) => total + actions.size,
                                  0
                                )}{" "}
                                action(s)
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Array.from(selectedPrivileges.entries()).map(([privilegeId, actions]) => {
                                  const privilege = privileges.find((p) => p.id === privilegeId)
                                  if (!privilege) return null
                                  return (
                                    <span
                                      key={privilegeId}
                                      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                                    >
                                      {privilege.name} ({actions.size})
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
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
                      <Users className="size-4" />
                      Actions
                    </h3>
                    <div className="space-y-3">
                      {canCreate ? (
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
                                Creating Role...
                              </span>
                            ) : (
                              "Create Role"
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
                        <div className="rounded-lg bg-red-50 p-4">
                          <p className="text-sm text-red-700">
                            You don&lsquo;t have permission to create roles. Please contact an administrator.
                          </p>
                          <ButtonModule
                            variant="secondary"
                            className="mt-3 w-full justify-center"
                            onClick={handleCancel}
                          >
                            Back to Roles
                          </ButtonModule>
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
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Tips for Creating Roles</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Use clear, descriptive role names</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Assign only necessary permissions (principle of least privilege)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Group similar permissions together</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Review selected permissions before creating</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Consider creating role templates for common use cases</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Permission Legend */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">Permission Legend</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded bg-green-100">
                          <CheckCircle className="size-3 text-green-600" />
                        </div>
                        <span className="text-xs text-gray-600">C - Create</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded bg-blue-100">
                          <Key className="size-3 text-blue-600" />
                        </div>
                        <span className="text-xs text-gray-600">R - Read</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded bg-yellow-100">
                          <Edit3 className="size-3 text-yellow-600" />
                        </div>
                        <span className="text-xs text-gray-600">U - Update</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded bg-red-100">
                          <XCircle className="size-3 text-red-600" />
                        </div>
                        <span className="text-xs text-gray-600">D - Delete</span>
                      </div>
                      {/* Approve (A) and View All (V) intentionally removed from legend */}
                    </div>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Tag className="size-4" />
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Selected Privileges:</span>
                        <span className="font-semibold text-blue-600">{selectedPrivileges.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Actions:</span>
                        <span className="font-semibold text-green-600">
                          {Array.from(selectedPrivileges.values()).reduce((total, actions) => total + actions.size, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role Type:</span>
                        <span className="font-semibold text-purple-600">Custom Role</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="font-semibold text-green-600">Will be Active</span>
                      </div>
                    </div>
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

export default CreateRolePage
