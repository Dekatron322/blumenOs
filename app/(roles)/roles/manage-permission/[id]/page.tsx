"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Edit3,
  Key,
  RefreshCw,
  Save,
  Shield,
  Tag,
  Users,
  XCircle,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearCurrentRole,
  fetchPrivileges,
  fetchRoleById,
  getAvailableActions,
  managePermissions,
  PrivilegeAssignment,
  resetManagePermissionsState,
} from "lib/redux/roleSlice"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

// Define action options (Approve and View All removed)
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

      {/* Main Content Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column Skeleton */}
        <div className="space-y-6 md:col-span-2">
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 h-6 w-48 rounded bg-gray-200"></div>
            <div className="space-y-4">
              <div className="h-12 w-full rounded bg-gray-200"></div>
              <div className="h-12 w-full rounded bg-gray-200"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 rounded bg-gray-200"></div>
                <div className="h-12 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 h-6 w-48 rounded bg-gray-200"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-gray-200"></div>
              ))}
            </div>
          </div>
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

const UpdatePermissionsPage = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()

  const roleId = params.id ? parseInt(params.id as string) : null

  // Get state from Redux store
  const {
    currentRole,
    currentRoleLoading,
    currentRoleError,
    privileges,
    privilegesLoading,
    privilegesError,
    managePermissionsLoading,
    managePermissionsSuccess,
    managePermissionsError,
  } = useAppSelector((state) => state.roles)

  const { user } = useAppSelector((state) => state.auth)

  const canUpdatePermissions = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedPrivileges, setSelectedPrivileges] = useState<Map<number, Set<number>>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)
  const [originalPrivileges, setOriginalPrivileges] = useState<Map<number, Set<number>>>(new Map())

  // Get unique categories from privileges
  const privilegeCategories = Array.from(new Set(privileges.map((p) => p.category))).sort()

  // Filter privileges based on search and category
  const filteredPrivileges = privileges.filter((privilege) => {
    const matchesSearch =
      searchTerm === "" ||
      privilege.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      privilege.key.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || privilege.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Initialize selected privileges from current role
  useEffect(() => {
    if (currentRole && currentRole.privileges) {
      const initialSelected = new Map<number, Set<number>>()

      currentRole.privileges.forEach((rolePrivilege) => {
        const actions = new Set<number>()
        const roleActions = rolePrivilege.actions

        if (roleActions & 1) actions.add(1) // C
        if (roleActions & 2) actions.add(2) // R
        if (roleActions & 4) actions.add(4) // U
        if (roleActions & 8) actions.add(8) // D

        initialSelected.set(rolePrivilege.privilegeId, actions)
      })

      setSelectedPrivileges(initialSelected)
      setOriginalPrivileges(new Map(initialSelected))
      setHasChanges(false)
    }
  }, [currentRole])

  // Check for changes
  useEffect(() => {
    if (originalPrivileges.size === 0 && selectedPrivileges.size === 0) {
      setHasChanges(false)
      return
    }

    // Compare maps
    const hasChanges =
      originalPrivileges.size !== selectedPrivileges.size ||
      Array.from(originalPrivileges.entries()).some(([id, actions]) => {
        const currentActions = selectedPrivileges.get(id)
        if (!currentActions || currentActions.size !== actions.size) return true
        return Array.from(actions).some((action) => !currentActions.has(action))
      }) ||
      Array.from(selectedPrivileges.entries()).some(([id, actions]) => {
        const originalActions = originalPrivileges.get(id)
        if (!originalActions || originalActions.size !== actions.size) return true
        return Array.from(actions).some((action) => !originalActions.has(action))
      })

    setHasChanges(hasChanges)
  }, [selectedPrivileges, originalPrivileges])

  // Fetch role details and privileges on mount
  useEffect(() => {
    if (roleId) {
      dispatch(fetchRoleById(roleId))
    }
    dispatch(fetchPrivileges())

    // Cleanup
    return () => {
      dispatch(clearCurrentRole())
      dispatch(resetManagePermissionsState())
    }
  }, [dispatch, roleId])

  // Handle success notification
  useEffect(() => {
    if (managePermissionsSuccess) {
      notify("success", "Permissions updated successfully")

      // Redirect back to role details page after a short delay
      const timer = setTimeout(() => {
        if (roleId) {
          router.push(`/roles/details/${roleId}`)
        } else {
          router.push("/roles")
        }
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [managePermissionsSuccess, roleId, router])

  // Handle error notification
  useEffect(() => {
    if (managePermissionsError) {
      notify("error", managePermissionsError)
    }
  }, [managePermissionsError])

  // Handle role fetch error
  useEffect(() => {
    if (currentRoleError) {
      notify("error", currentRoleError)
    }
  }, [currentRoleError])

  // Handle privilege fetch error
  useEffect(() => {
    if (privilegesError) {
      notify("error", privilegesError)
    }
  }, [privilegesError])

  // Check if role is a system role
  const isSystemRole = currentRole?.isSystem || false

  // Handle privilege action toggle
  const handlePrivilegeActionToggle = (privilegeId: number, actionBit: number) => {
    if (isSystemRole) return

    setSelectedPrivileges((prev) => {
      const newMap = new Map(prev)
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
    if (isSystemRole) return

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
    if (isSystemRole) return

    setSelectedPrivileges((prev) => {
      const newMap = new Map(prev)
      newMap.delete(privilegeId)
      return newMap
    })
  }

  // Reset to original permissions
  const handleReset = () => {
    setSelectedPrivileges(new Map(originalPrivileges))
  }

  // Calculate total actions for a privilege
  const calculateActionsTotal = (actions: Set<number>): number => {
    let total = 0
    actions.forEach((action) => (total += action))
    return total
  }

  // Prepare privileges for submission
  const preparePrivilegesForSubmission = (): PrivilegeAssignment[] => {
    const privileges: PrivilegeAssignment[] = []
    selectedPrivileges.forEach((actions, privilegeId) => {
      const actionsTotal = calculateActionsTotal(actions)
      privileges.push({
        privilegeId,
        actions: actionsTotal,
      })
    })
    return privileges
  }

  const handleSubmit = async () => {
    if (!roleId || !canUpdatePermissions || isSystemRole) return

    const privileges = preparePrivilegesForSubmission()

    try {
      const result = await dispatch(managePermissions({ roleId, privileges }))

      if (managePermissions.rejected.match(result)) {
        const errorMessage = (result.payload as string) || "Failed to update permissions"
        notify("error", errorMessage)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to update permissions")
    }
  }

  const handleCancel = () => {
    if (roleId) {
      router.push(`/roles/details/${roleId}`)
    } else {
      router.push("/roles")
    }
  }

  const isLoading = currentRoleLoading || privilegesLoading || managePermissionsLoading

  // Show loading skeleton
  if (currentRoleLoading || privilegesLoading) {
    return <LoadingSkeleton />
  }

  // Show error state
  if (currentRoleError || !currentRole || !roleId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {currentRoleError ? "Error Loading Role" : "Role Not Found"}
          </h1>
          <p className="mb-6 text-gray-600">{currentRoleError || "The role you're looking for doesn't exist."}</p>
          <ButtonModule variant="primary" onClick={() => router.push("/roles")}>
            Back to Roles
          </ButtonModule>
        </div>
      </div>
    )
  }

  // Check if user has permission to update permissions
  if (!canUpdatePermissions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="flex flex-col justify-center text-center">
          <Shield className="mx-auto mb-4 size-16 text-red-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Permission Denied</h1>
          <p className="mb-6 text-gray-600">You don&apos;t have permission to manage permissions for this role.</p>
          <ButtonModule variant="primary" onClick={() => router.push("/roles")}>
            Back to Roles
          </ButtonModule>
        </div>
      </div>
    )
  }

  // Check if role is a system role
  if (isSystemRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="flex flex-col justify-center text-center">
          <Shield className="mx-auto mb-4 size-16 text-purple-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">System Role</h1>
          <p className="mb-6 text-gray-600">System roles cannot have their permissions modified.</p>
          <ButtonModule variant="primary" onClick={() => router.push(`/roles/details/${roleId}`)}>
            Back to Role Details
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
                      <h1 className="text-2xl font-bold text-gray-900">Manage Permissions</h1>
                      <p className="text-gray-600">Update permissions for role: {currentRole.name}</p>
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
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={handleReset}
                      disabled={isLoading || !hasChanges}
                    >
                      <RefreshCw className="size-4" />
                      Reset
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
                {/* Main Content - 2/3 width */}
                <div className="space-y-6 md:col-span-2">
                  {/* Role Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Shield className="size-5" />
                      Role Information
                    </h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                          <label className="block text-sm font-medium text-gray-600">Role Name</label>
                          <p className="mt-1 font-semibold text-gray-900">{currentRole.name}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                          <label className="block text-sm font-medium text-gray-600">Role ID</label>
                          <p className="mt-1 font-semibold text-gray-900">{currentRole.id}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                          <label className="block text-sm font-medium text-gray-600">Category</label>
                          <p className="mt-1 font-semibold text-gray-900">{currentRole.category}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                          <label className="block text-sm font-medium text-gray-600">Type</label>
                          <p className="mt-1 font-semibold text-green-600">
                            {currentRole.isSystem ? "System" : "Custom"}
                          </p>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                          <label className="block text-sm font-medium text-gray-600">Description</label>
                          <p className="mt-1 text-gray-700">{currentRole.description || "No description provided"}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Permissions Management Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Shield className="size-5" />
                        Manage Permissions
                      </h2>

                      {/* Changes indicator */}
                      {hasChanges && (
                        <div className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
                          Unsaved Changes
                        </div>
                      )}
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
                            name="categoryFilter"
                            value={selectedCategory}
                            onChange={(e) => {
                              const value = typeof e === "object" && "target" in e ? e.target.value : e
                              setSelectedCategory(String(value))
                            }}
                            options={[
                              { value: "", label: "All Categories" },
                              ...privilegeCategories.map((category) => ({ value: category, label: category })),
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
                            <div className="flex gap-2">
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
                        </div>
                      )}
                    </div>

                    {/* Privileges List */}
                    <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
                      {filteredPrivileges.length === 0 ? (
                        <div className="py-8 text-center">
                          <Shield className="mx-auto size-12 text-gray-400" />
                          <p className="mt-2 text-gray-500">No privileges found matching your criteria</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm("")
                              setSelectedCategory("")
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            disabled={isLoading}
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        filteredPrivileges.map((privilege) => {
                          const selectedActions = selectedPrivileges.get(privilege.id) || new Set<number>()
                          const isSelected = selectedActions.size > 0

                          // Get available actions for this privilege
                          const availableActionsBits = getAvailableActions(privilege.availableActions)
                          const availableBitSet = new Set<number>()
                          actionOptions.forEach((option) => {
                            if (privilege.availableActions & option.bit) {
                              availableBitSet.add(option.bit)
                            }
                          })

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
                                    {privilege.description && (
                                      <span className="text-xs text-gray-500">{privilege.description}</span>
                                    )}
                                  </div>
                                  <p className="mb-3 flex items-center gap-1 text-sm text-gray-600">
                                    <Key className="size-3" />
                                    {privilege.key}
                                  </p>

                                  {/* Available Actions */}
                                  <div>
                                    <div className="mb-2 flex items-center justify-between">
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Select Actions:</span>
                                        <span className="ml-2 text-xs text-gray-500">
                                          Available: {availableActionsBits.join(", ")}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleSelectAllActions(privilege.id, privilege.availableActions)
                                          }
                                          className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                                          disabled={isLoading || availableBitSet.size === 0}
                                        >
                                          Select All
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleClearAllActions(privilege.id)}
                                          className="text-xs text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                                          disabled={isLoading || !isSelected}
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

                                    {/* Current Selection Summary */}
                                    {selectedActions.size > 0 && (
                                      <div className="mt-3 rounded bg-green-50 p-2">
                                        <p className="text-xs text-green-700">
                                          Selected:{" "}
                                          {Array.from(selectedActions)
                                            .map((bit) => {
                                              const action = actionOptions.find((opt) => opt.bit === bit)
                                              return action ? action.label.split(" ")[0] : ""
                                            })
                                            .filter(Boolean)
                                            .join(", ")}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </motion.div>

                  {/* Changes Summary Card */}
                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm"
                    >
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-yellow-900">
                        <AlertCircle className="size-5" />
                        Changes Summary
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="rounded-lg bg-white p-4">
                            <div className="mb-2 text-xs font-medium text-gray-500">Current Privileges</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {originalPrivileges.size} privilege(s)
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              {Array.from(originalPrivileges.values()).reduce(
                                (total, actions) => total + actions.size,
                                0
                              )}{" "}
                              actions
                            </div>
                          </div>
                          <div className="rounded-lg bg-white p-4">
                            <div className="mb-2 text-xs font-medium text-gray-500">New Privileges</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {selectedPrivileges.size} privilege(s)
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              {Array.from(selectedPrivileges.values()).reduce(
                                (total, actions) => total + actions.size,
                                0
                              )}{" "}
                              actions
                            </div>
                          </div>
                        </div>

                        {/* Change Details */}
                        <div className="rounded-lg bg-white p-4">
                          <div className="mb-2 text-xs font-medium text-gray-500">Changes Made</div>
                          <div className="space-y-2">
                            {/* Added privileges */}
                            {Array.from(selectedPrivileges.keys()).filter((id) => !originalPrivileges.has(id)).length >
                              0 && (
                              <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-700">
                                  Added{" "}
                                  {
                                    Array.from(selectedPrivileges.keys()).filter((id) => !originalPrivileges.has(id))
                                      .length
                                  }{" "}
                                  privilege(s)
                                </span>
                              </div>
                            )}

                            {/* Removed privileges */}
                            {Array.from(originalPrivileges.keys()).filter((id) => !selectedPrivileges.has(id)).length >
                              0 && (
                              <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-red-500"></div>
                                <span className="text-sm text-gray-700">
                                  Removed{" "}
                                  {
                                    Array.from(originalPrivileges.keys()).filter((id) => !selectedPrivileges.has(id))
                                      .length
                                  }{" "}
                                  privilege(s)
                                </span>
                              </div>
                            )}

                            {/* Modified privileges */}
                            {Array.from(originalPrivileges.keys()).filter((id) => {
                              const origActions = originalPrivileges.get(id)
                              const newActions = selectedPrivileges.get(id)
                              return (
                                newActions &&
                                origActions &&
                                (origActions.size !== newActions.size ||
                                  Array.from(origActions).some((action) => !newActions.has(action)))
                              )
                            }).length > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-gray-700">
                                  Modified{" "}
                                  {
                                    Array.from(originalPrivileges.keys()).filter((id) => {
                                      const origActions = originalPrivileges.get(id)
                                      const newActions = selectedPrivileges.get(id)
                                      return (
                                        newActions &&
                                        origActions &&
                                        (origActions.size !== newActions.size ||
                                          Array.from(origActions).some((action) => !newActions.has(action)))
                                      )
                                    }).length
                                  }{" "}
                                  privilege(s)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
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
                        onClick={handleReset}
                        disabled={isLoading || !hasChanges}
                      >
                        Reset to Original
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

                    {!hasChanges && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-center text-sm text-gray-500">No changes to save</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Quick Stats Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Tag className="size-4" />
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Privileges:</span>
                        <span className="font-semibold text-blue-600">{privileges.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Selected Privileges:</span>
                        <span className="font-semibold text-green-600">{selectedPrivileges.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Selected Actions:</span>
                        <span className="font-semibold text-green-600">
                          {Array.from(selectedPrivileges.values()).reduce((total, actions) => total + actions.size, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role Type:</span>
                        <span className="font-semibold text-purple-600">
                          {currentRole.isSystem ? "System" : "Custom"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Editable:</span>
                        <span className="font-semibold text-green-600">{currentRole.isSystem ? "No" : "Yes"}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Help Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-blue-900">Permission Management Tips</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Only assign permissions that are necessary for the role</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Review current permissions before making changes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Use the search and filter to find specific privileges</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Click &quot;Select All&quot; to quickly grant all available actions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 size-1.5 rounded-full bg-blue-400"></div>
                        <span>Remember to save your changes before leaving</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Permission Legend */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
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
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs text-gray-500">Green check indicates selected action</p>
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

export default UpdatePermissionsPage
