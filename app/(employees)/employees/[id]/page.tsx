"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Power,
  Share2,
  Shield,
  User,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import UpdateStatusModal from "components/ui/Modal/update-status-modal"
import SuspendAccountModal from "components/ui/Modal/suspend-account-modal"
import DashboardNav from "components/Navbar/DashboardNav"
import {
  CalendarOutlineIcon,
  EmailOutlineIcon,
  ExportOutlineIcon,
  FinanceOutlineIcon,
  MapOutlineIcon,
  NotificationOutlineIcon,
  PhoneOutlineIcon,
  SettingOutlineIcon,
  UpdateUserOutlineIcon,
} from "components/Icons/Icons"

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
  manager: string
  employeeCount: number
  location: string
}

// Modern data generation for employees
const generateSampleEmployee = (id: string): Employee => {
  const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn"]
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
  const positions = [
    "Software Engineer",
    "HR Specialist",
    "Sales Manager",
    "Marketing Coordinator",
    "Operations Manager",
    "Finance Analyst",
    "Customer Support",
    "Product Manager",
  ]
  const departments = ["IT", "HR", "Sales", "Marketing", "Operations", "Finance", "Customer Service", "R&D"]
  const workLocations = ["Head Office", "Branch A", "Branch B", "Branch C", "Remote"]
  const supervisors = [
    "Sarah Johnson",
    "Michael Chen",
    "David Wilson",
    "Lisa Rodriguez",
    "James Thompson",
    "Karen Smith",
  ]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]!
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]!
  const position = positions[Math.floor(Math.random() * positions.length)]!
  const department = departments[Math.floor(Math.random() * departments.length)]!
  const workLocation = workLocations[Math.floor(Math.random() * workLocations.length)]!
  const supervisor = supervisors[Math.floor(Math.random() * supervisors.length)]!

  return {
    id,
    employeeId: `EMP${80000 + Math.floor(Math.random() * 20000)}`,
    fullName: `${firstName} ${lastName}`,
    position,
    department,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    phoneNumber: `+1 (${555 + Math.floor(Math.random() * 445)}) ${100 + Math.floor(Math.random() * 900)}-${
      1000 + Math.floor(Math.random() * 9000)
    }`,
    hireDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString(),
    status: ["ACTIVE", "INACTIVE", "SUSPENDED"][Math.floor(Math.random() * 3)] as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    salary: (Math.random() * 80000 + 40000).toFixed(2),
    address: `${Math.floor(Math.random() * 1000) + 1} ${
      ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln"][Math.floor(Math.random() * 4)]
    }, ${["New York", "Los Angeles", "Chicago", "Houston"][Math.floor(Math.random() * 4)]}`,
    emergencyContact: `+1 (${555 + Math.floor(Math.random() * 445)}) ${100 + Math.floor(Math.random() * 900)}-${
      1000 + Math.floor(Math.random() * 9000)
    }`,
    supervisor,
    employmentType: ["FULL_TIME", "PART_TIME", "CONTRACT"][Math.floor(Math.random() * 3)] as
      | "FULL_TIME"
      | "PART_TIME"
      | "CONTRACT",
    workLocation,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const generateDepartmentInfo = (department: string): Department => {
  const managers = [
    "Sarah Johnson",
    "Michael Chen",
    "David Wilson",
    "Lisa Rodriguez",
    "James Thompson",
    "Karen Smith",
    "Robert Brown",
    "Emily Zhang",
  ]
  const locations = ["Head Office", "Floor 2", "Floor 5", "Annex Building", "Remote Hub"]

  return {
    name: department,
    manager: managers[Math.floor(Math.random() * managers.length)]!,
    employeeCount: Math.floor(Math.random() * 50) + 10,
    location: locations[Math.floor(Math.random() * locations.length)]!,
  }
}

const EmployeeDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [departmentInfo, setDepartmentInfo] = useState<Department | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<"suspend" | "reminder" | "status" | null>(null)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const employeeData = generateSampleEmployee(employeeId)
      const deptInfo = generateDepartmentInfo(employeeData.department)

      setEmployee(employeeData)
      setDepartmentInfo(deptInfo)
      setIsLoading(false)
    }

    if (employeeId) {
      fetchEmployeeData()
    }
  }, [employeeId])

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
      INACTIVE: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
      SUSPENDED: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle },
    }
    return configs[status as keyof typeof configs] || configs.INACTIVE
  }

  const getEmploymentTypeConfig = (type: string) => {
    const configs = {
      FULL_TIME: { color: "text-blue-600", bg: "bg-blue-50" },
      PART_TIME: { color: "text-purple-600", bg: "bg-purple-50" },
      CONTRACT: { color: "text-orange-600", bg: "bg-orange-50" },
    }
    return configs[type as keyof typeof configs] || configs.FULL_TIME
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (modalType: "suspend" | "reminder" | "status") => setActiveModal(modalType)

  const handleConfirmSuspend = () => {
    console.log("Employee suspended")
    closeAllModals()
  }

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const calculateTenure = (hireDate: string) => {
    const hire = new Date(hireDate)
    const now = new Date()
    const years = now.getFullYear() - hire.getFullYear()
    const months = now.getMonth() - hire.getMonth()

    if (months < 0) {
      return `${years - 1} years ${12 + months} months`
    }
    return `${years} years ${months} months`
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Employee Not Found</h1>
          <p className="mb-6 text-gray-600">The employee you&apos;re looking for doesn&apos;t exist.</p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Employees
          </ButtonModule>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(employee.status)
  const employmentTypeConfig = getEmploymentTypeConfig(employee.employmentType)
  const StatusIcon = statusConfig.icon
  const tenure = calculateTenure(employee.hireDate)

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-16 py-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      type="button"
                      onClick={() => router.back()}
                      className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-[#f9f9f9] text-gray-700 hover:bg-gray-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      aria-label="Go back"
                      title="Go back"
                    >
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="new-arrow-right rotate-180 transform"
                      >
                        <path
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
                      <p className="text-gray-600">Complete overview and management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ButtonModule variant="secondary" size="sm" className="flex items-center gap-2">
                      <ExportOutlineIcon className="size-4" />
                      Export
                    </ButtonModule>
                    <ButtonModule variant="secondary" size="sm" className="flex items-center gap-2">
                      <Share2 className="size-4" />
                      Share
                    </ButtonModule>
                    <ButtonModule variant="primary" size="sm" className="flex items-center gap-2">
                      <Edit3 className="size-4" />
                      Edit
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-16 py-8">
              <div className="flex w-full gap-6">
                {/* Left Column - Profile & Quick Actions */}
                <div className="flex w-[30%] flex-col space-y-6 xl:col-span-1">
                  {/* Profile Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f9f9f9] text-3xl font-bold text-[#0a0a0a]">
                          {employee.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div
                          className={`absolute -right-1 bottom-1 ${statusConfig.bg} ${statusConfig.border} rounded-full border-2 p-1.5`}
                        >
                          <StatusIcon className={`size-4 ${statusConfig.color}`} />
                        </div>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-gray-900">{employee.fullName}</h2>
                      <p className="mb-4 text-gray-600">Employee #{employee.employeeId}</p>

                      <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          {employee.status}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${employmentTypeConfig.bg} ${employmentTypeConfig.color}`}
                        >
                          {employee.employmentType.replace("_", " ")}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600">
                          <PhoneOutlineIcon />
                          {employee.phoneNumber}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <EmailOutlineIcon />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapOutlineIcon className="size-4" />
                          {employee.workLocation}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <SettingOutlineIcon />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-start gap-3"
                        onClick={() => openModal("reminder")}
                      >
                        <NotificationOutlineIcon />
                        Send Reminder
                      </ButtonModule>
                      <ButtonModule
                        variant="secondary"
                        className="w-full justify-start gap-3"
                        onClick={() => openModal("status")}
                      >
                        <UpdateUserOutlineIcon />
                        Update Status
                      </ButtonModule>
                      <ButtonModule
                        variant="danger"
                        className="w-full justify-start gap-3"
                        onClick={() => openModal("suspend")}
                      >
                        <Power className="size-4" />
                        Suspend Account
                      </ButtonModule>
                    </div>
                  </motion.div>

                  {/* Compensation Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-lg border bg-white p-6"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <FinanceOutlineIcon />
                      Compensation
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="mb-2 text-3xl font-bold text-gray-900">
                          ${parseFloat(employee.salary).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Annual Salary</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-emerald-600">
                            $
                            {(parseFloat(employee.salary) / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-gray-600">Monthly</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{tenure}</div>
                          <div className="text-xs text-gray-600">Tenure</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="flex w-full flex-col space-y-6 xl:col-span-2">
                  {/* Employment Information */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Briefcase className="size-5" />
                      Employment Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Employee ID</label>
                          <p className="font-semibold text-gray-900">{employee.employeeId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Position</label>
                          <p className="font-semibold text-gray-900">{employee.position}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Department</label>
                          <p className="font-semibold text-gray-900">{employee.department}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Employment Type</label>
                          <p className="font-semibold text-gray-900">{employee.employmentType.replace("_", " ")}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Work Location</label>
                          <p className="font-semibold text-gray-900">{employee.workLocation}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Supervisor</label>
                          <p className="font-semibold text-gray-900">{employee.supervisor}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact & Personal Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <User className="size-5" />
                      Contact & Personal Details
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Phone className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                            <p className="font-semibold text-gray-900">{employee.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <Mail className="size-5 text-green-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email Address</label>
                            <p className="font-semibold text-gray-900">{employee.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <MapPin className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Home Address</label>
                            <p className="font-semibold text-gray-900">{employee.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                            <Shield className="size-5 text-red-600" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                            <p className="font-semibold text-gray-900">{employee.emergencyContact}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Department Information */}
                  {departmentInfo && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Briefcase className="size-5" />
                        Department Information
                      </h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Department Manager</label>
                            <p className="font-semibold text-gray-900">{departmentInfo.manager}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Department Location</label>
                            <p className="font-semibold text-gray-900">{departmentInfo.location}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Total Employees</label>
                            <p className="font-semibold text-gray-900">{departmentInfo.employeeCount}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Department</label>
                            <p className="font-semibold text-gray-900">{departmentInfo.name}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Team Size Rank</label>
                            <p className="font-semibold text-gray-900">
                              {departmentInfo.employeeCount > 40
                                ? "Large"
                                : departmentInfo.employeeCount > 20
                                ? "Medium"
                                : "Small"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Office Type</label>
                            <p className="font-semibold text-gray-900">
                              {departmentInfo.location.includes("Remote") ? "Remote" : "On-site"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Compensation Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <DollarSign className="size-5" />
                      Compensation Details
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Annual Salary</label>
                          <p className="text-2xl font-bold text-gray-900">
                            ${parseFloat(employee.salary).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Monthly Equivalent</label>
                          <p className="text-lg font-semibold text-gray-900">
                            $
                            {(parseFloat(employee.salary) / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Employment Type</label>
                          <p className="font-semibold text-gray-900">{employee.employmentType.replace("_", " ")}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Pay Frequency</label>
                          <p className="font-semibold text-gray-900">Monthly</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Employment Timeline */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Calendar className="size-5" />
                      Employment Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Calendar className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Hire Date</h4>
                            <p className="text-sm text-gray-600">Employee joined the company</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(employee.hireDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-600">{tenure} tenure</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <Calendar className="size-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Profile Updated</h4>
                            <p className="text-sm text-gray-600">Last profile modification</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(employee.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(employee.updatedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {/* <UpdateStatusModal isOpen={activeModal === "status"} onRequestClose={closeAllModals} employee={employee} /> */}
    </section>
  )
}

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-md bg-gray-200"></div>
          <div>
            <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column Skeleton */}
        <div className="w-[30%] space-y-6">
          {/* Profile Card Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gray-200"></div>
                <div className="absolute -right-1 bottom-1 h-6 w-6 rounded-full bg-gray-200"></div>
              </div>
              <div className="mx-auto mb-2 h-6 w-32 rounded bg-gray-200"></div>
              <div className="mx-auto mb-4 h-4 w-24 rounded bg-gray-200"></div>
              <div className="mb-6 flex justify-center gap-2">
                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Compensation Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-2 h-8 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="h-6 w-16 rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-12 rounded bg-gray-200"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 w-20 rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-12 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 h-6 w-48 rounded bg-gray-200"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default EmployeeDetailsPage
