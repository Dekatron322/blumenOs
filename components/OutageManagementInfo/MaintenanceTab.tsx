"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { MapIcon } from "components/Icons/Icons"
import { fetchMaintenances, setPagination } from "lib/redux/maintenanceSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { ButtonModule } from "components/ui/Button/Button"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

const MaintenanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path
      d="M15.66 6.34L10 0.68V4H8V0.68L2.34 6.34L3.76 7.76L8 3.52V6H10V3.52L14.24 7.76L15.66 6.34Z"
      fill="currentColor"
    />
  </svg>
)

interface Maintenance {
  id: number
  referenceCode: string
  title: string
  type: number
  priority: number
  status: number
  scope: number
  distributionSubstationId: number
  feederId: number
  distributionSubstationName: string
  feederName: string
  affectedCustomerCount: number
  scheduledStartAt: string
  scheduledEndAt: string
  actualStartAt: string
  completedAt: string
  durationHours: number
}

interface MaintenanceTabProps {
  onViewMaintenanceDetails?: (maintenance: Maintenance) => void
}

// Mobile Filter Sidebar Component
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  statusOptions,
  priorityOptions,
  typeOptions,
  scopeOptions,
  sortOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  statusOptions: Array<{ value: string | number; label: string }>
  priorityOptions: Array<{ value: string | number; label: string }>
  typeOptions: Array<{ value: string | number; label: string }>
  scopeOptions: Array<{ value: string | number; label: string }>
  sortOptions: SortOption[]
}) => {
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-filter-sidebar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            key="mobile-filter-content"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex h-full w-full max-w-sm flex-col bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">Filters & Sorting</h2>
                  {getActiveFilterCount() > 0 && (
                    <p className="text-xs text-gray-500">{getActiveFilterCount()} active filter(s)</p>
                  )}
                </div>
              </div>
              <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
                Clear All
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 space-y-4">
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((statusValue) => {
                    const statusLabel = statusOptions.find((opt) => opt.value === statusValue)?.label || ""
                    return (
                      <button
                        key={statusValue}
                        onClick={() =>
                          handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === statusValue
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {statusLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Priority</label>
                <FormSelectModule
                  name="priority"
                  value={localFilters.priority !== undefined ? localFilters.priority.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={priorityOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3].map((typeValue) => {
                    const typeLabel = typeOptions.find((opt) => opt.value === typeValue)?.label || ""
                    return (
                      <button
                        key={typeValue}
                        onClick={() =>
                          handleFilterChange("type", localFilters.type === typeValue ? undefined : typeValue)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.type === typeValue
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {typeLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Scope Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Scope</label>
                <FormSelectModule
                  name="scope"
                  value={localFilters.scope !== undefined ? localFilters.scope.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("scope", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={scopeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  aria-expanded={isSortExpanded}
                >
                  <span>Sort By</span>
                  {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {isSortExpanded && (
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                          localFilters.SortBy === option.value && localFilters.SortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.SortBy === option.value && localFilters.SortOrder === option.order && (
                          <span className="text-purple-600">
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-6 border-t bg-white p-4 2xl:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const MaintenanceTab: React.FC<MaintenanceTabProps> = ({ onViewMaintenanceDetails }) => {
  const [searchText, setSearchText] = useState("")
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Get state from Redux store
  const { maintenances, loading, error, pagination } = useAppSelector((state) => state.maintenances)

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  // Filter state
  const [localFilters, setLocalFilters] = useState<{
    status?: number
    priority?: number
    type?: number
    scope?: number
    SortBy?: string
    SortOrder?: "asc" | "desc"
  }>({
    SortBy: "",
    SortOrder: "asc",
  })

  const [appliedFilters, setAppliedFilters] = useState<{
    status?: number
    priority?: number
    type?: number
    scope?: number
    SortBy?: string
    SortOrder?: "asc" | "desc"
  }>({})

  // Filter options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: 1, label: "Scheduled" },
    { value: 2, label: "In Progress" },
    { value: 3, label: "Completed" },
    { value: 4, label: "Cancelled" },
  ]

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
  ]

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: 1, label: "Preventive" },
    { value: 2, label: "Corrective" },
    { value: 3, label: "Emergency" },
  ]

  const scopeOptions = [
    { value: "", label: "All Scopes" },
    { value: 1, label: "Local" },
    { value: 2, label: "Regional" },
  ]

  const sortOptions: SortOption[] = [
    { label: "Title (A-Z)", value: "title", order: "asc" },
    { label: "Title (Z-A)", value: "title", order: "desc" },
    { label: "Status (A-Z)", value: "status", order: "asc" },
    { label: "Status (Z-A)", value: "status", order: "desc" },
    { label: "Priority (Low to High)", value: "priority", order: "asc" },
    { label: "Priority (High to Low)", value: "priority", order: "desc" },
    { label: "Scheduled Date (Oldest First)", value: "scheduledStartAt", order: "asc" },
    { label: "Scheduled Date (Newest First)", value: "scheduledStartAt", order: "desc" },
  ]

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  // Handle sort changes
  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      SortBy: option.value,
      SortOrder: option.order,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({
      status: localFilters.status,
      priority: localFilters.priority,
      type: localFilters.type,
      scope: localFilters.scope,
      SortBy: localFilters.SortBy || undefined,
      SortOrder: localFilters.SortOrder || undefined,
    })
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      SortBy: "",
      SortOrder: "asc",
    })
    setAppliedFilters({})
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.status !== undefined) count++
    if (appliedFilters.priority !== undefined) count++
    if (appliedFilters.type !== undefined) count++
    if (appliedFilters.scope !== undefined) count++
    if (appliedFilters.SortBy) count++
    return count
  }

  // Fetch maintenances with filters
  useEffect(() => {
      const requestParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...(searchText && { search: searchText }),
      ...(appliedFilters.status !== undefined && { status: appliedFilters.status }),
      ...(appliedFilters.priority !== undefined && { priority: appliedFilters.priority }),
      ...(appliedFilters.type !== undefined && { type: appliedFilters.type }),
      ...(appliedFilters.scope !== undefined && { scope: appliedFilters.scope }),
      ...(appliedFilters.SortBy && { sortBy: appliedFilters.SortBy }),
      ...(appliedFilters.SortOrder && { sortOrder: appliedFilters.SortOrder }),
    }

    dispatch(fetchMaintenances(requestParams))
  }, [dispatch, pagination.currentPage, pagination.pageSize, searchText, appliedFilters])

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text)
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Helper functions for mapping API values to display values
  const getStatusText = (status: number): string => {
    const statusMap: { [key: number]: string } = {
      1: "Scheduled",
      2: "In Progress",
      3: "Completed",
      4: "Cancelled",
      5: "Cancelled",
    }
    return statusMap[status] || "Scheduled"
  }

  const getTypeText = (type: number): string => {
    const typeMap: { [key: number]: string } = {
      1: "Preventive",
      2: "Corrective",
      3: "Emergency",
    }
    return typeMap[type] || "Scheduled"
  }

  const getPriorityText = (priority: number): string => {
    const priorityMap: { [key: number]: string } = {
      1: "Low",
      2: "Medium",
      3: "High",
      4: "Critical",
    }
    return priorityMap[priority] || "Medium"
  }

  const getScopeText = (scope: number): string => {
    const scopeMap: { [key: number]: string } = {
      1: "Local",
      2: "Regional",
    }
    return scopeMap[scope] || "Local"
  }

  const getStatusStyle = (status: number) => {
    const statusMap: { [key: number]: string } = {
      1: "bg-blue-100 text-blue-800", // Scheduled
      2: "bg-yellow-100 text-yellow-800", // In Progress
      3: "bg-green-100 text-green-800", // Completed
      4: "bg-gray-100 text-gray-800", // Cancelled
      5: "bg-gray-100 text-gray-800", // Cancelled
    }
    return statusMap[status] || statusMap[1]
  }

  const getTypeStyle = (type: number) => {
    const typeMap: { [key: number]: string } = {
      1: "bg-green-100 text-green-800", // Preventive
      2: "bg-red-100 text-red-800", // Corrective
      3: "bg-orange-100 text-orange-800", // Emergency
    }
    return typeMap[type] || "bg-blue-100 text-blue-800"
  }

  const getPriorityStyle = (priority: number) => {
    const priorityMap: { [key: number]: string } = {
      1: "bg-green-100 text-green-800", // Low
      2: "bg-blue-100 text-blue-800", // Medium
      3: "bg-yellow-100 text-yellow-800", // High
      4: "bg-red-100 text-red-800", // Critical
    }
    return priorityMap[priority] || priorityMap[2]
  }

  const getScopeStyle = (scope: number) => {
    const scopeMap: { [key: number]: string } = {
      1: "bg-gray-100 text-gray-800", // Local
      2: "bg-purple-100 text-purple-800", // Regional
    }
    return scopeMap[scope] || scopeMap[1]
  }

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return `${minutes}m`
    } else if (hours === Math.floor(hours)) {
      return `${hours}h`
    } else {
      const wholeHours = Math.floor(hours)
      const minutes = Math.round((hours - wholeHours) * 60)
      return `${wholeHours}h ${minutes}m`
    }
  }

  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getCountdown = (endAt: string) => {
    if (!endAt) return "-"

    const end = new Date(endAt)
    const current = now || new Date()
    const diffMs = end.getTime() - current.getTime()

    if (Number.isNaN(diffMs)) return "-"
    if (diffMs <= 0) return "0s"

    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const handleViewDetails = (maintenance: Maintenance) => {
    // Navigate to the maintenance details page
    router.push(`/outage-management/maintenance-detail/${maintenance.id}`)

    // Still allow parent components to react if they provided a callback
    if (onViewMaintenanceDetails) {
      onViewMaintenanceDetails(maintenance)
    }
  }
  // No fallback/sample data; only API/Redux data is used

  // Loading state
  if (loading && maintenances.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-6"
      >
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">Maintenance Management</h3>
              <div className="h-12 animate-pulse rounded-lg bg-gray-200"></div>
            </div>

            {/* Loading skeleton for table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full  border-separate border-spacing-0 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {[...Array(8)].map((_, i) => (
                        <th key={i} className="whitespace-nowrap border-y p-4">
                          <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {[...Array(6)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(8)].map((_, colIndex) => (
                          <td key={colIndex} className="whitespace-nowrap border-b px-4 py-3">
                            <div className="h-3 animate-pulse rounded bg-gray-200"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative w-full">
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content */}
    <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-auto">
              <h3 className="mb-2 text-lg font-semibold">Maintenance Management</h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 2xl:hidden"
                >
                  <Filter className="size-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* Active filters badge - Desktop only (2xl and above) */}
                {getActiveFilterCount() > 0 && (
                  <div className="hidden items-center gap-2 2xl:flex">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                <button
                  type="button"
                  onClick={() => setShowDesktopFilters((prev) => !prev)}
                  className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                >
                  {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                  {showDesktopFilters ? "Hide filters" : "Show filters"}
                </button>

                <div className="w-full sm:w-64 md:w-80">
              <SearchModule
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search maintenance by title, reference code, or location..."
              />
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto md:pl-4">
              <ButtonModule
                onClick={() => router.push("/outage-management/schedule-maintenance")}
                variant="primary"
                size="md"
                className="mt-2 md:mt-0 md:w-auto"
              >
                Schedule Maintenance
              </ButtonModule>
            </div>
          </div>

          {error && (
            <div className="mt-2 rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-600">Error loading maintenance data: {error}</p>
            </div>
          )}
          {!loading && !error && maintenances.length === 0 && (
            <div className="mb-4 mt-2 rounded-lg bg-yellow-50 p-3">
              <p className="text-center text-sm text-yellow-600">No maintenance records found.</p>
            </div>
          )}

          {/* Maintenance Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Maintenance Details
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Location & Equipment
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Type & Priority
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Status & Scope
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Schedule</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Duration</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Affected Customers
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {maintenances.map((maintenance, index) => (
                    <motion.tr
                      key={maintenance.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-gray-900">{maintenance.title}</div>
                            <div className="text-xs text-gray-500">Ref: {maintenance.referenceCode}</div>
                            {/* <div className="text-xs text-gray-500">ID: {maintenance.id}</div> */}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapIcon />
                          <div>
                            <div className="font-medium">{maintenance.distributionSubstationName || "N/A"}</div>
                            <div className="text-xs text-gray-500">{maintenance.feederName || "No feeder"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex max-w-max rounded-full px-2 py-1 text-xs font-medium ${getTypeStyle(
                              maintenance.type
                            )}`}
                          >
                            {getTypeText(maintenance.type)}
                          </span>
                          <span
                            className={`inline-flex max-w-max rounded-full px-2 py-1 text-xs font-medium ${getPriorityStyle(
                              maintenance.priority
                            )}`}
                          >
                            {getPriorityText(maintenance.priority)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex max-w-max rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                              maintenance.status
                            )}`}
                          >
                            {getStatusText(maintenance.status)}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getScopeStyle(
                              maintenance.scope
                            )}`}
                          >
                            {getScopeText(maintenance.scope)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">Start: {formatDate(maintenance.scheduledStartAt)}</div>
                          <div className="text-xs">End: {formatDate(maintenance.scheduledEndAt)}</div>
                          {maintenance.actualStartAt && (
                            <div className="text-xs text-green-600">
                              Actual: {formatDate(maintenance.actualStartAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div className="font-medium">{getCountdown(maintenance.scheduledEndAt)}</div>
                        {maintenance.completedAt && <div className="text-xs text-green-600">Completed</div>}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div className="font-medium">{maintenance.affectedCustomerCount}</div>
                        <div className="text-xs">customers affected</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <button
                          onClick={() => handleViewDetails(maintenance)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  dispatch(setPagination({ page: pagination.currentPage - 1, pageSize: pagination.pageSize }))
                }
                disabled={!pagination.hasPrevious}
                className={`rounded-md border px-3 py-1 text-sm ${
                  pagination.hasPrevious
                    ? "border-gray-300 hover:bg-gray-50"
                    : "cursor-not-allowed border-gray-200 text-gray-400"
                }`}
              >
                Previous
              </button>
              <span className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white">{pagination.currentPage}</span>
              <button
                onClick={() =>
                  dispatch(setPagination({ page: pagination.currentPage + 1, pageSize: pagination.pageSize }))
                }
                disabled={!pagination.hasNext}
                className={`rounded-md border px-3 py-1 text-sm ${
                  pagination.hasNext
                    ? "border-gray-300 hover:bg-gray-50"
                    : "cursor-not-allowed border-gray-200 text-gray-400"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>

        {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full flex-col rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:flex 2xl:w-80 2xl:self-start"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-3 md:pb-4">
              <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
              >
                <X className="size-3 md:size-4" />
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((statusValue) => {
                    const statusLabel = statusOptions.find((opt) => opt.value === statusValue)?.label || ""
                    return (
                      <button
                        key={statusValue}
                        onClick={() =>
                          handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === statusValue
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {statusLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Priority</label>
                <FormSelectModule
                  name="priority"
                  value={localFilters.priority !== undefined ? localFilters.priority.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={priorityOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3].map((typeValue) => {
                    const typeLabel = typeOptions.find((opt) => opt.value === typeValue)?.label || ""
                    return (
                      <button
                        key={typeValue}
                        onClick={() =>
                          handleFilterChange("type", localFilters.type === typeValue ? undefined : typeValue)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.type === typeValue
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {typeLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Scope Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Scope</label>
                <FormSelectModule
                  name="scope"
                  value={localFilters.scope !== undefined ? localFilters.scope.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("scope", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={scopeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  aria-expanded={isSortExpanded}
                >
                  <span>Sort By</span>
                  {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {isSortExpanded && (
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                          localFilters.SortBy === option.value && localFilters.SortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.SortBy === option.value && localFilters.SortOrder === option.order && (
                          <span className="text-purple-600">
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-6 shrink-0 space-y-3 border-t pt-4">
              <button
                onClick={applyFilters}
                className="button-filled flex w-full items-center justify-center gap-2 text-sm md:text-base"
              >
                <Filter className="size-4" />
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="button-oulined flex w-full items-center justify-center gap-2 text-sm md:text-base"
              >
                <X className="size-4" />
                Reset All
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 shrink-0 rounded-lg bg-gray-50 p-3 md:mt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{pagination.totalCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Filters:</span>
                  <span className="font-medium">{getActiveFilterCount()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Filter Sidebar */}
      <MobileFilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        typeOptions={typeOptions}
        scopeOptions={scopeOptions}
        sortOptions={sortOptions}
      />
    </div>
  )
}

export default MaintenanceTab
