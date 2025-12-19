import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
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
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import Image from "next/image"

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

// Responsive Skeleton Components
const EmployeeCardSkeleton = () => (
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
        <div className="size-10 rounded-full bg-gray-200 md:size-12"></div>
        <div className="min-w-0 flex-1">
          <div className="h-5 w-24 rounded bg-gray-200 md:w-32"></div>
          <div className="mt-1 flex flex-wrap gap-1 md:gap-2">
            <div className="mt-1 h-6 w-12 rounded-full bg-gray-200 md:w-16"></div>
            <div className="mt-1 h-6 w-16 rounded-full bg-gray-200 md:w-20"></div>
          </div>
        </div>
      </div>
      <div className="size-5 rounded bg-gray-200 md:size-6"></div>
    </div>

    <div className="mt-3 space-y-2 md:mt-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
          <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-16"></div>
        </div>
      ))}
    </div>

    <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
      <div className="h-3 w-full rounded bg-gray-200 md:h-4"></div>
    </div>

    <div className="mt-2 flex gap-2 md:mt-3">
      <div className="h-8 flex-1 rounded bg-gray-200 md:h-9"></div>
    </div>
  </motion.div>
)

const EmployeeListItemSkeleton = () => (
  <motion.div
    className="border-b bg-white p-3 md:p-4"
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
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
      <div className="flex items-start gap-3 md:items-center md:gap-4">
        <div className="size-8 flex-shrink-0 rounded-full bg-gray-200 md:size-10"></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <div className="h-5 w-32 rounded bg-gray-200 md:w-40"></div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              <div className="h-6 w-12 rounded-full bg-gray-200 md:w-16"></div>
              <div className="h-6 w-16 rounded-full bg-gray-200 md:w-20"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-24"></div>
            ))}
          </div>
          <div className="mt-2 hidden h-3 w-40 rounded bg-gray-200 md:block md:h-4 md:w-64"></div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end md:gap-3">
        <div className="hidden text-right md:block">
          <div className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-24"></div>
          <div className="mt-1 h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-14 rounded bg-gray-200 md:h-9 md:w-20"></div>
          <div className="size-5 rounded bg-gray-200 md:size-6"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const FilterPanelSkeleton = () => (
  <motion.div
    className="hidden w-full rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:block 2xl:w-80"
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
    <div className="border-b pb-3 md:pb-4">
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
    <div className="h-7 w-32 rounded bg-gray-200 md:h-8 md:w-40"></div>
    <div className="mt-2 flex flex-col gap-3 md:mt-3 md:flex-row md:gap-4">
      <div className="h-9 w-full rounded bg-gray-200 md:h-10 md:w-60 2xl:w-80"></div>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 2xl:w-24"></div>
        ))}
      </div>
    </div>
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
  departments: any[]
  areaOffices: any[]
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
  const statusTypes = ["ACTIVE", "INACTIVE"]

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
                <label className="mb-2 block text-sm font-medium">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusTypes.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange("status", localFilters.status === status ? "" : status)}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        localFilters.status === status
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment Type Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">Employment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {employmentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        handleFilterChange("employmentType", localFilters.employmentType === type ? "" : type)
                      }
                      className={`rounded-lg px-3 py-2 text-sm ${
                        localFilters.employmentType === type
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-gray-50 text-gray-700"
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
                <label className="mb-2 block text-sm font-medium">Password Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["REQUIRED", "ACTIVE"].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        handleFilterChange("passwordStatus", localFilters.passwordStatus === type ? "" : type)
                      }
                      className={`rounded-lg px-3 py-2 text-sm ${
                        localFilters.passwordStatus === type
                          ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                          : "bg-gray-50 text-gray-700"
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
                  className="mb-2 flex w-full items-center justify-between text-sm font-medium"
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
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                          localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700"
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
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true) // For desktop 2xl and above
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

  // Don't auto-apply search - wait for Apply Filters button
  // Search will be applied when applyFilters() is called

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
    // Don't apply immediately - wait for Apply Filters button
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

  // Employees are already filtered server-side by the API based on Redux filters
  // No need for client-side filtering - just use employees from Redux directly

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

  const getStatusStyle = (isActive: boolean) => {
    return isActive
      ? { backgroundColor: "#EEF5F0", color: "#589E67" }
      : { backgroundColor: "#F7EDED", color: "#AF4B4B" }
  }

  const getEmploymentTypeStyle = (type: string | null) => {
    switch (type) {
      case "FULL_TIME":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "PART_TIME":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      case "CONTRACT":
        return { backgroundColor: "#F0F7ED", color: "#4BAF5E" }
      default:
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    }
  }

  const dotStyle = (isActive: boolean) => {
    return isActive ? { backgroundColor: "#589E67" } : { backgroundColor: "#AF4B4B" }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 md:size-12">
            <span className="text-sm font-semibold text-blue-600 md:text-base">
              {employee.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 md:text-base">{employee.fullName}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1 md:gap-2">
              <div
                style={getStatusStyle(employee.isActive)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(employee.isActive)}></span>
                {employee.isActive ? "ACTIVE" : "INACTIVE"}
              </div>
              {employee.employmentType && (
                <div style={getEmploymentTypeStyle(employee.employmentType)} className="rounded-full px-2 py-1 text-xs">
                  {employee.employmentType.replace("_", " ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-600 md:mt-4">
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Employee ID:</span>
          <span className="text-xs font-medium md:text-sm">{employee.employeeId || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Department:</span>
          <span className="text-xs font-medium md:text-sm">{employee.departmentName || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Position:</span>
          <span className="text-xs font-medium md:text-sm">{employee.position || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Work Location:</span>
          <span className="text-xs font-medium md:text-sm">{employee.areaOfficeName || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm">Account ID:</span>
          <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">{employee.accountId}</div>
        </div>
      </div>

      <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
        <p className="text-xs text-gray-500">{employee.email}</p>
      </div>

      <div className="mt-2 flex gap-2 md:mt-3">
        <button
          onClick={() => handleViewDetails(employee)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white text-sm transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] md:text-base"
        >
          <VscEye className="size-3 md:size-4" />
          View Details
        </button>
      </div>
    </div>
  )

  const EmployeeListItem = ({ employee }: { employee: Employee }) => (
    <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-start gap-3 md:items-center md:gap-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 max-sm:hidden md:size-10">
            <span className="text-xs font-semibold text-blue-600 md:text-sm">
              {employee.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">{employee.fullName}</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <div
                  style={getStatusStyle(employee.isActive)}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                >
                  <span className="size-2 rounded-full" style={dotStyle(employee.isActive)}></span>
                  {employee.isActive ? "ACTIVE" : "INACTIVE"}
                </div>
                {employee.employmentType && (
                  <div
                    style={getEmploymentTypeStyle(employee.employmentType)}
                    className="rounded-full px-2 py-1 text-xs"
                  >
                    {employee.employmentType.replace("_", " ")}
                  </div>
                )}
                <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                  Account: {employee.accountId}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 md:gap-4 md:text-sm">
              <span>
                <strong className="md:hidden">ID:</strong>
                <strong className="hidden md:inline">Employee ID:</strong> {employee.employeeId || "N/A"}
              </span>
              <span>
                <strong>Department:</strong> {employee.departmentName || "N/A"}
              </span>
              <span>
                <strong>Position:</strong> {employee.position || "N/A"}
              </span>
              <span>
                <strong>Location:</strong> {employee.areaOfficeName || "N/A"}
              </span>
            </div>
            <p className="mt-2 hidden text-xs text-gray-500 md:block md:text-sm">{employee.email}</p>
          </div>
        </div>

        <div className="flex items-start justify-between md:items-center md:gap-3">
          <div className="text-right text-xs md:text-sm">
            <div className="hidden font-medium text-gray-900 md:block">Phone: {employee.phoneNumber || "N/A"}</div>
            <div
              className={`mt-1 hidden text-xs md:block ${
                employee.mustChangePassword ? "text-amber-600" : "text-gray-500"
              }`}
            >
              {employee.mustChangePassword ? "Password Reset Required" : "Active"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewDetails(employee)}
              className="button-oulined flex items-center gap-2 text-xs md:text-sm"
            >
              <VscEye className="size-3 md:size-4" />
              <span className="hidden md:inline">View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (employeesLoading) {
    return (
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 2xl:flex-row">
        {/* Main Content Skeleton */}
        <div className="w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1">
          <HeaderSkeleton />

          {/* Employee Display Area Skeleton */}
          <div className="mt-4 w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 2xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <EmployeeCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {[...Array(5)].map((_, index) => (
                  <EmployeeListItemSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          <PaginationSkeleton />
        </div>

        {/* Desktop Filters Sidebar Skeleton (2xl and above) */}
        <FilterPanelSkeleton />
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

  const departments = ["HR", "Finance", "IT", "Operations", "Sales", "Marketing", "Customer Service"]

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Employees List/Grid */}
        <div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
        >
          <div className="flex flex-col py-2">
            <div className="mb-3 flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Filter Button for ALL screens up to 2xl */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white bg-white px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
                >
                  <Filter className="size-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                <p className="whitespace-nowrap text-lg font-medium sm:text-xl md:text-2xl">All Employees</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile search icon button */}
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 sm:hidden md:size-9"
                  onClick={() => setShowMobileSearch((prev) => !prev)}
                  aria-label="Toggle search"
                >
                  <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
                </button>

                {/* Desktop/Tablet search input */}
                <div className="hidden sm:block">
                  <SearchModule
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onCancel={handleCancelSearch}
                    placeholder="Search by name, email, or department"
                    className="w-full max-w-full sm:max-w-[320px]"
                  />
                </div>

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

                {/* Export CSV Button - Desktop */}
                  <button
                  className="button-oulined hidden items-center gap-2 border-[#2563EB] bg-[#DBEAFE] text-sm hover:border-[#2563EB] hover:bg-[#DBEAFE] sm:flex md:text-base"
                  onClick={exportToCSV}
                  disabled={!employees || employees.length === 0}
                >
                  <ExportCsvIcon color="#2563EB" size={20} />
                  <p className="text-sm text-[#2563EB] md:text-base">Export CSV</p>
                </button>
              </div>
            </div>

            {/* Mobile search input revealed when icon is tapped */}
            {showMobileSearch && (
              <div className="mb-3 sm:hidden">
                <SearchModule
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onCancel={handleCancelSearch}
                  placeholder="Search by name, email, or department"
                  className="w-full"
                />
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2 md:flex-nowrap md:gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`button-oulined ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <MdGridView className="size-4 md:size-5" />
                  <p className="text-sm md:text-base">Grid</p>
                </button>
                <button
                  className={`button-oulined ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <MdFormatListBulleted className="size-4 md:size-5" />
                  <p className="text-sm md:text-base">List</p>
                </button>
              </div>

              {/* Export CSV Button - Mobile */}
              <button
                className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] text-sm hover:border-[#2563EB] hover:bg-[#DBEAFE] sm:hidden"
                onClick={exportToCSV}
                disabled={!employees || employees.length === 0}
              >
                <ExportCsvIcon color="#2563EB" size={18} />
                <p className="text-xs text-[#2563EB]">Export</p>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {employeesError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
              <p>Error loading employees: {employeesError}</p>
            </div>
          )}

          {/* Employee Display Area */}
          <div className="w-full">
            {(!employees || employees.length === 0) && !employeesLoading ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <div className="text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 md:size-12">
                    <VscEye className="size-5 text-gray-400 md:size-6" />
                  </div>
                  <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">No employees found</h3>
                  <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">
                    {filters.search || getActiveFilterCount() > 0
                      ? "Try adjusting your search or filter criteria"
                      : "No employees available"}
                  </p>
                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 2xl:grid-cols-3">
                {employees?.map((employee: Employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {employees?.map((employee: Employee) => (
                  <EmployeeListItem key={employee.id} employee={employee} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {employees && employees.length > 0 && (
            <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 md:flex-row">
              <div className="flex items-center gap-1 max-sm:hidden">
                <p className="text-sm md:text-base">Show rows</p>
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
                  className={`px-2 py-1 md:px-3 md:py-2 ${
                    pagination.currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
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
                          className={`flex size-6 items-center justify-center rounded-md text-xs md:h-7 md:w-8 md:text-sm ${
                            pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
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
                          className={`flex size-6 items-center justify-center rounded-md text-xs md:w-8 ${
                            pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
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
                  className={`px-2 py-1 md:px-3 md:py-2 ${
                    pagination.currentPage === pagination.totalPages
                      ? "cursor-not-allowed text-gray-400"
                      : "text-[#000000]"
                  }`}
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <BiSolidRightArrow className="size-4 md:size-5" />
                </button>
              </div>
              <p className="text-sm max-sm:hidden md:text-base">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total records)
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
                      onClick={() => handleFilterChange("employmentType", localFilters.employmentType === type ? "" : type)}
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
