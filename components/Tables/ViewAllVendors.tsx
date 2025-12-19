"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { RxDotsVertical } from "react-icons/rx"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { ExportCsvIcon, MapIcon, PhoneIcon, UserIcon } from "components/Icons/Icons"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendors, VendorsRequestParams, setPagination } from "lib/redux/vendorSlice"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import Image from "next/image"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface VendorUI {
  id: number
  name: string
  status: "active" | "inactive" | "low stock"
  phone: string
  location: string
  dailySales: string
  transactionsToday: number
  stockBalance: string
  commissionRate: string
  performance: "Excellent" | "Good" | "Average" | "Poor"
  businessType: string
  contactPerson: string
  totalRevenue: string
}

// Responsive Skeleton Components
const VendorCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-4 shadow-sm"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gray-200 sm:size-12"></div>
        <div>
          <div className="h-5 w-28 rounded bg-gray-200 sm:w-32"></div>
          <div className="mt-1 flex gap-2">
            <div className="h-6 w-14 rounded-full bg-gray-200 sm:w-16"></div>
            <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20"></div>
          </div>
        </div>
      </div>
      <div className="size-6 rounded bg-gray-200"></div>
    </div>

    <div className="mt-4 space-y-2 text-sm">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-16 rounded bg-gray-200 sm:w-20"></div>
          <div className="h-4 w-12 rounded bg-gray-200 sm:w-16"></div>
        </div>
      ))}
    </div>

    <div className="mt-3 border-t pt-3">
      <div className="h-4 w-full rounded bg-gray-200"></div>
    </div>

    <div className="mt-3 flex gap-2">
      <div className="h-9 flex-1 rounded bg-gray-200"></div>
    </div>
  </motion.div>
)

const VendorListItemSkeleton = () => (
  <motion.div
    className="border-b bg-white p-4"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-gray-200"></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="h-5 w-40 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-6 w-14 rounded-full bg-gray-200 sm:w-16"></div>
              <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-20 rounded bg-gray-200 sm:w-24"></div>
            ))}
          </div>
          <div className="mt-2 hidden h-4 w-64 rounded bg-gray-200 sm:block"></div>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
        <div className="text-right">
          <div className="h-4 w-20 rounded bg-gray-200 sm:w-24"></div>
          <div className="mt-1 h-4 w-16 rounded bg-gray-200 sm:w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-16 rounded bg-gray-200 sm:w-20"></div>
          <div className="size-6 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="flex items-center gap-2">
      <div className="h-4 w-16 rounded bg-gray-200"></div>
      <div className="h-8 w-16 rounded bg-gray-200"></div>
    </div>

    <div className="flex items-center gap-3">
      <div className="size-8 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-7 rounded bg-gray-200"></div>
        ))}
      </div>
      <div className="size-8 rounded bg-gray-200"></div>
    </div>

    <div className="h-4 w-24 rounded bg-gray-200"></div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="flex flex-col py-2"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="h-8 w-40 rounded bg-gray-200"></div>
    <div className="mt-2 flex flex-col gap-4 sm:flex-row">
      <div className="h-10 w-full rounded bg-gray-200 sm:w-80"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-20 rounded bg-gray-200 sm:w-24"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

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
                  name="status"
                  value={localFilters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
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
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Can Process Postpaid</label>
                <FormSelectModule
                  name="canProcessPostpaid"
                  value={localFilters.canProcessPostpaid !== undefined ? localFilters.canProcessPostpaid.toString() : ""}
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
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
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

const AllVendors: React.FC = () => {
  const router = useRouter()
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)

  const dispatch = useAppDispatch()
  const { vendors, loading: isLoading, error, pagination } = useAppSelector((state) => state.vendors)

  const pageSize = pagination.pageSize || 10

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
      ...(appliedFilters.canProcessPrepaid !== undefined && {
        canProcessPrepaid: appliedFilters.canProcessPrepaid,
      }),
      ...(appliedFilters.canProcessPostpaid !== undefined && {
        canProcessPostpaid: appliedFilters.canProcessPostpaid,
      }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    dispatch(fetchVendors(params))
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  const totalRecords = pagination.totalCount || vendors.length
  const totalPages = pagination.totalPages || Math.ceil((vendors.length || 1) / pageSize)

  const uiVendors: VendorUI[] = vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    status: vendor.isSuspended ? "inactive" : "active",
    phone: vendor.phoneNumber,
    location: `${vendor.city || ""}${vendor.state ? ", " + vendor.state : ""}`.trim(),
    dailySales: "-",
    transactionsToday: 0,
    stockBalance: "-",
    commissionRate: `${vendor.commission}%`,
    performance: "Good",
    businessType: "Vendor",
    contactPerson: vendor.employeeName || "-",
    totalRevenue: "-",
  }))

  const getStatusStyle = (status: VendorUI["status"]) => {
    switch (status) {
      case "active":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "inactive":
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
      case "low stock":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  const getPerformanceStyle = (performance: VendorUI["performance"]) => {
    switch (performance) {
      case "Excellent":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Good":
        return { backgroundColor: "#F0F7FF", color: "#003F9F" }
      case "Average":
        return { backgroundColor: "#FEF6E6", color: "#D97706" }
      case "Poor":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  const dotStyle = (status: VendorUI["status"]) => {
    return {
      backgroundColor: status === "active" ? "#589E67" : status === "inactive" ? "#6B7280" : "#AF4B4B",
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleAddVendorSuccess = async () => {
    setIsAddVendorModalOpen(false)
  }

  const handleViewVendorDetails = (vendor: VendorUI) => {
    router.push(`/vendor-management/vendor-detail/${vendor.id}`)
  }

  // CSV Export functionality
  const exportToCSV = () => {
    if (!uiVendors || uiVendors.length === 0) {
      alert("No vendor data to export")
      return
    }

    const headers = [
      "ID",
      "Vendor Name",
      "Status",
      "Phone",
      "Location",
      "Daily Sales",
      "Transactions Today",
      "Stock Balance",
      "Commission Rate",
      "Performance",
      "Business Type",
      "Contact Person",
      "Total Revenue",
    ]

    const csvRows = uiVendors.map((vendor) => [
      vendor.id.toString(),
      `"${vendor.name.replace(/"/g, '""')}"`,
      vendor.status,
      `"${vendor.phone}"`,
      `"${vendor.location}"`,
      `"${vendor.dailySales}"`,
      vendor.transactionsToday.toString(),
      `"${vendor.stockBalance}"`,
      `"${vendor.commissionRate}"`,
      vendor.performance,
      vendor.businessType,
      `"${vendor.contactPerson}"`,
      `"${vendor.totalRevenue}"`,
    ])

    const csvContent = [headers, ...csvRows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `vendors_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }


  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      fetchVendors({
        pageNumber: 1,
        pageSize: newPageSize,
      })
    )
    setCurrentPage(1)
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const VendorCard = ({ vendor }: { vendor: VendorUI }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-3 shadow-sm transition-all hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 sm:size-12">
            <UserIcon />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{vendor.name}</h3>
            <div className="mt-1 flex items-center gap-1 sm:gap-2">
              <div
                style={getStatusStyle(vendor.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(vendor.status)}></span>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </div>
              <div style={getPerformanceStyle(vendor.performance)} className="rounded-full px-2 py-1 text-xs">
                {vendor.performance}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-xs text-gray-600 sm:mt-4 sm:text-sm">
        <div className="flex justify-between">
          <span>Contact:</span>
          <span className="font-medium">{vendor.contactPerson}</span>
        </div>
        <div className="flex justify-between">
          <span>Phone:</span>
          <span className="font-medium">{vendor.phone}</span>
        </div>
        <div className="flex justify-between">
          <span>Location:</span>
          <span className="font-medium">{vendor.location}</span>
        </div>
        <div className="flex justify-between">
          <span>Commission:</span>
          <span className="font-medium">{vendor.commissionRate}</span>
        </div>
        <div className="flex justify-between">
          <span>Business Type:</span>
          <span className="font-medium">{vendor.businessType}</span>
        </div>
      </div>

      <div className="mt-2 border-t pt-2 sm:mt-3 sm:pt-3">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-500">Daily Sales:</span>
          <span className="font-semibold">{vendor.dailySales}</span>
        </div>
      </div>

      <div className="mt-2 flex gap-2 sm:mt-3">
        <button
          onClick={() => handleViewVendorDetails(vendor)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white text-xs transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] sm:text-sm"
        >
          <VscEye className="size-3 sm:size-4" />
          <span className="sm:inline">View Details</span>
        </button>
        <ActionDropdown vendor={vendor} onViewDetails={handleViewVendorDetails} />
      </div>
    </div>
  )

  const VendorListItem = ({ vendor }: { vendor: VendorUI }) => (
    <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 sm:p-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 max-sm:hidden sm:size-10">
            <UserIcon />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{vendor.name}</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <div
                  style={getStatusStyle(vendor.status)}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                >
                  <span className="size-2 rounded-full" style={dotStyle(vendor.status)}></span>
                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                </div>
                <div style={getPerformanceStyle(vendor.performance)} className="rounded-full px-2 py-1 text-xs">
                  {vendor.performance}
                </div>
                <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                  Commission: {vendor.commissionRate}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-4 sm:text-sm">
              <span className="flex items-center gap-1">
                <PhoneIcon />
                <strong className="sm:hidden">Ph:</strong>
                <strong className="hidden sm:inline">Phone:</strong> {vendor.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapIcon />
                <strong>Location:</strong> {vendor.location}
              </span>
              <span>
                <strong>Contact:</strong> {vendor.contactPerson}
              </span>
              <span>
                <strong>Business Type:</strong> {vendor.businessType}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 sm:gap-4 sm:text-sm">
              <span>Daily Sales: {vendor.dailySales}</span>
              <span>Transactions: {vendor.transactionsToday}</span>
              <span>Stock: {vendor.stockBalance}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:gap-3">
          <div className="text-right text-xs sm:text-sm">
            <div className="hidden font-medium text-gray-900 sm:block">Revenue: {vendor.totalRevenue}</div>
            <div className="mt-1 text-gray-600 sm:hidden">{vendor.businessType}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewVendorDetails(vendor)}
              className="button-oulined flex items-center gap-2 text-xs sm:text-sm"
            >
              <VscEye className="size-3 sm:size-4" />
              <span className="hidden sm:inline">View</span>
            </button>
            <ActionDropdown vendor={vendor} onViewDetails={handleViewVendorDetails} />
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
        {/* Main Content Skeleton */}
        <div className="w-full rounded-md border bg-white ">
          <HeaderSkeleton />

          {/* Vendor Display Area Skeleton */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <VendorCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {[...Array(5)].map((_, index) => (
                  <VendorListItemSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          <PaginationSkeleton />
        </div>
      </div>
    )
  }

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    items.push(1)
    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      items.push("...", current - 1, current, current + 1, "...")
    }

    if (!items.includes(total)) {
      items.push(total)
    }

    return items
  }

  const getMobilePageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
    const items: (number | string)[] = []

    if (total <= 4) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  return (
    <>
      <div className="m relative mt-5 flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row-reverse">
        {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full flex-col rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:flex 2xl:w-80 2xl:max-h-[calc(100vh-200px)]"
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

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="status"
                  value={localFilters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
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
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Can Process Postpaid</label>
                <FormSelectModule
                  name="canProcessPostpaid"
                  value={localFilters.canProcessPostpaid !== undefined ? localFilters.canProcessPostpaid.toString() : ""}
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
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
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
                  <span className="font-medium">{pagination.totalCount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {currentPage} / {pagination.totalPages || 1}
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

        {/* Main Content - Vendors List/Grid */}
        <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-4 sm:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-4 sm:p-5 2xl:flex-1"
          }
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col py-2">
            <div className="mb-3 flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
              <p className="text-lg font-medium sm:text-xl md:text-2xl">All Vendors</p>

              <div className="flex items-center gap-2">
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

                {/* Mobile search icon button */}
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 sm:hidden"
                  onClick={() => setShowMobileSearch((prev) => !prev)}
                  aria-label="Toggle search"
                >
                  <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
                </button>

                <button
                  className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] text-xs hover:border-[#2563EB] hover:bg-[#DBEAFE] sm:text-sm"
                  onClick={exportToCSV}
                  disabled={!uiVendors || uiVendors.length === 0}
                >
                  <ExportCsvIcon color="#2563EB" size={16} className="sm:size-5" />
                  <p className="text-[#2563EB]">Export CSV</p>
                </button>
              </div>
            </div>

            {/* Mobile search input */}
            {showMobileSearch && (
              <div className="mb-3 sm:hidden">
                <SearchModule
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onCancel={handleCancelSearch}
                  placeholder="Search by name, phone, or location"
                  className="w-full"
                />
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap sm:gap-4">
              {/* Desktop search input */}
              <div className="hidden sm:block">
                <SearchModule
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onCancel={handleCancelSearch}
                  placeholder="Search by name, phone, or location"
                  className="w-full sm:max-w-[300px]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  className={`button-oulined text-xs sm:text-sm ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <MdGridView className="size-4 sm:size-5" />
                  <p className="hidden sm:block">Grid</p>
                </button>
                <button
                  className={`button-oulined text-xs sm:text-sm ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <MdFormatListBulleted className="size-4 sm:size-5" />
                  <p className="hidden sm:block">List</p>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 sm:p-4">
              <p>Error loading vendors: {error}</p>
            </div>
          )}

          {/* Vendor Display Area */}
          <div className="w-full">
            {uiVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 sm:size-12">
                    <VscEye className="size-5 text-gray-400 sm:size-6" />
                  </div>
                  <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No vendors found</h3>
                  <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                    {searchText || getActiveFilterCount() > 0
                      ? "Try adjusting your search criteria or filters"
                      : "No vendors available"}
                  </p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {uiVendors.map((vendor: VendorUI) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {uiVendors.map((vendor: VendorUI) => (
                  <VendorListItem key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {uiVendors.length > 0 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-1 max-sm:hidden">
                <p className="text-sm">Show rows</p>
                <select value={pageSize} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1 text-sm">
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className={`px-2 py-1 sm:px-3 sm:py-2 ${
                    currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                  }`}
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <BiSolidLeftArrow className="size-4 sm:size-5" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-2 sm:flex">
                    {getPageItems().map((item, index) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          className={`flex h-7 w-8 items-center justify-center rounded-md text-sm ${
                            currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                          }`}
                          onClick={() => changePage(item)}
                        >
                          {item}
                        </button>
                      ) : (
                        <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
                          {item}
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-1 sm:hidden">
                    {getMobilePageItems().map((item, index) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          className={`flex size-6 items-center justify-center rounded-md text-xs ${
                            currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                          }`}
                          onClick={() => changePage(item)}
                        >
                          {item}
                        </button>
                      ) : (
                        <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-500">
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <button
                  className={`px-2 py-1 sm:px-3 sm:py-2 ${
                    currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                  }`}
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <BiSolidRightArrow className="size-4 sm:size-5" />
                </button>
              </div>
              <p className="text-sm max-sm:hidden">
                Page {currentPage} of {totalPages} ({totalRecords} total records)
              </p>
            </div>
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
    </>
  )
}

export default AllVendors
