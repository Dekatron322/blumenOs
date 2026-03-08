"use client"

import React, { useEffect, useState } from "react"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { fetchEmployees, setFilters, setPagination } from "lib/redux/employeeSlice"
import { fetchDepartments } from "lib/redux/departmentSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  SortAsc,
  SortDesc,
  User,
  X,
  XCircle,
} from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import EmptySearchState from "components/ui/EmptySearchState"

type SortOrder = "asc" | "desc" | null

interface Employee {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  accountId: string
  isActive: boolean
  mustChangePassword: boolean
  employeeId: string | null
  position: string | null
  employmentType: string | null
  departmentId: number | null
  departmentName: string | null
  areaOfficeId: number | null
  areaOfficeName: string | null
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

const getStatusColor = (isActive: boolean): string => {
  return isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
}

const getEmploymentTypeColor = (type: string | null): string => {
  switch (type) {
    case "FULL_TIME":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "PART_TIME":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "CONTRACT":
      return "bg-amber-50 text-amber-700 border-amber-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getStatusIcon = (isActive: boolean) => {
  return isActive ? (
    <CheckCircle className="size-3.5 text-emerald-600" />
  ) : (
    <XCircle className="size-3.5 text-red-600" />
  )
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

// Table Skeleton Component
const TableSkeleton = () => (
  <div className="w-full">
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[...Array(8)].map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              {[...Array(8)].map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-4 rounded bg-gray-200" style={{ width: colIndex === 0 ? "120px" : "80px" }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const FilterPanelSkeleton = () => (
  <motion.div
    className="hidden w-full rounded-md border border-gray-200 bg-white p-3 md:p-5 2xl:mt-0 2xl:block 2xl:w-80"
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
    <div className="border-b border-gray-200 pb-3 md:pb-4">
      <div className="h-6 w-32 rounded bg-gray-200 md:w-40"></div>
    </div>

    <div className="mt-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-20 rounded bg-gray-200 md:w-24"></div>
          <div className="h-9 w-full rounded bg-gray-200"></div>
        </div>
      ))}
    </div>

    <div className="mt-6 space-y-3">
      <div className="h-4 w-24 rounded bg-gray-200"></div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-4 rounded bg-gray-200"></div>
          <div className="h-4 w-20 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0"
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
    <div className="order-2 flex items-center gap-2 md:order-1">
      <div className="hidden h-4 w-12 rounded bg-gray-200 md:block md:w-16"></div>
      <div className="h-7 w-12 rounded bg-gray-200 md:h-8 md:w-16"></div>
    </div>

    <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
      <div className="size-7 rounded bg-gray-200 md:size-8"></div>
      <div className="flex gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-6 rounded bg-gray-200 md:size-7"></div>
        ))}
      </div>
      <div className="size-7 rounded bg-gray-200 md:size-8"></div>
    </div>

    <div className="order-3 hidden h-4 w-20 rounded bg-gray-200 md:block md:w-24"></div>
  </motion.div>
)

// Mobile & All Screens Filter Sidebar Component (up to 2xl)
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  departments,
  areaOffices,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  departments: string[]
  areaOffices: string[]
}) => {
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  const sortOptions: SortOption[] = [
    { label: "Name A-Z", value: "fullName", order: "asc" },
    { label: "Name Z-A", value: "fullName", order: "desc" },
    { label: "Email A-Z", value: "email", order: "asc" },
    { label: "Email Z-A", value: "email", order: "desc" },
    { label: "Department A-Z", value: "departmentName", order: "asc" },
    { label: "Department Z-A", value: "departmentName", order: "desc" },
    { label: "Newest", value: "createdAt", order: "desc" },
    { label: "Oldest", value: "createdAt", order: "asc" },
  ]
  const employmentTypes = ["FULL_TIME", "PART_TIME", "CONTRACT"]
  const statusTypes = ["active", "inactive"]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex max-h-screen w-full max-w-sm flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed at top */}
            <div className="shrink-0 border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Filters & Sorting</h2>
                    {getActiveFilterCount() > 0 && (
                      <p className="text-xs text-gray-500">{getActiveFilterCount()} active filter(s)</p>
                    )}
                  </div>
                </div>
                <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
                  Clear All
                </button>
              </div>
            </div>

            {/* Filter Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Department Filter */}
                <div>
                  <FormSelectModule
                    label="Department"
                    name="department"
                    value={localFilters.department}
                    onChange={(e) => handleFilterChange("department", e.target.value)}
                    options={[
                      { value: "", label: "All Departments" },
                      ...departments.map((dept) => ({
                        value: dept,
                        label: dept,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusTypes.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange("status", localFilters.status === status ? "" : status)}
                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                          localFilters.status === status
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employment Type Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Employment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {employmentTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          handleFilterChange("employmentType", localFilters.employmentType === type ? "" : type)
                        }
                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                          localFilters.employmentType === type
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area Office Filter */}
                <div>
                  <FormSelectModule
                    label="Area Office"
                    name="areaOffice"
                    value={localFilters.areaOffice}
                    onChange={(e) => handleFilterChange("areaOffice", e.target.value)}
                    options={[
                      { value: "", label: "All Area Offices" },
                      ...areaOffices.map((office) => ({
                        value: office,
                        label: office,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Password Reset Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Password Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["REQUIRED", "ACTIVE"].map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          handleFilterChange("passwordStatus", localFilters.passwordStatus === type ? "" : type)
                        }
                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                          localFilters.passwordStatus === type
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {type === "REQUIRED" ? "Reset Required" : "Active"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSortExpanded((prev) => !prev)}
                    className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-700"
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
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
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
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons - Fixed at bottom */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-4">
              <div className="flex gap-3">
                <ButtonModule
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  size="sm"
                  className="flex-1"
                >
                  <Filter className="size-4" />
                  Apply Filters
                </ButtonModule>
                <ButtonModule
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <X className="size-4" />
                  Reset All
                </ButtonModule>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const AllEmployees = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { employees, employeesLoading, employeesError, pagination } = useSelector((state: RootState) => state.employee)
  const departmentsState = useSelector((state: RootState) => state.departments.departments)
  const areaOfficesState = useSelector((state: RootState) => state.areaOffices.areaOffices)

  const [searchInput, setSearchInput] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [isSortExpanded, setIsSortExpanded] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    department: "",
    status: "",
    employmentType: "",
    areaOffice: "",
    passwordStatus: "",
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Modal states
  const [activeModal, setActiveModal] = useState<"details" | "suspend" | "reminder" | "status" | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const router = useRouter()

  // Redux filters
  const filters = useSelector((state: RootState) => state.employee.filters)

  const departmentNames = React.useMemo(() => {
    if (!departmentsState || departmentsState.length === 0) return []
    const names = departmentsState.filter((dept) => dept && dept.name).map((dept) => dept.name)
    return Array.from(new Set(names))
  }, [departmentsState])

  const areaOfficeNames = React.useMemo(() => {
    if (!areaOfficesState || areaOfficesState.length === 0) return []
    const names = areaOfficesState
      .filter((office) => office && office.nameOfNewOAreaffice)
      .map((office) => office.nameOfNewOAreaffice)
    return Array.from(new Set(names))
  }, [areaOfficesState])

  // Fetch employees on component mount and when filters/pagination change
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        fetchEmployees({
          pageNumber: pagination.currentPage,
          pageSize: pagination.pageSize,
          search: filters.search,
          department: filters.department || undefined,
          status: filters.status || undefined,
          employmentType: filters.employmentType || undefined,
          areaOffice: filters.areaOffice || undefined,
        })
      )
    }

    fetchData()
  }, [dispatch, pagination.currentPage, pagination.pageSize, filters])

  useEffect(() => {
    dispatch(
      fetchDepartments({
        pageNumber: 1,
        pageSize: 1000,
      })
    )
  }, [dispatch])

  useEffect(() => {
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 1000,
      })
    )
  }, [dispatch])

  // Sync local search input with Redux filters
  useEffect(() => {
    setSearchInput(filters.search || "")
  }, [filters.search])

  // Sync local filters with Redux filters
  useEffect(() => {
    setLocalFilters({
      department: filters.department || "",
      status: filters.status || "",
      employmentType: filters.employmentType || "",
      areaOffice: filters.areaOffice || "",
      passwordStatus: filters.passwordStatus || "",
      sortBy: filters.sortBy || "",
      sortOrder: (filters.sortOrder as "asc" | "desc") || "asc",
    })
  }, [filters])

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (!target.closest('[data-dropdown-root="employee-actions"]')) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Modal management
  const closeAllModals = () => {
    setActiveModal(null)
    setSelectedEmployee(null)
    setActiveDropdown(null)
  }

  const openModal = (modalType: "details" | "suspend" | "reminder" | "status", employee?: Employee) => {
    closeAllModals()
    setActiveModal(modalType)
    if (employee) {
      setSelectedEmployee(employee)
    }
    setActiveDropdown(null)
  }

  // Modal handlers
  const handleViewDetails = (employee: Employee) => {
    router.push(`/employees/${employee.id}`)
  }

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleCancelSearch = () => {
    setSearchInput("")
    dispatch(setFilters({ search: "" }))
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Apply all filters at once
  const applyFilters = () => {
    const filterPayload: any = {
      search: searchInput.trim(),
    }

    if (localFilters.department) filterPayload.department = localFilters.department
    if (localFilters.status) filterPayload.status = localFilters.status
    if (localFilters.employmentType) filterPayload.employmentType = localFilters.employmentType
    if (localFilters.areaOffice) filterPayload.areaOffice = localFilters.areaOffice
    if (localFilters.passwordStatus) filterPayload.passwordStatus = localFilters.passwordStatus
    if (localFilters.sortBy) filterPayload.sortBy = localFilters.sortBy
    if (localFilters.sortOrder) filterPayload.sortOrder = localFilters.sortOrder

    dispatch(setFilters(filterPayload))
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      department: "",
      status: "",
      employmentType: "",
      areaOffice: "",
      passwordStatus: "",
      sortBy: "",
      sortOrder: "asc",
    })
    setSearchInput("")
    dispatch(
      setFilters({
        search: "",
        department: undefined,
        status: undefined,
        employmentType: undefined,
        areaOffice: undefined,
        passwordStatus: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      })
    )
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Handle individual filter changes
  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key as keyof typeof localFilters]: value,
    }))
  }

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.department) count++
    if (localFilters.status) count++
    if (localFilters.employmentType) count++
    if (localFilters.areaOffice) count++
    if (localFilters.passwordStatus) count++
    if (localFilters.sortBy) count++
    return count
  }

  // CSV Export functionality
  const exportToCSV = () => {
    if (!employees || employees.length === 0) {
      alert("No employee data to export")
      return
    }

    // Define CSV headers
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone Number",
      "Account ID",
      "Status",
      "Password Reset Required",
      "Employee ID",
      "Position",
      "Employment Type",
      "Department",
      "Work Location",
    ]

    // Convert employee data to CSV rows
    const csvRows = employees.map((employee) => [
      employee.id.toString(),
      `"${employee.fullName.replace(/"/g, '""')}"`,
      `"${employee.email}"`,
      `"${employee.phoneNumber || "N/A"}"`,
      `"${employee.accountId}"`,
      employee.isActive ? "Active" : "Inactive",
      employee.mustChangePassword ? "Yes" : "No",
      `"${employee.employeeId || "N/A"}"`,
      `"${employee.position || "N/A"}"`,
      `"${employee.employmentType ? employee.employmentType.replace("_", " ") : "N/A"}"`,
      `"${employee.departmentName || "N/A"}"`,
      `"${employee.areaOfficeName || "N/A"}"`,
    ])

    // Combine headers and rows
    const csvContent = [headers, ...csvRows].map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `employees_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Pagination handlers
  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(setPagination({ page: 1, pageSize: newPageSize }))
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      dispatch(setPagination({ page, pageSize: pagination.pageSize }))
    }
  }

  const getPageItems = (): (number | string)[] => {
    const total = pagination.totalPages
    const current = pagination.currentPage
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
    const total = pagination.totalPages
    const current = pagination.currentPage
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

  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc")
      if (sortOrder === "desc") {
        setSortColumn(null)
      }
    } else {
      setSortColumn(column)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortOrder === "asc" ? <SortAsc className="ml-1 size-4" /> : <SortDesc className="ml-1 size-4" />
  }

  if (employeesLoading && employees.length === 0) {
    return (
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 2xl:flex-row">
        {/* Main Content Skeleton */}
        <div className="w-full rounded-md border border-gray-200 bg-white p-3 md:p-5 2xl:flex-1">
          {/* Header Skeleton */}
          <div className="flex flex-col py-2">
            <div className="mb-3 flex w-full flex-wrap items-center justify-between gap-3">
              <div className="h-8 w-32 rounded bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-60 rounded bg-gray-200"></div>
                <div className="h-9 w-24 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <TableSkeleton />

          {/* Pagination Skeleton */}
          <PaginationSkeleton />
        </div>

        {/* Desktop Filters Sidebar Skeleton (2xl and above) */}
        <FilterPanelSkeleton />
      </div>
    )
  }

  if (employeesError) {
    return (
      <div className="flex-3 relative mt-5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-md border border-gray-200 bg-white p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="size-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load employees</p>
            <p className="mt-1 text-sm text-gray-500">{employeesError}</p>
          </div>
          <ButtonModule variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </ButtonModule>
        </div>
      </div>
    )
  }

  const sortOptions: SortOption[] = [
    { label: "Name A-Z", value: "fullName", order: "asc" },
    { label: "Name Z-A", value: "fullName", order: "desc" },
    { label: "Employee ID Asc", value: "employeeId", order: "asc" },
    { label: "Employee ID Desc", value: "employeeId", order: "desc" },
    { label: "Account ID Asc", value: "accountId", order: "asc" },
    { label: "Account ID Desc", value: "accountId", order: "desc" },
    { label: "Newest", value: "createdAt", order: "desc" },
    { label: "Oldest", value: "createdAt", order: "asc" },
  ]

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Employees Table */}
        <div
          className={
            showDesktopFilters
              ? "w-full rounded-md border border-gray-200 bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border border-gray-200 bg-white p-3 md:p-5 2xl:flex-1"
          }
        >
          <div className="flex flex-col py-2">
            <div className="mb-3 flex w-full flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Filter Button for ALL screens up to 2xl */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
                >
                  <Filter className="size-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                <p className="whitespace-nowrap text-base font-medium text-gray-900 sm:text-lg md:text-xl">
                  All Employees
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Active filters badge - Desktop only (2xl and above) */}
                {getActiveFilterCount() > 0 && (
                  <div className="hidden items-center gap-2 2xl:flex">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                <ButtonModule
                  type="button"
                  onClick={() => setShowDesktopFilters((prev) => !prev)}
                  variant="outline"
                  size="sm"
                  className="hidden 2xl:flex"
                >
                  {showDesktopFilters ? <X className="mr-2 size-4" /> : <Filter className="mr-2 size-4" />}
                  {showDesktopFilters ? "Hide filters" : "Show filters"}
                </ButtonModule>

                {/* Export CSV Button - Desktop */}
                <ButtonModule
                  size="sm"
                  className="hidden border border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-100 sm:flex"
                  onClick={exportToCSV}
                  disabled={!employees || employees.length === 0}
                >
                  <ExportCsvIcon color="#2563EB" size={20} />
                  <span className="ml-2">Export CSV</span>
                </ButtonModule>
              </div>
            </div>

            <div className="mb-3 w-full">
              <SearchModule
                prominent
                prominentTitle="Search Employees"
                prominentDescription="Find employees quickly using names, IDs, account IDs, email, or department."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onCancel={handleCancelSearch}
                onSearch={applyFilters}
                placeholder="Type employee name, employee ID, account ID, email, or department..."
                height="h-14"
                className="!w-full md:!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
              />
            </div>
          </div>

          {/* Employee Display Area - Table Format */}
          <div className="w-full">
            {(!employees || employees.length === 0) && !employeesLoading ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <EmptySearchState
                  title={filters.search || getActiveFilterCount() > 0 ? "No employees found" : "No employees available"}
                  description={
                    filters.search || getActiveFilterCount() > 0
                      ? "Try adjusting your search or filter criteria"
                      : "No employees available"
                  }
                />
                {getActiveFilterCount() > 0 && (
                  <ButtonModule onClick={resetFilters} size="sm" className="mt-4">
                    Clear All Filters
                  </ButtonModule>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                        onClick={() => toggleSort("fullName")}
                      >
                        <div className="flex items-center">
                          Employee
                          {getSortIcon("fullName")}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                        onClick={() => toggleSort("employmentType")}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon("employmentType")}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                        onClick={() => toggleSort("departmentName")}
                      >
                        <div className="flex items-center">
                          Department
                          {getSortIcon("departmentName")}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                        onClick={() => toggleSort("position")}
                      >
                        <div className="flex items-center">
                          Position
                          {getSortIcon("position")}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                        onClick={() => toggleSort("areaOfficeName")}
                      >
                        <div className="flex items-center">
                          Work Location
                          {getSortIcon("areaOfficeName")}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                        onClick={() => toggleSort("accountId")}
                      >
                        <div className="flex items-center">
                          Account ID
                          {getSortIcon("accountId")}
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                        onClick={() => toggleSort("mustChangePassword")}
                      >
                        <div className="flex items-center">
                          Password
                          {getSortIcon("mustChangePassword")}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {employees?.map((employee: Employee) => (
                      <tr key={employee.id} className="transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                              <span className="text-xs font-semibold text-blue-600">
                                {employee.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-xs font-medium text-gray-900">{employee.fullName}</p>
                              <p className="text-xs text-gray-500">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex gap-1">
                            <span
                              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
                                employee.isActive
                              )}`}
                            >
                              {getStatusIcon(employee.isActive)}
                              {employee.isActive ? "Active" : "Inactive"}
                            </span>
                            {employee.employmentType && (
                              <span
                                className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-xs font-medium ${getEmploymentTypeColor(
                                  employee.employmentType
                                )}`}
                              >
                                {employee.employmentType.replace("_", " ")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">
                          {employee.departmentName || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">
                          {employee.position || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">
                          {employee.areaOfficeName || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {employee.accountId}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {employee.mustChangePassword ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              <AlertCircle className="size-3.5" />
                              Reset Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              <CheckCircle className="size-3.5" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <ButtonModule
                            onClick={() => handleViewDetails(employee)}
                            variant="outline"
                            size="sm"
                            className="border-gray-300"
                          >
                            <VscEye className="mr-2 size-4" />
                            View
                          </ButtonModule>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {employees && employees.length > 0 && (
            <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 md:flex-row">
              <div className="flex items-center gap-1 max-sm:hidden">
                <p className="text-sm text-gray-600 md:text-base">Show rows</p>
                <div className="min-w-[80px]">
                  <FormSelectModule
                    label=""
                    name="pageSize"
                    value={pagination.pageSize}
                    onChange={handleRowsChange}
                    options={[
                      { value: 6, label: "6" },
                      { value: 12, label: "12" },
                      { value: 18, label: "18" },
                      { value: 24, label: "24" },
                      { value: 50, label: "50" },
                    ]}
                    className="w-full"
                    controlClassName="h-8 text-sm md:h-9 md:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start md:gap-3">
                <button
                  className={`rounded-md px-2 py-1 transition-colors md:px-3 md:py-2 ${
                    pagination.currentPage === 1
                      ? "cursor-not-allowed text-gray-400"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <BiSolidLeftArrow className="size-4 md:size-5" />
                </button>

                <div className="flex items-center gap-1 md:gap-2">
                  <div className="hidden items-center gap-1 md:flex md:gap-2">
                    {getPageItems().map((item, index) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          className={`flex size-7 items-center justify-center rounded-md text-sm transition-colors md:h-8 md:w-8 ${
                            pagination.currentPage === item
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

                  <div className="flex items-center gap-1 md:hidden">
                    {getMobilePageItems().map((item, index) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          className={`flex size-6 items-center justify-center rounded-md text-xs ${
                            pagination.currentPage === item ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
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
                  className={`rounded-md px-2 py-1 transition-colors md:px-3 md:py-2 ${
                    pagination.currentPage === pagination.totalPages
                      ? "cursor-not-allowed text-gray-400"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <BiSolidRightArrow className="size-4 md:size-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 max-sm:hidden md:text-base">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount.toLocaleString()} total
                records)
              </p>
            </div>
          )}
        </div>

        {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full flex-col rounded-md border border-gray-200 bg-white p-3 md:p-5 2xl:mt-0 2xl:flex 2xl:w-80 2xl:self-start"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between border-b border-gray-200 pb-3 md:pb-4">
              <h2 className="text-sm font-semibold text-gray-900 md:text-base">Filters & Sorting</h2>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
              >
                <X className="size-3 md:size-4" />
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Department Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Department</label>
                <FormSelectModule
                  name="department"
                  value={localFilters.department}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  options={[
                    { value: "", label: "All Departments" },
                    ...departmentNames.map((dept) => ({ value: dept, label: dept })),
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["active", "inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange("status", localFilters.status === status ? "" : status)}
                      className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                        localFilters.status === status
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Employment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["FULL_TIME", "PART_TIME", "CONTRACT"].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        handleFilterChange("employmentType", localFilters.employmentType === type ? "" : type)
                      }
                      className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                        localFilters.employmentType === type
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {type === "FULL_TIME" ? "Full Time" : type === "PART_TIME" ? "Part Time" : "Contract"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Office Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                <FormSelectModule
                  name="areaOffice"
                  value={localFilters.areaOffice}
                  onChange={(e) => handleFilterChange("areaOffice", e.target.value)}
                  options={[
                    { value: "", label: "All Area Offices" },
                    ...areaOfficeNames.map((office) => ({ value: office, label: office })),
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Password Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Password Status</label>
                <FormSelectModule
                  name="passwordStatus"
                  value={localFilters.passwordStatus}
                  onChange={(e) => handleFilterChange("passwordStatus", e.target.value)}
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "REQUIRED", label: "Reset Required" },
                    { value: "ACTIVE", label: "Active" },
                  ]}
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

            {/* Action Buttons */}
            <div className="mt-6 shrink-0 space-y-3 border-t border-gray-200 pt-4">
              <ButtonModule onClick={applyFilters} size="sm" className="w-full">
                <Filter className="mr-2 size-4" />
                Apply Filters
              </ButtonModule>
              <ButtonModule onClick={resetFilters} variant="outline" size="sm" className="w-full">
                <X className="mr-2 size-4" />
                Reset All
              </ButtonModule>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 shrink-0 rounded-lg bg-gray-50 p-3 md:mt-6">
              <h3 className="mb-2 text-xs font-medium text-gray-900 md:text-sm">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium text-gray-900">{pagination.totalCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium text-gray-900">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Filters:</span>
                  <span className="font-medium text-gray-900">{getActiveFilterCount()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile & All Screens Filter Sidebar (up to 2xl) */}
      <MobileFilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        departments={departmentNames}
        areaOffices={areaOfficeNames}
      />

      {/* Modal Components */}
      <SendReminderModal isOpen={activeModal === "reminder"} onRequestClose={closeAllModals} onConfirm={() => {}} />
    </>
  )
}

export default AllEmployees
