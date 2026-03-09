"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Filter,
  MapPin,
  Phone,
  Search,
  SortAsc,
  SortDesc,
  Users,
  X,
} from "lucide-react"
import { RxCaretSort } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { RxDotsVertical } from "react-icons/rx"
import { ExportCsvIcon, UserIcon } from "components/Icons/Icons"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendors, setPagination, VendorsRequestParams } from "lib/redux/vendorSlice"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import Image from "next/image"
import EmptySearchState from "components/ui/EmptySearchState"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface VendorUI {
  id: number
  accountId: string
  blumenpayId: string
  name: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  canProcessPostpaid: boolean
  canProcessPrepaid: boolean
  posCollectionAllowed: boolean
  status: "Active" | "Inactive"
  isSuspended: boolean
  urbanCommissionPercent: number
  ruralCommissionPercent: number
  employeeUserId: number
  employeeName: string
  apiPublicKey: string | null
  apiKeyIssuedAt: string | null
  apiKeyLastUsedAt: string | null
  documentUrls: string[]
}

// ==================== Status Badge Component ====================
const StatusBadge = ({ status, isSuspended }: { status: string; isSuspended: boolean }) => {
  const getStatusConfig = () => {
    if (isSuspended) {
      return {
        label: "Suspended",
        className: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-500",
      }
    }
    const normalized = status.toLowerCase()
    if (normalized === "active") {
      return {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
      }
    }
    if (normalized === "inactive") {
      return {
        label: "Inactive",
        className: "bg-gray-50 text-gray-700 border-gray-200",
        dotColor: "bg-gray-500",
      }
    }
    return {
      label: status,
      className: "bg-gray-50 text-gray-700 border-gray-200",
      dotColor: "bg-gray-500",
    }
  }

  const config = getStatusConfig()

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  )
}

// ==================== Action Buttons Component ====================
interface ActionButtonsProps {
  vendor: VendorUI
  onViewDetails: (vendor: VendorUI) => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ vendor, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
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

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(vendor)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={handleViewDetails}
        className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Actions"
      >
        <Search className="size-3" />
        <span className="hidden sm:inline">Details</span>
      </motion.button>
    </div>
  )
}

// ==================== Loading Skeleton ====================
const LoadingSkeleton = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          <div>
            <div className="h-6 w-40 rounded-lg bg-gray-200"></div>
            <div className="mt-1 h-4 w-56 rounded-lg bg-gray-200"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-lg bg-gray-200"></div>
            <div className="h-9 w-28 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {[...Array(8)].map((_, i) => (
                <th key={i} className="px-3 py-2.5">
                  <div className="h-3.5 w-16 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2.5">
                    <div className="h-3.5 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-40 rounded bg-gray-200"></div>
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded-lg bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const ActionDropdown: React.FC<{ vendor: VendorUI; onViewDetails: (vendor: VendorUI) => void }> = ({
  vendor,
  onViewDetails,
}) => {
  const [isOpen, setIsOpen] = useState(false)
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

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(vendor)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef} data-dropdown-root="vendor-actions">
      <motion.div
        className="flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RxDotsVertical className="size-4 sm:size-5" />
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:w-56"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
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
                  console.log("Edit vendor:", vendor.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Edit Vendor
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Manage stock:", vendor.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Manage Stock
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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
  stateOptions,
  isSuspendedOptions,
  canProcessPrepaidOptions,
  canProcessPostpaidOptions,
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
  statusOptions: Array<{ value: string; label: string }>
  stateOptions: Array<{ value: string; label: string }>
  isSuspendedOptions: Array<{ value: string; label: string }>
  canProcessPrepaidOptions: Array<{ value: string; label: string }>
  canProcessPostpaidOptions: Array<{ value: string; label: string }>
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
            className="flex w-full max-w-sm flex-col bg-white p-4 shadow-xl"
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
                  {["Active", "Inactive"].map((statusValue) => {
                    const statusLabel = statusOptions.find((opt) => opt.value === statusValue)?.label || statusValue
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

              {/* State Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">State</label>
                <FormSelectModule
                  name="state"
                  value={localFilters.state || ""}
                  onChange={(e) => handleFilterChange("state", e.target.value || undefined)}
                  options={stateOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Is Suspended Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Is Suspended</label>
                <FormSelectModule
                  name="isSuspended"
                  value={localFilters.isSuspended !== undefined ? localFilters.isSuspended.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("isSuspended", e.target.value === "" ? undefined : e.target.value === "true")
                  }
                  options={isSuspendedOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Can Process Prepaid Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Can Process Prepaid</label>
                <FormSelectModule
                  name="canProcessPrepaid"
                  value={localFilters.canProcessPrepaid !== undefined ? localFilters.canProcessPrepaid.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "canProcessPrepaid",
                      e.target.value === "" ? undefined : e.target.value === "true"
                    )
                  }
                  options={canProcessPrepaidOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Can Process Postpaid Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                  Can Process Postpaid
                </label>
                <FormSelectModule
                  name="canProcessPostpaid"
                  value={
                    localFilters.canProcessPostpaid !== undefined ? localFilters.canProcessPostpaid.toString() : ""
                  }
                  onChange={(e) =>
                    handleFilterChange(
                      "canProcessPostpaid",
                      e.target.value === "" ? undefined : e.target.value === "true"
                    )
                  }
                  options={canProcessPostpaidOptions}
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
                          localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
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

const AllVendors: React.FC = () => {
  const router = useRouter()
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)

  const dispatch = useAppDispatch()
  const { vendors, loading: isLoading, error, pagination } = useAppSelector((state) => state.vendors)

  const pageSize = pagination.pageSize || 10
  const totalPages = pagination.totalPages || 1

  // Filter state
  const [localFilters, setLocalFilters] = useState<{
    status?: string
    state?: string
    isSuspended?: boolean
    canProcessPrepaid?: boolean
    canProcessPostpaid?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({
    sortBy: "",
    sortOrder: "asc",
  })

  const [appliedFilters, setAppliedFilters] = useState<{
    status?: string
    state?: string
    isSuspended?: boolean
    canProcessPrepaid?: boolean
    canProcessPostpaid?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({})

  // Filter options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ]

  const stateOptions = [
    { value: "", label: "All States" },
    { value: "Lagos", label: "Lagos" },
    { value: "Abuja", label: "Abuja" },
    { value: "Kano", label: "Kano" },
    { value: "Rivers", label: "Rivers" },
    { value: "Ogun", label: "Ogun" },
  ]

  const isSuspendedOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  const canProcessPrepaidOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  const canProcessPostpaidOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  const sortOptions: SortOption[] = [
    { label: "Name (A-Z)", value: "name", order: "asc" },
    { label: "Name (Z-A)", value: "name", order: "desc" },
    { label: "Status (A-Z)", value: "status", order: "asc" },
    { label: "Status (Z-A)", value: "status", order: "desc" },
    { label: "Location (A-Z)", value: "city", order: "asc" },
    { label: "Location (Z-A)", value: "city", order: "desc" },
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
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({
      status: localFilters.status,
      state: localFilters.state,
      isSuspended: localFilters.isSuspended,
      canProcessPrepaid: localFilters.canProcessPrepaid,
      canProcessPostpaid: localFilters.canProcessPostpaid,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    dispatch(setPagination({ page: 1, pageSize }))
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({})
    dispatch(setPagination({ page: 1, pageSize }))
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.status) count++
    if (appliedFilters.state) count++
    if (appliedFilters.isSuspended !== undefined) count++
    if (appliedFilters.canProcessPrepaid !== undefined) count++
    if (appliedFilters.canProcessPostpaid !== undefined) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  // Fetch vendors with filters
  useEffect(() => {
    const params: VendorsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.state && { state: appliedFilters.state }),
      ...(appliedFilters.isSuspended !== undefined && { isSuspended: appliedFilters.isSuspended }),
      ...(appliedFilters.canProcessPrepaid !== undefined && { canProcessPrepaid: appliedFilters.canProcessPrepaid }),
      ...(appliedFilters.canProcessPostpaid !== undefined && { canProcessPostpaid: appliedFilters.canProcessPostpaid }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    dispatch(fetchVendors(params))
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
    setCurrentPage(1)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
      setCurrentPage(1)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleViewVendorDetails = (vendor: VendorUI) => {
    router.push(`/vendor-management/vendor-detail/${vendor.id}`)
  }

  const handleAddVendorSuccess = () => {
    setIsAddVendorModalOpen(false)
    // Refresh the vendors list
    dispatch(fetchVendors({ pageNumber: currentPage, pageSize }))
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const exportToCSV = () => {
    if (!vendors || vendors.length === 0) return

    const headers = [
      "Name",
      "Email",
      "Phone",
      "City",
      "State",
      "Status",
      "Urban Commission %",
      "Rural Commission %",
      "Employee Name",
      "Can Process Prepaid",
      "Can Process Postpaid",
      "POS Collection Allowed",
    ]

    const csvData = vendors.map((vendor) => [
      vendor.name,
      vendor.email,
      vendor.phoneNumber,
      vendor.city,
      vendor.state,
      vendor.status,
      vendor.urbanCommissionPercent.toString(),
      vendor.ruralCommissionPercent.toString(),
      vendor.employeeName,
      vendor.canProcessPrepaid ? "Yes" : "No",
      vendor.canProcessPostpaid ? "Yes" : "No",
      vendor.posCollectionAllowed ? "Yes" : "No",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `vendors_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading && vendors.length === 0) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-red-900">Error Loading Vendors</h3>
          <button
            onClick={() => {
              setAppliedFilters({})
              setCurrentPage(1)
              dispatch(fetchVendors({ pageNumber: 1, pageSize }))
            }}
            className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5">
      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Vendors</h2>
            <p className="mt-1 text-xs text-gray-600">Manage and monitor all vendors</p>
          </div>

          <div className="w-full">
            <SearchModule
              prominent
              prominentTitle="Search Vendors"
              prominentDescription="Find vendors quickly by name, location, contact, or status."
              value={searchInput}
              onChange={(e) => handleSearchChange(e)}
              onCancel={handleCancelSearch}
              onSearch={handleManualSearch}
              placeholder="Search vendors..."
              height="h-14"
              className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm md:!w-full [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
              bgClassName="bg-white"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
            >
              <Filter className="size-3.5" />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Desktop Filter Toggle */}
            <button
              onClick={() => setShowDesktopFilters(!showDesktopFilters)}
              className="hidden items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:flex"
            >
              {showDesktopFilters ? <X className="size-3.5" /> : <Filter className="size-3.5" />}
              <span>{showDesktopFilters ? "Hide Filters" : "Show Filters"}</span>
              {getActiveFilterCount() > 0 && (
                <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              disabled={!vendors || vendors.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ExportCsvIcon color="#2563EB" size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => {
                dispatch(fetchVendors({ pageNumber: currentPage, pageSize, ...appliedFilters }))
              }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-200 pt-3">
            <span className="text-xs text-gray-600">Active:</span>
            {appliedFilters.status && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                Status: {appliedFilters.status}
                <button
                  onClick={() => {
                    setLocalFilters((prev) => ({ ...prev, status: undefined }))
                    setAppliedFilters((prev) => ({ ...prev, status: undefined }))
                  }}
                  className="ml-0.5 hover:text-blue-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
            {appliedFilters.state && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                State: {appliedFilters.state}
                <button
                  onClick={() => {
                    setLocalFilters((prev) => ({ ...prev, state: undefined }))
                    setAppliedFilters((prev) => ({ ...prev, state: undefined }))
                  }}
                  className="ml-0.5 hover:text-blue-900"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content with Table on Left, Filters on Right */}
      <div className="flex flex-col-reverse gap-5 lg:flex-row">
        {/* Table - Takes remaining width */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {vendors.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center px-4">
                <EmptySearchState
                  title="No vendors found"
                  description={
                    searchText || getActiveFilterCount() > 0
                      ? "Try adjusting your search or filters"
                      : "Vendors will appear here"
                  }
                />
                {(searchText || getActiveFilterCount() > 0) && (
                  <button
                    onClick={resetFilters}
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="p-2 text-left">
                          <button
                            onClick={() => {
                              const option = sortOptions.find((o) => o.value === "name")
                              if (option) handleSortChange(option)
                            }}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Vendor
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Contact
                          </span>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => {
                              const option = sortOptions.find((o) => o.value === "city")
                              if (option) handleSortChange(option)
                            }}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Location
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Commission
                          </span>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Services
                          </span>
                        </th>
                        <th className="p-2 text-left">
                          <button
                            onClick={() => {
                              const option = sortOptions.find((o) => o.value === "status")
                              if (option) handleSortChange(option)
                            }}
                            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900"
                          >
                            Status
                            <RxCaretSort className="size-3.5" />
                          </button>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Employee
                          </span>
                        </th>
                        <th className="p-2 text-left">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            Actions
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {vendors.map((vendor, index) => (
                          <motion.tr
                            key={vendor.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.01 }}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td className="whitespace-nowrap p-2 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-full bg-gray-100">
                                  <Users className="size-3" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{vendor.name}</div>
                                  <div className="text-gray-500">{vendor.blumenpayId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="size-3 text-gray-400" />
                                  <span>{vendor.phoneNumber}</span>
                                </div>
                                <div className="text-gray-500">{vendor.email}</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                              <div className="flex items-center gap-1">
                                <MapPin className="size-3 text-gray-400" />
                                <span>
                                  {vendor.city}, {vendor.state}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs font-semibold text-green-600">
                              <div className="space-y-1">
                                <div>U: {vendor.urbanCommissionPercent}%</div>
                                <div>R: {vendor.ruralCommissionPercent}%</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs">
                              <div className="flex flex-wrap gap-1">
                                {vendor.canProcessPrepaid && (
                                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                    Prepaid
                                  </span>
                                )}
                                {vendor.canProcessPostpaid && (
                                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                    Postpaid
                                  </span>
                                )}
                                {vendor.posCollectionAllowed && (
                                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                                    POS
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs">
                              <StatusBadge status={vendor.status} isSuspended={vendor.isSuspended} />
                            </td>
                            <td className="whitespace-nowrap p-2 text-xs text-gray-700">{vendor.employeeName}</td>
                            <td className="whitespace-nowrap p-2">
                              <ActionButtons vendor={vendor as VendorUI} onViewDetails={handleViewVendorDetails} />
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">Show rows</p>
                    <FormSelectModule
                      value={pageSize.toString()}
                      onChange={(value) => {
                        dispatch(setPagination({ page: 1, pageSize: Number(value) }))
                        setCurrentPage(1)
                      }}
                      options={[
                        { value: "10", label: "10" },
                        { value: "20", label: "20" },
                        { value: "50", label: "50" },
                        { value: "100", label: "100" },
                      ]}
                      className="w-16"
                      name={""}
                    />
                    <p className="text-xs text-gray-600">
                      {currentPage * pageSize - pageSize + 1}-
                      {Math.min(currentPage * pageSize, pagination.totalCount || 0)} of {pagination.totalCount || 0}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex size-6 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdOutlineArrowBackIosNew className="size-3" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
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
                        <button
                          key={index}
                          onClick={() => changePage(pageNum)}
                          className={`flex size-6 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex size-6 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdOutlineArrowForwardIos className="size-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop Filter Panel - On the Right */}
        {showDesktopFilters && (
          <div className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Filters & Sorting</h3>
                <button onClick={resetFilters} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  Clear All
                </button>
              </div>
              {getActiveFilterCount() > 0 && (
                <p className="mt-1 text-xs text-gray-600">{getActiveFilterCount()} active filter(s)</p>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-3">
              <div className="space-y-4">
                {/* Status Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <FormSelectModule
                    value={localFilters.status || ""}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    options={statusOptions}
                    className="w-full"
                    name={"status"}
                  />
                </div>

                {/* State Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">State</label>
                  <FormSelectModule
                    value={localFilters.state || ""}
                    onChange={(e) => handleFilterChange("state", e.target.value)}
                    options={stateOptions}
                    className="w-full"
                    name={"state"}
                  />
                </div>

                {/* Is Suspended Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Is Suspended</label>
                  <FormSelectModule
                    value={localFilters.isSuspended !== undefined ? localFilters.isSuspended.toString() : ""}
                    onChange={(e) =>
                      handleFilterChange("isSuspended", e.target.value === "" ? undefined : e.target.value === "true")
                    }
                    options={isSuspendedOptions}
                    className="w-full"
                    name={"isSuspended"}
                  />
                </div>

                {/* Can Process Prepaid Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Can Process Prepaid</label>
                  <FormSelectModule
                    value={
                      localFilters.canProcessPrepaid !== undefined ? localFilters.canProcessPrepaid.toString() : ""
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        "canProcessPrepaid",
                        e.target.value === "" ? undefined : e.target.value === "true"
                      )
                    }
                    options={canProcessPrepaidOptions}
                    className="w-full"
                    name={"canProcessPrepaid"}
                  />
                </div>

                {/* Can Process Postpaid Filter */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Can Process Postpaid</label>
                  <FormSelectModule
                    value={
                      localFilters.canProcessPostpaid !== undefined ? localFilters.canProcessPostpaid.toString() : ""
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        "canProcessPostpaid",
                        e.target.value === "" ? undefined : e.target.value === "true"
                      )
                    }
                    options={canProcessPostpaidOptions}
                    className="w-full"
                    name={"canProcessPostpaid"}
                  />
                </div>

                {/* Sort Options */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <div className="space-y-1">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                          localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                          <span>
                            {option.order === "asc" ? (
                              <SortAsc className="size-3.5" />
                            ) : (
                              <SortDesc className="size-3.5" />
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={applyFilters}
                className="mb-2 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                Apply Filters
              </button>

              {/* Summary */}
              <div className="rounded-lg bg-gray-50 p-2">
                <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Summary</h4>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-gray-900">{pagination.totalCount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Page:</span>
                    <span className="font-medium text-gray-900">
                      {currentPage}/{totalPages}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filters:</span>
                    <span className="font-medium text-gray-900">{getActiveFilterCount()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        stateOptions={stateOptions}
        isSuspendedOptions={isSuspendedOptions}
        canProcessPrepaidOptions={canProcessPrepaidOptions}
        canProcessPostpaidOptions={canProcessPostpaidOptions}
        sortOptions={sortOptions}
      />

      <AddAgentModal
        isOpen={isAddVendorModalOpen}
        onRequestClose={() => setIsAddVendorModalOpen(false)}
        onSuccess={handleAddVendorSuccess}
      />
    </div>
  )
}

export default AllVendors
