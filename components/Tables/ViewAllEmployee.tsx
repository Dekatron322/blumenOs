import React, { useEffect, useState } from "react"
import { RxDotsVertical } from "react-icons/rx"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { PiNoteBold } from "react-icons/pi"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { GoXCircle } from "react-icons/go"
import { WiTime3 } from "react-icons/wi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import UpdateStatusModal from "components/ui/Modal/update-status-modal"
import SuspendAccountModal from "components/ui/Modal/suspend-account-modal"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { fetchEmployees } from "lib/redux/employeeSlice"
import { ChevronDown } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"

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

interface Department {
  name: string
  code: string
  employeeCount: number
  manager: string
  location: string
}

// Sample departments data
const departments = ["HR", "Finance", "IT", "Operations", "Sales", "Marketing", "Customer Service"]
const workLocations = ["Head Office", "Branch A", "Branch B", "Branch C", "Remote"]
const employmentTypes = ["FULL_TIME", "PART_TIME", "CONTRACT"]

// Skeleton Components
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
        <div className="size-12 rounded-full bg-gray-200"></div>
        <div>
          <div className="h-5 w-32 rounded bg-gray-200"></div>
          <div className="mt-1 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-gray-200"></div>
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
      <div className="size-6 rounded bg-gray-200"></div>
    </div>

    <div className="mt-4 space-y-2 text-sm">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-4 w-16 rounded bg-gray-200"></div>
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

const EmployeeListItemSkeleton = () => (
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-gray-200"></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-5 w-40 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-gray-200"></div>
              <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="mt-2 h-4 w-64 rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded bg-gray-200"></div>
          <div className="size-6 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const DepartmentCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-3"
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-5 w-12 rounded bg-gray-200"></div>
        <div className="h-5 w-20 rounded bg-gray-200"></div>
      </div>
      <div className="h-4 w-16 rounded bg-gray-200"></div>
    </div>
    <div className="mt-3 space-y-1">
      <div className="flex justify-between">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </div>
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-4 flex items-center justify-between"
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
    <div className="mt-2 flex gap-4">
      <div className="h-10 w-80 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
        ))}
      </div>
    </div>
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
  const [showDepartments, setShowDepartments] = useState(true)
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

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
            <span className="font-semibold text-blue-600">
              {employee.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{employee.fullName}</h3>
            <div className="mt-1 flex items-center gap-2">
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

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Employee ID:</span>
          <span className="font-medium">{employee.employeeId || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span>Department:</span>
          <span className="font-medium">{employee.departmentName || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span>Position:</span>
          <span className="font-medium">{employee.position || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span>Work Location:</span>
          <span className="font-medium">{employee.areaOfficeName || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Account ID:</span>
          <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">{employee.accountId}</div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-500">{employee.email}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleViewDetails(employee)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9]"
        >
          <VscEye className="size-4" />
          View Details
        </button>
      </div>
    </div>
  )

  const EmployeeListItem = ({ employee }: { employee: Employee }) => (
    <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {employee.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">{employee.fullName}</h3>
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
              <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                Account: {employee.accountId}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Employee ID:</strong> {employee.employeeId || "N/A"}
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
            <p className="mt-2 text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">Phone: {employee.phoneNumber || "N/A"}</div>
            <div className={`mt-1 text-xs ${employee.mustChangePassword ? "text-amber-600" : "text-gray-500"}`}>
              {employee.mustChangePassword ? "Password Reset Required" : "Active"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleViewDetails(employee)} className="button-oulined flex items-center gap-2">
              <VscEye className="size-4" />
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const departmentData: Department[] = [
    {
      name: "Human Resources",
      code: "HR",
      employeeCount: 15,
      manager: "Sarah Johnson",
      location: "Head Office",
    },
    {
      name: "Information Technology",
      code: "IT",
      employeeCount: 28,
      manager: "Michael Chen",
      location: "Head Office",
    },
    {
      name: "Finance",
      code: "FIN",
      employeeCount: 12,
      manager: "David Wilson",
      location: "Head Office",
    },
    {
      name: "Sales",
      code: "SAL",
      employeeCount: 35,
      manager: "Lisa Rodriguez",
      location: "Branch A",
    },
    {
      name: "Marketing",
      code: "MKT",
      employeeCount: 18,
      manager: "James Thompson",
      location: "Head Office",
    },
    {
      name: "Operations",
      code: "OPS",
      employeeCount: 42,
      manager: "Karen Smith",
      location: "Branch B",
    },
  ]

  const DepartmentCard = ({ department }: { department: Department }) => (
    <div className="rounded-lg border bg-[#f9f9f9] p-3 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{department.code}</h3>
          <div className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">{department.name}</div>
        </div>
        <div className="flex text-sm">
          <span className="font-medium">{department.location}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Employees:</span>
          <span className="font-medium">{department.employeeCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Manager:</span>
          <span className="font-medium">{department.manager}</span>
        </div>
      </div>
    </div>
  )

  if (employeesLoading) {
    return (
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content Skeleton */}
        <div className={`rounded-md border bg-white p-5 ${showDepartments ? "flex-1" : "w-full"}`}>
          <HeaderSkeleton />

          {/* Employee Display Area Skeleton */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        {/* Departments Sidebar Skeleton */}
        {showDepartments && (
          <div className="w-80 rounded-md border bg-white p-5">
            <div className="border-b pb-4">
              <div className="h-6 w-40 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-3">
              {[...Array(6)].map((_, index) => (
                <DepartmentCardSkeleton key={index} />
              ))}
            </div>

            {/* Summary Stats Skeleton */}
            <div className="mt-6 rounded-lg bg-gray-50 p-3">
              <div className="mb-2 h-5 w-20 rounded bg-gray-200"></div>
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                    <div className="h-4 w-12 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content - Employees List/Grid */}
        <div className={`rounded-md border bg-white p-5 ${showDepartments ? "flex-1" : "w-full"}`}>
          <div className="flex flex-col py-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-2xl font-medium">All Employees</p>
              <button
                className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE]  hover:border-[#2563EB] hover:bg-[#DBEAFE]"
                onClick={exportToCSV}
                disabled={!employees || employees.length === 0}
              >
                <ExportCsvIcon color="#2563EB" size={20} />
                <p className="text-sm text-[#2563EB]">Export CSV</p>
              </button>
            </div>
            <div className="mt-2 flex gap-4">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by name, email, or department"
                className="max-w-[300px] "
              />

              <div className="flex gap-2">
                <button
                  className={`button-oulined ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <MdGridView />
                  <p>Grid</p>
                </button>
                <button
                  className={`button-oulined ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <MdFormatListBulleted />
                  <p>List</p>
                </button>
              </div>

              {/* Export CSV Button */}

              <div className="relative" data-dropdown-root="department-filter">
                <button
                  type="button"
                  className="button-oulined flex items-center gap-2"
                  onClick={() => setIsDeptOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isDeptOpen}
                >
                  <IoMdFunnel />
                  <span>{selectedDepartment || "All Departments"}</span>
                  <ChevronDown
                    className={`size-4 text-gray-500 transition-transform ${isDeptOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isDeptOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
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
                          className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
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

          {/* Employee Display Area */}
          <div className="w-full">
            {filteredEmployees.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No employees found</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p>Show rows</p>
              <select value={pagination.pageSize} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                className={`px-3 py-2 ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"}`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <BiSolidLeftArrow />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`flex h-[27px] w-[30px] items-center justify-center rounded-md ${
                      currentPage === index + 1 ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => changePage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className={`px-3 py-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <BiSolidRightArrow />
              </button>
            </div>
            <p>
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </div>
        </div>

        {/* Departments Sidebar */}
      </div>

      {/* Modal Components - Only one modal can be open at a time */}
      {/* <SuspendAccountModal
  isOpen={activeModal === "suspend"}
  onRequestClose={closeAllModals}
  onConfirm={handleConfirmSuspend}
  employeeId={employeeDetails.id} // Add this line - pass the actual employee ID
  employeeName={employeeDetails.fullName} // Add this line - pass the employee name
/> */}

      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />

      {/* <UpdateStatusModal
        isOpen={activeModal === "status"}
        onRequestClose={closeAllModals}
        employee={selectedEmployee}
      /> */}
    </>
  )
}

export default AllEmployees
