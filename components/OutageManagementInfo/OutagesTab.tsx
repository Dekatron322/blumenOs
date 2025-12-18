"use client"

import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { Outage as ApiOutage, fetchOutages, OutageRequestParams, setPagination } from "lib/redux/outageSlice"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

// Types
interface Outage {
  id: string
  numericId: number
  title: string
  description: string
  location: string
  affectedCustomers: number
  startTime: string
  estimatedRestoration: string
  actualRestoration?: string
  status: "reported" | "investigating" | "repairing" | "restored" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  cause: string
  assignedTeam: string
  reportedBy: string
  estimatedDuration: number
}

interface ActionDropdownProps {
  outage: Outage
  onViewDetails: (outage: Outage) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ outage, onViewDetails }) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return

    const buttonRect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    const dropdownHeight = 120

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("top")
    } else {
      setDropdownDirection("bottom")
    }
  }

  const handleButtonClick = () => {
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(outage)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="focus::bg-gray-100 flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RxDotsVertical />
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={
              dropdownDirection === "bottom"
                ? {
                    top: dropdownRef.current
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="py-1">
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Details
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  router.push(`/outage-management/update/${outage.numericId}`)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Status
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Assign team:", outage.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Assign Team
              </motion.button>
              {outage.status === "restored" && (
                <motion.button
                  className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                  onClick={() => {
                    console.log("Close outage:", outage.id)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: "#f0f9f4" }}
                  transition={{ duration: 0.1 }}
                >
                  Close Outage
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <motion.div
      className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="h-8 w-40 overflow-hidden rounded bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </div>
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(6)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 overflow-hidden rounded bg-gray-200">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(6)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: (rowIndex * 6 + cellIndex) * 0.05,
                        }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t py-3">
        <div className="h-6 w-48 overflow-hidden rounded bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="size-8 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8 + i * 0.1,
                }}
              />
            </div>
          ))}
          <div className="size-8 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Helper functions to map API data to local interface
const mapApiOutageToLocal = (apiOutage: ApiOutage): Outage => {
  // Map API status numbers to local status strings
  const statusMap: { [key: number]: Outage["status"] } = {
    1: "reported",
    2: "investigating",
    3: "repairing",
    4: "restored",
    5: "cancelled",
  }

  // Map API priority numbers to local priority strings
  const priorityMap: { [key: number]: Outage["priority"] } = {
    1: "low",
    2: "medium",
    3: "high",
    4: "critical",
  }

  // Calculate estimated duration in minutes (you might want to adjust this based on your API data)
  const reportedAt = new Date(apiOutage.reportedAt)
  const estimatedRestoration = new Date(reportedAt.getTime() + apiOutage.durationHours * 60 * 60 * 1000)

  return {
    id: apiOutage.referenceCode || `OUT-${apiOutage.id}`,
    numericId: apiOutage.id,
    title: apiOutage.title,
    description: `Outage affecting ${apiOutage.affectedCustomerCount} customers`,
    location: apiOutage.distributionSubstationName || apiOutage.feederName || "Unknown Location",
    affectedCustomers: apiOutage.affectedCustomerCount,
    startTime: apiOutage.reportedAt,
    estimatedRestoration: estimatedRestoration.toISOString(),
    status: statusMap[apiOutage.status] || "reported",
    priority: priorityMap[apiOutage.priority] || "medium",
    cause: "To be determined", // API doesn't provide cause, you might need to adjust this
    assignedTeam: "Field Team", // API doesn't provide assigned team, you might need to adjust this
    reportedBy: apiOutage.isCustomerGenerated ? "Customer" : "System",
    estimatedDuration: apiOutage.durationHours * 60, // Convert hours to minutes
  }
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
  sourceOptions,
  sortOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | boolean | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  statusOptions: Array<{ value: string | number; label: string }>
  priorityOptions: Array<{ value: string | number; label: string }>
  sourceOptions: Array<{ value: string; label: string }>
  sortOptions: SortOption[]
}) => {
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
            className="flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white p-4 shadow-xl"
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
            <div className="space-y-4 pb-20">
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="Status"
                  value={localFilters.Status !== undefined ? localFilters.Status.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("Status", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Priority Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Priority</label>
                <FormSelectModule
                  name="Priority"
                  value={localFilters.Priority !== undefined ? localFilters.Priority.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("Priority", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={priorityOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Source Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                <FormSelectModule
                  name="CustomerGenerated"
                  value={
                    localFilters.CustomerGenerated !== undefined
                      ? localFilters.CustomerGenerated.toString()
                      : ""
                  }
                  onChange={(e) =>
                    handleFilterChange(
                      "CustomerGenerated",
                      e.target.value === "" ? undefined : e.target.value === "true"
                    )
                  }
                  options={sourceOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
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
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="sticky bottom-0 border-t bg-white p-4 shadow-xl 2xl:hidden">
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

const OutagesTab: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const {
    outages: apiOutages,
    loading,
    error,
    totalCount,
    currentPage: reduxCurrentPage,
    pageSize,
    hasNext,
    hasPrevious,
  } = useAppSelector((state) => state.outages)

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOutage, setSelectedOutage] = useState<Outage | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)

  // Filter state
  const [localFilters, setLocalFilters] = useState<{
    Status?: number
    Priority?: number
    CustomerGenerated?: boolean
    SortBy?: string
    SortOrder?: "asc" | "desc"
  }>({
    SortBy: "",
    SortOrder: "asc",
  })

  const [appliedFilters, setAppliedFilters] = useState<{
    Status?: number
    Priority?: number
    CustomerGenerated?: boolean
    SortBy?: string
    SortOrder?: "asc" | "desc"
  }>({})

  // Filter options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: 1, label: "Reported" },
    { value: 2, label: "Investigating" },
    { value: 3, label: "Repairing" },
    { value: 4, label: "Restored" },
    { value: 5, label: "Cancelled" },
  ]

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
  ]

  const sourceOptions = [
    { value: "", label: "All Sources" },
    { value: "true", label: "Customer Reported" },
    { value: "false", label: "System Detected" },
  ]

  const sortOptions: SortOption[] = [
    { label: "Title (A-Z)", value: "title", order: "asc" },
    { label: "Title (Z-A)", value: "title", order: "desc" },
    { label: "Status (A-Z)", value: "status", order: "asc" },
    { label: "Status (Z-A)", value: "status", order: "desc" },
    { label: "Priority (Low to High)", value: "priority", order: "asc" },
    { label: "Priority (High to Low)", value: "priority", order: "desc" },
    { label: "Reported Date (Oldest First)", value: "reportedAt", order: "asc" },
    { label: "Reported Date (Newest First)", value: "reportedAt", order: "desc" },
  ]

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
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
      Status: localFilters.Status,
      Priority: localFilters.Priority,
      CustomerGenerated: localFilters.CustomerGenerated,
      SortBy: localFilters.SortBy || undefined,
      SortOrder: localFilters.SortOrder || undefined,
    })
    dispatch(setPagination({ page: 1, pageSize: pageSize || 10 }))
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      SortBy: "",
      SortOrder: "asc",
    })
    setAppliedFilters({})
    dispatch(setPagination({ page: 1, pageSize: pageSize || 10 }))
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.Status !== undefined) count++
    if (appliedFilters.Priority !== undefined) count++
    if (appliedFilters.CustomerGenerated !== undefined) count++
    if (appliedFilters.SortBy) count++
    return count
  }

  // Map API outages to local format
  const outages: Outage[] = apiOutages.map(mapApiOutageToLocal)

  // Fetch outages with filters
  useEffect(() => {
    const params: OutageRequestParams = {
      PageNumber: currentPage,
      PageSize: pageSize || 10,
      ...(searchText && { Search: searchText }),
      ...(appliedFilters.Status !== undefined && { Status: appliedFilters.Status }),
      ...(appliedFilters.Priority !== undefined && { Priority: appliedFilters.Priority }),
      ...(appliedFilters.CustomerGenerated !== undefined && {
        CustomerGenerated: appliedFilters.CustomerGenerated,
      }),
      ...(appliedFilters.SortBy && { SortBy: appliedFilters.SortBy }),
      ...(appliedFilters.SortOrder && { SortOrder: appliedFilters.SortOrder }),
    }

    dispatch(fetchOutages(params))
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  const getStatusStyle = (status: Outage["status"]) => {
    switch (status) {
      case "reported":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case "investigating":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "repairing":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "restored":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "cancelled":
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getPriorityStyle = (priority: Outage["priority"]) => {
    switch (priority) {
      case "critical":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "high":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "medium":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "low":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    dispatch(setPagination({ page: 1, pageSize: pageSize || 10 }))
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(setPagination({ page: 1, pageSize: pageSize || 10 }))
    setCurrentPage(1)
  }

  const handleViewOutageDetails = (outage: Outage) => {
    // Use the numeric backend ID for the detail route
    router.push(`/outage-management/outage-detail/${outage.numericId}`)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load outages data</p>
          <button
            className="mt-2 text-blue-600 hover:underline"
            onClick={() => {
              const params: OutageRequestParams = {
                PageNumber: currentPage,
                PageSize: pageSize || 10,
                ...filters,
              }
              if (searchText) params.Search = searchText
              dispatch(fetchOutages(params))
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 max-md:px-3 2xl:mt-5 2xl:flex-row-reverse">
        {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:block 2xl:w-80"
          >
            <div className="mb-4 flex items-center justify-between border-b pb-3 md:pb-4">
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
                <FormSelectModule
                  name="Status"
                  value={localFilters.Status !== undefined ? localFilters.Status.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("Status", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={statusOptions}
                  className="w-full"
                />
              </div>

              {/* Priority Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Priority</label>
                <FormSelectModule
                  name="Priority"
                  value={localFilters.Priority !== undefined ? localFilters.Priority.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("Priority", e.target.value === "" ? undefined : parseInt(e.target.value))
                  }
                  options={priorityOptions}
                  className="w-full"
                />
              </div>

              {/* Source Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                <FormSelectModule
                  name="CustomerGenerated"
                  value={
                    localFilters.CustomerGenerated !== undefined
                      ? localFilters.CustomerGenerated.toString()
                      : ""
                  }
                  onChange={(e) =>
                    handleFilterChange(
                      "CustomerGenerated",
                      e.target.value === "" ? undefined : e.target.value === "true"
                    )
                  }
                  options={sourceOptions}
                  className="w-full"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
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
                          {option.order === "asc" ? (
                            <SortAsc className="size-4" />
                          ) : (
                            <SortDesc className="size-4" />
                          )}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}

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
          <motion.div
            className="border-b py-2 md:flex md:items-center md:justify-between md:py-4"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Outage Management</p>
              <p className="text-sm text-gray-500">Track and manage power outages</p>
            </div>
            <div className="mt-3 flex w-full flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-end md:mt-0 md:w-auto md:gap-4">
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

              {/* Desktop Filter Toggle */}
              <button
                onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 2xl:flex"
              >
                <Filter className="size-4" />
                {showDesktopFilters ? "Hide Filters" : "Show Filters"}
                {getActiveFilterCount() > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              <div className="w-full sm:w-64 md:w-80">
                <SearchModule
                  placeholder="Search outages..."
                  value={searchText}
                  onChange={handleSearch}
                  onCancel={handleCancelSearch}
                  className="w-full"
                />
              </div>
              <button
                className="w-full rounded-md bg-[#004B23] px-4 py-2 text-white hover:bg-[#000000] sm:w-auto"
                onClick={() => router.push("/outage-management/report-outage")}
              >
                Report Outage
              </button>
            </div>
          </motion.div>

      {outages.length === 0 ? (
        <motion.div
          className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F6F6F9]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.p
            className="text-base font-bold text-[#202B3C]"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {searchText || getActiveFilterCount() > 0
              ? "No matching outages found"
              : "No outages reported"}
          </motion.p>
          {(searchText || getActiveFilterCount() > 0) && (
            <button className="text-blue-600 hover:underline" onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            className="w-full overflow-x-auto border-x bg-[#FFFFFF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      Outage Details
                    </div>
                  </th>
                  <th className="text-500 whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Location & Impact</div>
                  </th>
                  <th className="hidden whitespace-nowrap border-b p-4 text-sm md:table-cell">
                    <div className="flex items-center gap-2">Status & Priority</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Timeline</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Cause & Team</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {outages.map((outage, index) => (
                    <motion.tr
                      key={outage.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b p-4">
                        <div className="text-sm font-medium text-gray-900">{outage.title}</div>
                        <div className="text-sm text-gray-500">{outage.description}</div>
                        <div className="text-sm text-gray-500">ID: {outage.id}</div>
                      </td>
                      <td className="whitespace-nowrap border-b p-4">
                        <div className="text-sm text-gray-900">{outage.location}</div>
                        <div className="text-sm text-gray-500">{outage.affectedCustomers} customers affected</div>
                      </td>
                      <td className="hidden whitespace-nowrap border-b p-4 sm:table-cell">
                        <div className="flex flex-col gap-1">
                          <motion.div
                            style={getStatusStyle(outage.status)}
                            className="inline-flex w-fit items-center justify-center gap-1 rounded-full px-2 py-1 text-sm"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor:
                                  outage.status === "reported"
                                    ? "#D97706"
                                    : outage.status === "investigating"
                                    ? "#2563EB"
                                    : outage.status === "repairing"
                                    ? "#AF4B4B"
                                    : outage.status === "restored"
                                    ? "#589E67"
                                    : "#6B7280",
                              }}
                            ></span>
                            {outage.status.charAt(0).toUpperCase() + outage.status.slice(1)}
                          </motion.div>
                          <motion.div
                            style={getPriorityStyle(outage.priority)}
                            className="inline-flex w-fit items-center justify-center gap-1 rounded-full px-2 py-1 text-sm"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor:
                                  outage.priority === "critical"
                                    ? "#AF4B4B"
                                    : outage.priority === "high"
                                    ? "#D97706"
                                    : outage.priority === "medium"
                                    ? "#2563EB"
                                    : "#589E67",
                              }}
                            ></span>
                            {outage.priority.charAt(0).toUpperCase() + outage.priority.slice(1)}
                          </motion.div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b p-4">
                        <div className="text-sm text-gray-900">
                          Started: {new Date(outage.startTime).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Est. Duration: {formatDuration(outage.estimatedDuration)}
                        </div>
                        {outage.status === "restored" && outage.actualRestoration && (
                          <div className="text-sm text-green-600">
                            Restored: {new Date(outage.actualRestoration).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap border-b p-4">
                        <div className="text-sm text-gray-900">{outage.cause}</div>
                        <div className="text-sm text-gray-500">Team: {outage.assignedTeam}</div>
                        <div className="hidden text-sm text-gray-500 sm:block">Reported by: {outage.reportedBy}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          className="mt-2 md:mt-0 md:w-auto"
                          onClick={() => handleViewOutageDetails(outage)}
                        >
                          View Details
                        </ButtonModule>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 border-t py-3 md:flex-row md:items-center md:justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * (pageSize || 10) + 1} to{" "}
              {Math.min(currentPage * (pageSize || 10), totalCount)} of {totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={!hasPrevious}
                className={`flex items-center justify-center rounded-md p-2 ${
                  !hasPrevious ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: !hasPrevious ? 1 : 1.1 }}
                whileTap={{ scale: !hasPrevious ? 1 : 0.95 }}
              >
                <MdOutlineArrowBackIosNew />
              </motion.button>

              {Array.from({ length: Math.min(5, Math.ceil(totalCount / (pageSize || 10))) }).map((_, index) => {
                const totalPages = Math.ceil(totalCount / (pageSize || 10))
                let pageNum
                if (totalPages <= 5) {
                  pageNum = index + 1
                } else if (currentPage <= 3) {
                  pageNum = index + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index
                } else {
                  pageNum = currentPage - 2 + index
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => paginate(pageNum)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-[#004B23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}

              {Math.ceil(totalCount / (pageSize || 10)) > 5 &&
                currentPage < Math.ceil(totalCount / (pageSize || 10)) - 2 && <span className="px-2">...</span>}

              {Math.ceil(totalCount / (pageSize || 10)) > 5 &&
                currentPage < Math.ceil(totalCount / (pageSize || 10)) - 1 && (
                  <motion.button
                    onClick={() => paginate(Math.ceil(totalCount / (pageSize || 10)))}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === Math.ceil(totalCount / (pageSize || 10))
                        ? "bg-[#004B23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {Math.ceil(totalCount / (pageSize || 10))}
                  </motion.button>
                )}

              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={!hasNext}
                className={`flex items-center justify-center rounded-md p-2 ${
                  !hasNext ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: !hasNext ? 1 : 1.1 }}
                whileTap={{ scale: !hasNext ? 1 : 0.95 }}
              >
                <MdOutlineArrowForwardIos />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
        </motion.div>
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
        sourceOptions={sourceOptions}
        sortOptions={sortOptions}
      />
    </div>
  )
}

export default OutagesTab
