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
// import EmployeeDetailsModal from "components/ui/Modal/employee-details-modal"
import { useRouter } from "next/navigation"

type SortOrder = "asc" | "desc" | null

interface Employee {
  id: string
  employeeId: string
  fullName: string
  position: string
  department: string
  email: string
  phoneNumber: string
  hireDate: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  salary: string
  address: string
  emergencyContact: string
  supervisor: string
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT"
  workLocation: string
  createdAt: string
  updatedAt: string
}

interface Department {
  name: string
  code: string
  employeeCount: number
  manager: string
  location: string
}

// Sample data for generating random employees
const departments = ["HR", "Finance", "IT", "Operations", "Sales", "Marketing", "Customer Service"]
const positions = [
  "Manager",
  "Senior Developer",
  "Junior Developer",
  "Accountant",
  "HR Specialist",
  "Sales Representative",
  "Customer Support",
  "Operations Manager",
  "Marketing Coordinator",
]
const workLocations = ["Head Office", "Branch A", "Branch B", "Branch C", "Remote"]
const employmentTypes: ("FULL_TIME" | "PART_TIME" | "CONTRACT")[] = ["FULL_TIME", "PART_TIME", "CONTRACT"]
const statuses: ("ACTIVE" | "INACTIVE" | "SUSPENDED")[] = ["ACTIVE", "INACTIVE", "SUSPENDED"]

// Generate random employee data
const generateRandomEmployees = (count: number): Employee[] => {
  return Array.from({ length: count }, (_, index) => {
    const id = `emp-${Date.now()}-${index}`
    const status = statuses[Math.floor(Math.random() * statuses.length)]!
    const department = departments[Math.floor(Math.random() * departments.length)]!
    const position = positions[Math.floor(Math.random() * positions.length)]!
    const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)]!
    const workLocation = workLocations[Math.floor(Math.random() * workLocations.length)]!

    return {
      id,
      employeeId: `EMP${10000 + index}`,
      fullName: `Employee ${index + 1}`,
      position,
      department,
      email: `employee${index + 1}@company.com`,
      phoneNumber: `+234${800000000 + index}`,
      hireDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
      status,
      salary: (Math.random() * 50000 + 30000).toFixed(2),
      address: `Address ${index + 1}, City`,
      emergencyContact: `+234${900000000 + index}`,
      supervisor: `Supervisor ${Math.floor(Math.random() * 10) + 1}`,
      employmentType,
      workLocation,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
}

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
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [rowsPerPage, setRowsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showDepartments, setShowDepartments] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [employeesData, setEmployeesData] = useState<any>(null)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Modal states - only one modal can be open at a time
  const [activeModal, setActiveModal] = useState<"details" | "suspend" | "reminder" | "status" | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const router = useRouter()

  // Generate random data on component mount
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call delay
    const timer = setTimeout(() => {
      const totalRecords = 50
      const totalPages = Math.ceil(totalRecords / rowsPerPage)
      const employees = generateRandomEmployees(rowsPerPage)

      setEmployeesData({
        data: {
          employees,
          pagination: {
            totalRecords,
            totalPages,
            currentPage,
            limit: rowsPerPage,
          },
        },
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentPage, rowsPerPage])

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "INACTIVE":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "SUSPENDED":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return {}
    }
  }

  const getEmploymentTypeStyle = (type: string) => {
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

  const getSalaryStyle = (salary: string) => {
    const amount = parseFloat(salary)
    if (amount < 40000) {
      return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    } else if (amount <= 60000) {
      return { backgroundColor: "#EDF2FE", color: "#4976F4" }
    } else {
      return { backgroundColor: "#EEF5F0", color: "#589E67" }
    }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { backgroundColor: "#589E67" }
      case "INACTIVE":
        return { backgroundColor: "#D28E3D" }
      case "SUSPENDED":
        return { backgroundColor: "#AF4B4B" }
      default:
        return {}
    }
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
    employeesData?.data?.employees?.filter((employee: Employee) => {
      const matchesSearch =
        searchText === "" ||
        Object.values(employee).some((value) => value?.toString().toLowerCase().includes(searchText.toLowerCase()))
      const matchesDepartment = selectedDepartment === "" || employee.department === selectedDepartment
      return matchesSearch && matchesDepartment
    }) || []

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value))
    setCurrentPage(1)
  }

  const totalPages = employeesData?.data?.pagination?.totalPages || 1
  const totalRecords = employeesData?.data?.pagination?.totalRecords || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page)
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
                style={getStatusStyle(employee.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(employee.status)}></span>
                {employee.status}
              </div>
              <div style={getEmploymentTypeStyle(employee.employmentType)} className="rounded-full px-2 py-1 text-xs">
                {employee.employmentType.replace("_", " ")}
              </div>
            </div>
          </div>
        </div>
        <div className="relative" data-dropdown-root="employee-actions">
          <RxDotsVertical
            onClick={() => toggleDropdown(employee.id)}
            className="cursor-pointer text-gray-400 hover:text-gray-600"
          />
          {activeDropdown === employee.id && (
            <div className="modal-style absolute right-0 top-full z-[100] mt-2 w-48 rounded border border-gray-300 bg-white shadow-lg">
              <ul className="text-sm">
                <li
                  className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleOpenStatusModal(employee)}
                >
                  <VscEye />
                  Update Status
                </li>
                <li
                  className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                  onClick={handleOpenReminderModal}
                >
                  <WiTime3 /> Send Reminder
                </li>
                <li
                  className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                  onClick={handleOpenSuspendModal}
                >
                  <GoXCircle /> Suspend Account
                </li>
                <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100">
                  <PiNoteBold />
                  Export Data
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Employee ID:</span>
          <span className="font-medium">{employee.employeeId}</span>
        </div>
        <div className="flex justify-between">
          <span>Department:</span>
          <span className="font-medium">{employee.department}</span>
        </div>
        <div className="flex justify-between">
          <span>Position:</span>
          <span className="font-medium">{employee.position}</span>
        </div>
        <div className="flex justify-between">
          <span>Work Location:</span>
          <span className="font-medium">{employee.workLocation}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Salary:</span>
          <div style={getSalaryStyle(employee.salary)} className="rounded-full px-2 py-1 text-xs font-medium">
            ₦{parseFloat(employee.salary).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-500">{employee.email}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleViewDetails(employee)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#f9f9f9]"
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
                style={getStatusStyle(employee.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(employee.status)}></span>
                {employee.status}
              </div>
              <div style={getEmploymentTypeStyle(employee.employmentType)} className="rounded-full px-2 py-1 text-xs">
                {employee.employmentType.replace("_", " ")}
              </div>
              <div style={getSalaryStyle(employee.salary)} className="rounded-full px-2 py-1 text-xs font-medium">
                Salary: ₦{parseFloat(employee.salary).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Employee ID:</strong> {employee.employeeId}
              </span>
              <span>
                <strong>Department:</strong> {employee.department}
              </span>
              <span>
                <strong>Position:</strong> {employee.position}
              </span>
              <span>
                <strong>Location:</strong> {employee.workLocation}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">Hired: {new Date(employee.hireDate).toLocaleDateString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleViewDetails(employee)} className="button-oulined flex items-center gap-2">
              <VscEye className="size-4" />
              View
            </button>
            <div className="relative" data-dropdown-root="employee-actions">
              <RxDotsVertical
                onClick={() => toggleDropdown(employee.id)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              />
              {activeDropdown === employee.id && (
                <div className="modal-style absolute right-0 top-full z-[100] mt-2 w-48 rounded border border-gray-300 bg-white shadow-lg">
                  <ul className="text-sm">
                    <li
                      className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleOpenStatusModal(employee)}
                    >
                      <VscEye />
                      Update Status
                    </li>
                    <li
                      className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                      onClick={handleOpenReminderModal}
                    >
                      <WiTime3 /> Send Reminder
                    </li>
                    <li
                      className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                      onClick={handleOpenSuspendModal}
                    >
                      <GoXCircle /> Suspend Account
                    </li>
                    <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100">
                      <PiNoteBold />
                      Export Data
                    </li>
                  </ul>
                </div>
              )}
            </div>
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

  if (isLoading) {
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
            <p className="text-2xl font-medium">All Employees</p>
            <div className="mt-2 flex gap-4">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by name, employee ID, or department"
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

              <button className="button-oulined" onClick={() => setShowDepartments(!showDepartments)}>
                {showDepartments ? "Hide Departments" : "Show Departments"}
              </button>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="button-oulined"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <button className="button-oulined" type="button">
                <IoMdFunnel />
                <p>Sort By</p>
              </button>
            </div>
          </div>

          {/* Employee Display Area */}
          <div className="w-full">
            {viewMode === "grid" ? (
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
              <select value={rowsPerPage} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
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
        <AnimatePresence initial={false}>
          {showDepartments && (
            <motion.div
              key="departments-sidebar"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="w-80 rounded-md border bg-white p-5"
            >
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Departments</h2>
              </div>

              <div className="mt-4 space-y-3">
                {departmentData.map((department, index) => (
                  <DepartmentCard key={index} department={department} />
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 rounded-lg bg-gray-50 p-3">
                <h3 className="mb-2 font-medium text-gray-900">Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Employees:</span>
                    <span className="font-medium">{totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active:</span>
                    <span className="font-medium">{Math.round(totalRecords * 0.8).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departments:</span>
                    <span className="font-medium">{departmentData.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Components - Only one modal can be open at a time */}
      {/* <EmployeeDetailsModal
        isOpen={activeModal === "details"}
        onRequestClose={closeAllModals}
        employee={selectedEmployee}
        onUpdateStatus={handleOpenStatusModal}
        onSendReminder={handleOpenReminderModal}
        onSuspendAccount={handleOpenSuspendModal}
      /> */}

      <SuspendAccountModal
        isOpen={activeModal === "suspend"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmSuspend}
      />

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
