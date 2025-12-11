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
import { fetchEmployees } from "lib/redux/employeeSlice"
import { ChevronDown } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"
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

// Sample departments data
const departments = ["HR", "Finance", "IT", "Operations", "Sales", "Marketing", "Customer Service"]

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
      <div className="h-9 w-full rounded bg-gray-200 md:h-10 md:w-60 lg:w-80"></div>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 lg:w-24"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

const MobileFilterSkeleton = () => (
  <motion.div
    className="flex gap-2 md:hidden"
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
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-8 w-20 rounded-full bg-gray-200"></div>
    ))}
  </motion.div>
)

const AllEmployees = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { employees, employeesLoading, employeesError, pagination } = useSelector((state: RootState) => state.employee)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [isDeptOpen, setIsDeptOpen] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Modal states - only one modal can be open at a time
  const [activeModal, setActiveModal] = useState<"details" | "suspend" | "reminder" | "status" | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const router = useRouter()

  // Fetch employees on component mount and when page changes
  useEffect(() => {
    dispatch(
      fetchEmployees({
        pageNumber: currentPage,
        pageSize: pagination.pageSize,
      })
    )
  }, [dispatch, currentPage, pagination.pageSize])

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-root="employee-actions"]')) {
        setActiveDropdown(null)
      }
      if (!target.closest('[data-dropdown-root="department-filter"]')) {
        setIsDeptOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Modal management functions
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

  // Specific modal handlers
  const handleViewDetails = (employee: Employee) => {
    // Navigate to employee details page
    router.push(`/employees/${employee.id}`)
  }

  const handleOpenSuspendModal = () => {
    openModal("suspend")
  }

  const handleOpenReminderModal = () => {
    openModal("reminder")
  }

  const handleOpenStatusModal = (employee?: Employee) => {
    openModal("status", employee ?? selectedEmployee ?? undefined)
  }

  // Modal confirmation handlers
  const handleConfirmSuspend = () => {
    console.log("Employee suspended")
    closeAllModals()
  }

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const handleConfirmStatusChange = (status: string) => {
    console.log("Status changed to:", status)
    closeAllModals()
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

  const toggleSort = (column: keyof Employee) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  // Filter employees based on search text and department
  const filteredEmployees =
    employees?.filter((employee: Employee) => {
      const matchesSearch =
        searchText === "" ||
        Object.values(employee).some((value) => value?.toString().toLowerCase().includes(searchText.toLowerCase()))
      const matchesDepartment =
        selectedDepartment === "" || employee.departmentName?.toLowerCase().includes(selectedDepartment.toLowerCase())
      return matchesSearch && matchesDepartment
    }) || []

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      fetchEmployees({
        pageNumber: 1,
        pageSize: newPageSize,
      })
    )
    setCurrentPage(1)
  }

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Pagination helpers
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

    // Always show first page
    items.push(1)

    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      // Close to the start: show first few pages
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      // Close to the end: show ellipsis then last few pages
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      // In the middle: show ellipsis, surrounding pages, then ellipsis
      items.push("...", current - 1, current, current + 1, "...")
    }

    // Always show last page
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

    // Example for early pages on mobile: 1,2,3,...,last
    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    // Middle pages: 1, ..., current, ..., last
    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    // Near the end: 1, ..., last-2, last-1, last
    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-green-100 md:size-12">
            <span className="text-sm font-semibold text-green-600 md:text-base">
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
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 max-sm:hidden md:size-10">
            <span className="text-xs font-semibold text-green-600 md:text-sm">
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
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
        {/* Main Content Skeleton */}
        <div className="w-full rounded-md border bg-white p-3 md:p-5">
          <HeaderSkeleton />

          {/* Mobile Filters Skeleton */}
          <div className="mt-3 md:hidden">
            <MobileFilterSkeleton />
          </div>

          {/* Employee Display Area Skeleton */}
          <div className="mt-4 w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
      </div>
    )
  }

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 max-md:px-3 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Employees List/Grid */}
        <div className="w-full rounded-md border bg-white p-3 md:p-5">
          <div className="flex flex-col py-2">
            <div className="mb-3 flex w-full items-center justify-between gap-3">
              <p className="whitespace-nowrap text-lg font-medium sm:text-xl md:text-2xl">All Employees</p>

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
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onCancel={handleCancelSearch}
                    placeholder="Search by name, email, or department"
                    className="w-full max-w-full md:max-w-[300px]"
                  />
                </div>

                {/* Export CSV Button - Desktop */}
                <button
                  className="button-oulined hidden items-center gap-2 border-[#2563EB] bg-[#DBEAFE] text-sm hover:border-[#2563EB] hover:bg-[#DBEAFE] max-sm:hidden sm:flex md:text-base"
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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
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

              <div className="relative" data-dropdown-root="department-filter">
                <button
                  type="button"
                  className="button-oulined flex items-center gap-2 text-sm md:text-base"
                  onClick={() => setIsDeptOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isDeptOpen}
                >
                  <IoMdFunnel className="size-4 md:size-5" />
                  <span className="truncate max-sm:max-w-[100px]">{selectedDepartment || "All Departments"}</span>
                  <ChevronDown
                    className={`size-3 text-gray-500 transition-transform md:size-4 ${isDeptOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isDeptOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-64">
                    <div className="py-1">
                      <button
                        className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 md:px-4 md:text-sm ${
                          selectedDepartment === "" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedDepartment("")
                          setIsDeptOpen(false)
                        }}
                      >
                        All Departments
                      </button>
                      {departments.map((dept) => (
                        <button
                          key={dept}
                          className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 md:px-4 md:text-sm ${
                            selectedDepartment === dept ? "bg-gray-50" : ""
                          }`}
                          onClick={() => {
                            setSelectedDepartment(dept)
                            setIsDeptOpen(false)
                          }}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
            {filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <div className="text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 md:size-12">
                    <VscEye className="size-5 text-gray-400 md:size-6" />
                  </div>
                  <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">No employees found</h3>
                  <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">
                    {searchText ? "Try adjusting your search criteria" : "No employees available"}
                  </p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {filteredEmployees.map((employee: Employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {filteredEmployees.map((employee: Employee) => (
                  <EmployeeListItem key={employee.id} employee={employee} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
            <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 md:flex-row">
              <div className="flex items-center gap-1 max-sm:hidden">
                <p className="text-sm md:text-base">Show rows</p>
                <select
                  value={pagination.pageSize}
                  onChange={handleRowsChange}
                  className="bg-[#F2F2F2] p-1 text-sm md:text-base"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start md:gap-3">
                <button
                  className={`px-2 py-1 md:px-3 md:py-2 ${
                    currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                  }`}
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
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

                  <div className="flex items-center gap-1 md:hidden">
                    {getMobilePageItems().map((item, index) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          className={`flex size-6 items-center justify-center rounded-md text-xs md:w-8 ${
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
                  className={`px-2 py-1 md:px-3 md:py-2 ${
                    currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                  }`}
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <BiSolidRightArrow className="size-4 md:size-5" />
                </button>
              </div>
              <p className="text-sm max-sm:hidden md:text-base">
                Page {currentPage} of {totalPages} ({totalRecords} total records)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Components - Only one modal can be open at a time */}
      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />
    </>
  )
}

export default AllEmployees
