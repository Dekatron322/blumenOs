"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearInviteStatus, fetchEmployees, inviteEmployees } from "lib/redux/employeeSlice"
import { fetchRoles } from "lib/redux/roleSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearDepartments, fetchDepartments } from "lib/redux/departmentSlice"
import TempPasswordModal from "components/ui/Modal/temp-password-modal"
import { ChevronRight, Menu, X } from "lucide-react"
import { VscAdd, VscArrowLeft, VscArrowRight, VscChevronLeft, VscChevronRight } from "react-icons/vsc"

interface EmployeeFormData {
  fullName: string
  email: string
  phoneNumber: string
  roleIds: number[]
  areaOfficeId: number
  departmentId: number
  employeeId: string
  position: string
  emergencyContact: string
  address: string
  supervisorId: number
  employmentType: string
  isActive: boolean
}

interface CSVEmployee {
  employeeId: string
  fullName: string
  email: string
  phoneNumber: string
  roleIds: number[]
  areaOfficeId: number
  departmentId: number
  position: string
  emergencyContact: string
  address: string
  supervisorId: number
  employmentType: string
  isActive: boolean
}

const AddEmployeePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVEmployee[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showTempPasswordBanner, setShowTempPasswordBanner] = useState(false)
  const [copied, setCopied] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const [temporaryEmail, setTemporaryEmail] = useState<string | null>(null)

  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    roleIds: [], // Start with empty array
    areaOfficeId: 0, // Start with 0 for no selection
    departmentId: 0, // Start with 0 for no selection
    employeeId: "",
    position: "",
    emergencyContact: "",
    address: "",
    supervisorId: 0, // Start with 0 for no selection
    employmentType: "",
    isActive: true,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { inviteLoading, inviteError, inviteSuccess, invitedUsers, employees, employeesLoading, employeesError } =
    useSelector((state: RootState) => state.employee)
  const { roles, loading: rolesLoading, error: rolesError } = useSelector((state: RootState) => state.roles)
  const {
    areaOffices,
    loading: areaOfficesLoading,
    error: areaOfficesError,
  } = useSelector((state: RootState) => state.areaOffices)
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useSelector((state: RootState) => state.departments)

  // Fetch roles, employees, area offices, and departments on component mount
  useEffect(() => {
    dispatch(
      fetchRoles({
        pageNumber: 1,
        pageSize: 100, // Fetch a reasonable number of roles
      })
    )

    dispatch(
      fetchEmployees({
        pageNumber: 1,
        pageSize: 100, // Fetch a reasonable number of employees for supervisors
      })
    )

    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100, // Fetch a reasonable number of area offices
      })
    )

    dispatch(
      fetchDepartments({
        pageNumber: 1,
        pageSize: 100, // Fetch a reasonable number of departments
        isActive: true, // Only fetch active departments
      })
    )

    // Cleanup function to clear states when component unmounts
    return () => {
      dispatch(clearAreaOffices())
      dispatch(clearDepartments())
    }
  }, [dispatch])

  // Generate role options from API response
  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }))

  // Generate area office options from API response
  const areaOfficeOptions = [
    { value: 0, label: "Select area office" }, // Default option
    ...areaOffices.map((areaOffice) => ({
      value: areaOffice.id,
      label: `${areaOffice.nameOfNewOAreaffice} (${areaOffice.newKaedcoCode})`,
    })),
  ]

  // Generate department options from API response
  const departmentOptions = [
    { value: 0, label: "Select department" }, // Default option
    ...departments.map((department) => ({
      value: department.id,
      label: `${department.name}${department.description ? ` - ${department.description}` : ""}`,
    })),
  ]

  // Generate supervisor options from employees API response
  const supervisorOptions = [
    { value: 0, label: "Select supervisor" }, // Default option
    ...employees
      .filter((employee) => employee.isActive) // Only show active employees as supervisors
      .map((employee) => ({
        value: employee.id,
        label: `${employee.fullName} (${employee.email})`,
      })),
  ]

  const employmentTypeOptions = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
  ]

  const positionOptions = [
    { value: "Software Engineer", label: "Software Engineer" },
    { value: "Senior Developer", label: "Senior Developer" },
    { value: "HR Specialist", label: "HR Specialist" },
    { value: "Accountant", label: "Accountant" },
    { value: "Sales Representative", label: "Sales Representative" },
    { value: "Marketing Coordinator", label: "Marketing Coordinator" },
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (["areaOfficeId", "departmentId", "supervisorId"].includes(name)) {
      processedValue = Number(value)
    } else if (name === "roleIds") {
      processedValue = [Number(value)] // Single role for now, can be extended to multiple
    } else if (name === "isActive") {
      processedValue = value === "true" || value === true
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}

    switch (currentStep) {
      case 1: // Basic Information
        if (!formData.employeeId.trim()) {
          errors.employeeId = "Employee ID is required"
        }
        if (!formData.fullName.trim()) {
          errors.fullName = "Full name is required"
        }
        if (!formData.position.trim()) {
          errors.position = "Position is required"
        }
        if (!formData.departmentId || formData.departmentId === 0) {
          errors.departmentId = "Department is required"
        }
        break

      case 2: // Employment Details
        if (!formData.employmentType) {
          errors.employmentType = "Employment type is required"
        }
        if (formData.roleIds.length === 0 || formData.roleIds[0] === 0) {
          errors.roleIds = "Role is required"
        }
        if (formData.areaOfficeId === 0) {
          errors.areaOfficeId = "Area office is required"
        }
        break

      case 3: // Contact Information
        if (!formData.email.trim()) {
          errors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Please enter a valid email address"
        }
        if (!formData.phoneNumber.trim()) {
          errors.phoneNumber = "Phone number is required"
        } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
          errors.phoneNumber = "Please enter a valid Nigerian phone number"
        }
        if (!formData.address.trim()) {
          errors.address = "Address is required"
        }
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
      setIsMobileSidebarOpen(false)
    } else {
      notify("error", "Please fix the form errors before continuing", {
        description: "Some required fields are missing or contain invalid data",
        duration: 4000,
      })
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSingleEmployee()
  }

  const submitSingleEmployee = async () => {
    if (!validateCurrentStep()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const inviteData = {
        users: [formData],
      }

      const result = await dispatch(inviteEmployees(inviteData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Employee invited successfully", {
          description: `${formData.fullName} has been invited to the system`,
          duration: 5000,
        })

        // Capture temporary password if available
        if (result.data && result.data.length > 0) {
          const tempPassword = result.data[0]!.temporaryPassword
          const tempEmail = result.data[0]!.user.email ?? formData.email
          setTemporaryPassword(tempPassword)
          setTemporaryEmail(tempEmail)
          setShowTempPasswordBanner(true)
        }

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          roleIds: [],
          areaOfficeId: 0,
          departmentId: 0,
          employeeId: "",
          position: "",
          emergencyContact: "",
          address: "",
          supervisorId: 0,
          employmentType: "",
          isActive: true,
        })
        setFormErrors({})
        setCurrentStep(1)
      }
    } catch (error: any) {
      console.error("Failed to invite employee:", error)
      // Error is already handled in the slice, but we can show additional notification if needed
      if (!error?.includes("Network error")) {
        notify("error", "Failed to invite employee", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      roleIds: [],
      areaOfficeId: 0,
      departmentId: 0,
      employeeId: "",
      position: "",
      emergencyContact: "",
      address: "",
      supervisorId: 0,
      employmentType: "",
      isActive: true,
    })
    setFormErrors({})
    setCurrentStep(1)
    dispatch(clearInviteStatus())
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      notify("error", "Invalid file type", {
        description: "Please select a CSV file",
        duration: 4000,
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      notify("error", "File too large", {
        description: "Please select a CSV file smaller than 10MB",
        duration: 4000,
      })
      return
    }

    setCsvFile(file)
    setCsvErrors([])
    setCsvData([])
    parseCSVFile(file)
  }

  const parseCSVFile = (file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const lines = csvText.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          setCsvErrors(["CSV file is empty or has no data rows"])
          return
        }

        const headers = lines[0]!.split(",").map((header) => header.trim().toLowerCase())

        // Validate headers
        const expectedHeaders = [
          "employeeid",
          "fullname",
          "email",
          "phonenumber",
          "roleids",
          "areaofficeid",
          "departmentid",
          "position",
          "emergencycontact",
          "address",
          "employmenttype",
          "isactive",
        ]

        const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header))
        if (missingHeaders.length > 0) {
          setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
          return
        }

        const parsedData: CSVEmployee[] = []
        const errors: string[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]!.split(",").map((value) => value.trim())
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Incorrect number of columns`)
            continue
          }

          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })

          // Validate row data
          const rowErrors = validateCSVRow(row, i + 1)
          if (rowErrors.length > 0) {
            errors.push(...rowErrors)
          } else {
            parsedData.push({
              employeeId: row.employeeid,
              fullName: row.fullname,
              email: row.email,
              phoneNumber: row.phonenumber,
              roleIds: [parseInt(row.roleids) || 1],
              areaOfficeId: parseInt(row.areaofficeid) || 0,
              departmentId: parseInt(row.departmentid) || 0,
              position: row.position,
              emergencyContact: row.emergencycontact,
              address: row.address,
              supervisorId: parseInt(row.supervisorid) || 0,
              employmentType: row.employmenttype.toUpperCase(),
              isActive: row.isactive?.toLowerCase() === "true",
            })
          }
        }

        setCsvData(parsedData)
        setCsvErrors(errors)

        if (errors.length === 0) {
          notify("success", "CSV file parsed successfully", {
            description: `Found ${parsedData.length} valid employee records`,
            duration: 4000,
          })
        } else {
          notify("warning", "CSV file parsed with errors", {
            description: `Found ${parsedData.length} valid records and ${errors.length} errors`,
            duration: 5000,
          })
        }
      } catch (error) {
        console.error("Error parsing CSV:", error)
        setCsvErrors(["Failed to parse CSV file. Please check the file format."])
        notify("error", "CSV parsing failed", {
          description: "There was an error reading the CSV file",
          duration: 4000,
        })
      }
    }

    reader.onerror = () => {
      setCsvErrors(["Failed to read the file"])
      notify("error", "File reading failed", {
        description: "There was an error reading the selected file",
        duration: 4000,
      })
    }

    reader.readAsText(file)
  }

  const validateCSVRow = (row: any, rowNumber: number): string[] => {
    const errors: string[] = []

    if (!row.employeeid?.trim()) {
      errors.push(`Row ${rowNumber}: Employee ID is required`)
    }

    if (!row.fullname?.trim()) {
      errors.push(`Row ${rowNumber}: Full name is required`)
    }

    if (!row.position?.trim()) {
      errors.push(`Row ${rowNumber}: Position is required`)
    }

    if (!row.email?.trim()) {
      errors.push(`Row ${rowNumber}: Email is required`)
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push(`Row ${rowNumber}: Please enter a valid email address`)
    }

    if (!row.phonenumber?.trim()) {
      errors.push(`Row ${rowNumber}: Phone number is required`)
    } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(row.phonenumber.replace(/\s/g, ""))) {
      errors.push(`Row ${rowNumber}: Please enter a valid Nigerian phone number`)
    }

    if (!row.address?.trim()) {
      errors.push(`Row ${rowNumber}: Address is required`)
    }

    if (!row.emergencycontact?.trim()) {
      errors.push(`Row ${rowNumber}: Emergency contact is required`)
    }

    if (!row.employmenttype?.trim()) {
      errors.push(`Row ${rowNumber}: Employment type is required`)
    }

    // Validate role ID
    if (!row.roleids?.trim()) {
      errors.push(`Row ${rowNumber}: Role ID is required`)
    } else if (isNaN(parseInt(row.roleids))) {
      errors.push(`Row ${rowNumber}: Role ID must be a valid number`)
    }

    // Validate area office ID
    if (!row.areaofficeid?.trim()) {
      errors.push(`Row ${rowNumber}: Area office ID is required`)
    } else if (isNaN(parseInt(row.areaofficeid))) {
      errors.push(`Row ${rowNumber}: Area office ID must be a valid number`)
    }

    // Validate department ID
    if (!row.departmentid?.trim()) {
      errors.push(`Row ${rowNumber}: Department ID is required`)
    } else if (isNaN(parseInt(row.departmentid))) {
      errors.push(`Row ${rowNumber}: Department ID must be a valid number`)
    }

    return errors
  }

  const handleBulkSubmit = async () => {
    if (csvData.length === 0) {
      notify("error", "No valid data to upload", {
        description: "Please check your CSV file for errors",
        duration: 4000,
      })
      return
    }

    if (csvErrors.length > 0) {
      notify("error", "Please fix CSV errors before uploading", {
        description: "There are validation errors in your CSV file",
        duration: 4000,
      })
      return
    }

    try {
      // Transform CSVEmployee to InviteUserRequest by adding missing supervisorId
      const inviteData = {
        users: csvData.map((employee) => ({
          ...employee,
          supervisorId: 0, // Add default supervisorId - you may want to make this configurable
        })),
      }

      const result = await dispatch(inviteEmployees(inviteData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Employees invited successfully", {
          description: `${csvData.length} employees have been invited to the system`,
          duration: 6000,
        })

        // Reset form
        setCsvFile(null)
        setCsvData([])
        setCsvErrors([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    } catch (error: any) {
      console.error("Failed to process bulk upload:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Bulk upload processing failed", {
          description: error || "There was an error processing the bulk upload",
          duration: 6000,
        })
      }
    }
  }

  const downloadTemplate = () => {
    const headers = [
      "employeeId",
      "fullName",
      "email",
      "phoneNumber",
      "roleIds",
      "areaOfficeId",
      "departmentId",
      "position",
      "emergencyContact",
      "address",
      "supervisorId",
      "employmentType",
      "isActive",
    ]

    // Use actual role IDs from the API for the template
    const exampleRoleId = roles[0]?.id?.toString() ?? "1"
    // Use actual area office IDs from the API for the template
    const exampleAreaOfficeId = areaOffices[0]?.id?.toString() ?? "1"
    // Use actual department IDs from the API for the template
    const exampleDepartmentId = departments[0]?.id?.toString() ?? "1"

    const exampleData = [
      {
        employeeId: "EMP00123",
        fullName: "John Doe",
        email: "john.doe@company.com",
        phoneNumber: "08012345678",
        roleIds: exampleRoleId,
        areaOfficeId: exampleAreaOfficeId,
        departmentId: exampleDepartmentId,
        position: "Software Engineer",
        emergencyContact: "08087654321",
        address: "123 Main Street, Lagos",
        supervisorId: "0",
        employmentType: "FULL_TIME",
        isActive: "true",
      },
      {
        employeeId: "EMP00124",
        fullName: "Jane Smith",
        email: "jane.smith@company.com",
        phoneNumber: "08087654321",
        roleIds: exampleRoleId,
        areaOfficeId: exampleAreaOfficeId,
        departmentId: exampleDepartmentId,
        position: "HR Specialist",
        emergencyContact: "08012345678",
        address: "456 Broad Avenue, Abuja",
        supervisorId: "0",
        employmentType: "FULL_TIME",
        isActive: "true",
      },
    ]

    let csvContent = headers.join(",") + "\n"
    exampleData.forEach((row) => {
      csvContent += headers.map((header) => row[header as keyof typeof row]).join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employee_invite_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    notify("success", "Template downloaded", {
      description: "CSV template has been downloaded successfully",
      duration: 3000,
    })
  }

  const isFormValid = (): boolean => {
    return (
      formData.employeeId.trim() !== "" &&
      formData.fullName.trim() !== "" &&
      formData.position.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.employmentType !== "" &&
      formData.roleIds.length > 0 &&
      formData.roleIds[0] !== 0 &&
      formData.areaOfficeId !== 0 &&
      formData.departmentId !== 0
    )
  }

  // Clear success/error states when switching tabs
  React.useEffect(() => {
    if (inviteSuccess || inviteError) {
      dispatch(clearInviteStatus())
    }
  }, [activeTab, dispatch])

  useEffect(() => {
    if (inviteSuccess && invitedUsers && invitedUsers.length > 0) {
      setShowTempPasswordBanner(true)
      setCopied(false)
      setTemporaryPassword(invitedUsers[0]!.temporaryPassword)
      setTemporaryEmail(invitedUsers[0]!.user.email)
    }
  }, [inviteSuccess, invitedUsers])

  // Show error notification if area offices fail to load
  useEffect(() => {
    if (areaOfficesError) {
      notify("error", "Failed to load area offices", {
        description: areaOfficesError,
        duration: 5000,
      })
    }
  }, [areaOfficesError])

  // Show error notification if departments fail to load
  useEffect(() => {
    if (departmentsError) {
      notify("error", "Failed to load departments", {
        description: departmentsError,
        duration: 5000,
      })
    }
  }, [departmentsError])

  // Mobile Step Navigation
  const MobileStepNavigation = () => (
    <div className="sticky top-0 z-40 mb-4 rounded-lg bg-white p-3 shadow-sm sm:hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
          onClick={() => setIsMobileSidebarOpen(true)}
        >
          <Menu className="size-4" />
          <span>Step {currentStep}/3</span>
        </button>
        <div className="text-sm font-medium text-gray-900">
          {currentStep === 1 && "Basic Info"}
          {currentStep === 2 && "Employment"}
          {currentStep === 3 && "Contact"}
        </div>
      </div>
    </div>
  )

  // Step progress component for desktop
  const StepProgress = () => (
    <div className="mb-6 hidden sm:block">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 ${
                  step === currentStep
                    ? "border-[#004B23] bg-[#004B23] text-white"
                    : step < currentStep
                    ? "border-[#004B23] bg-[#004B23] text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step < currentStep ? (
                  <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`mt-2 hidden text-xs font-medium md:block ${
                  step === currentStep ? "text-[#004B23]" : "text-gray-500"
                }`}
              >
                {step === 1 && "Basic Info"}
                {step === 2 && "Employment"}
                {step === 3 && "Contact"}
              </span>
            </div>
            {step < 3 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  // Mobile Sidebar Component for Single Entry Form
  const MobileStepSidebar = () => (
    <AnimatePresence>
      {isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 sm:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-xl sm:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Form Steps</h3>
                  <button
                    type="button"
                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-600">Navigate through form steps</p>
              </div>

              {/* Steps List */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {[
                    { step: 1, title: "Basic Information", description: "Employee basic details" },
                    { step: 2, title: "Employment Details", description: "Work arrangements and role" },
                    { step: 3, title: "Contact Information", description: "Contact and address details" },
                  ].map((item) => (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => {
                        setCurrentStep(item.step)
                        setIsMobileSidebarOpen(false)
                      }}
                      className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                        item.step === currentStep ? "bg-[#004B23] text-white" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full ${
                          item.step === currentStep
                            ? "bg-white text-[#004B23]"
                            : item.step < currentStep
                            ? "bg-[#004B23] text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.step < currentStep ? (
                          <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          item.step
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm font-medium ${
                            item.step === currentStep ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </div>
                        <div
                          className={`mt-1 text-xs ${item.step === currentStep ? "text-gray-200" : "text-gray-600"}`}
                        >
                          {item.description}
                        </div>
                      </div>
                      {item.step === currentStep && <ChevronRight className="size-4 flex-shrink-0" />}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t bg-gray-50 p-4">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={inviteLoading}
                    className="w-full rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900"
                  >
                    Close Menu
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Mobile Bottom Navigation Bar
  const MobileBottomNavigation = () => (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-lg sm:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={inviteLoading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <VscChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={inviteLoading}
            className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={inviteLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Next</span>
              <VscChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitSingleEmployee}
              disabled={!isFormValid() || inviteLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inviteLoading ? "Inviting..." : "Invite Employee"}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 md:py-4 2xl:px-16">
            {/* Page Header - Mobile Optimized */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 sm:hidden"
                    aria-label="Go back"
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
                      />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Invite New Employee</h1>
                    <p className="text-sm text-gray-600">Invite a new employee to join the system</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={
                      activeTab === "single"
                        ? handleReset
                        : () => {
                            setCsvFile(null)
                            setCsvData([])
                            setCsvErrors([])
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }
                    }
                    disabled={inviteLoading}
                  >
                    {activeTab === "single" ? "Reset Form" : "Clear CSV"}
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={
                      activeTab === "single"
                        ? () => {
                            void submitSingleEmployee()
                          }
                        : () => {
                            void handleBulkSubmit()
                          }
                    }
                    disabled={
                      activeTab === "single"
                        ? !isFormValid() || inviteLoading
                        : csvData.length === 0 || csvErrors.length > 0 || inviteLoading
                    }
                    icon={<VscAdd />}
                    iconPosition="start"
                  >
                    {activeTab === "single"
                      ? inviteLoading
                        ? "Inviting..."
                        : "Invite Employee"
                      : inviteLoading
                      ? "Processing..."
                      : `Invite ${csvData.length} Employees`}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            {/* <div className="mb-4">
              <div className="rounded-t-lg border-b border-gray-200 bg-white">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("single")}
                    className={`flex-1 rounded-tl-lg px-4 py-3 text-sm font-medium transition-colors sm:px-6 sm:py-4 ${
                      activeTab === "single"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Single Invite
                  </button>
                  <button
                    onClick={() => setActiveTab("bulk")}
                    className={`flex-1 rounded-tr-lg px-4 py-3 text-sm font-medium transition-colors sm:px-6 sm:py-4 ${
                      activeTab === "bulk"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Bulk Invite (CSV)
                  </button>
                </div>
              </div>
            </div> */}

            {/* Mobile Step Navigation for Single Entry */}
            {activeTab === "single" && <MobileStepNavigation />}

            {/* Mobile Step Sidebar for Single Entry */}
            {activeTab === "single" && <MobileStepSidebar />}

            {/* Main Content Area */}
            <div className="w-full">
              {activeTab === "single" ? (
                /* Single Entry Form */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
                >
                  {/* Form Header */}
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Employee Information</h3>
                    <p className="text-sm text-gray-600">Fill in all required fields to invite a new employee</p>
                  </div>

                  {/* Desktop Step Progress */}
                  <div className="hidden sm:block">
                    <StepProgress />
                  </div>

                  {/* Employee Form */}
                  <form onSubmit={handleSingleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {/* Step 1: Basic Information */}
                      {currentStep === 1 && (
                        <motion.div
                          key="step-1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6"
                        >
                          <div className="border-b pb-3">
                            <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                            <p className="text-sm text-gray-600">Enter the employee&apos;s basic details</p>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                            <FormInputModule
                              label="Employee ID"
                              name="employeeId"
                              type="text"
                              placeholder="Enter employee ID (e.g., EMP00123)"
                              value={formData.employeeId}
                              onChange={handleInputChange}
                              error={formErrors.employeeId}
                              required
                            />

                            <FormInputModule
                              label="Full Name"
                              name="fullName"
                              type="text"
                              placeholder="Enter employee full name"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              error={formErrors.fullName}
                              required
                            />

                            <FormInputModule
                              label="Position"
                              name="position"
                              type="text"
                              placeholder="Enter employee position"
                              value={formData.position}
                              onChange={handleInputChange}
                              error={formErrors.position}
                              required
                            />

                            <FormSelectModule
                              label="Department"
                              name="departmentId"
                              value={formData.departmentId}
                              onChange={handleInputChange}
                              options={[
                                {
                                  value: "",
                                  label: departmentsLoading ? "Loading departments..." : "Select department",
                                },
                                ...departmentOptions.filter((option) => option.value !== 0),
                              ]}
                              error={formErrors.departmentId}
                              required
                              disabled={departmentsLoading}
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Step 2: Employment Details */}
                      {currentStep === 2 && (
                        <motion.div
                          key="step-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6"
                        >
                          <div className="border-b pb-3">
                            <h4 className="text-lg font-medium text-gray-900">Employment Details</h4>
                            <p className="text-sm text-gray-600">Configure the employee&apos;s work arrangements</p>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                            <FormSelectModule
                              label="Employment Type"
                              name="employmentType"
                              value={formData.employmentType}
                              onChange={handleInputChange}
                              options={[{ value: "", label: "Select employment type" }, ...employmentTypeOptions]}
                              error={formErrors.employmentType}
                              required
                            />

                            <FormSelectModule
                              label="Role"
                              name="roleIds"
                              value={formData.roleIds[0] ?? ""}
                              onChange={handleInputChange}
                              options={[
                                { value: "", label: rolesLoading ? "Loading roles..." : "Select role" },
                                ...roleOptions,
                              ]}
                              error={formErrors.roleIds}
                              required
                              disabled={rolesLoading}
                            />

                            <FormSelectModule
                              label="Area Office"
                              name="areaOfficeId"
                              value={formData.areaOfficeId}
                              onChange={handleInputChange}
                              options={[
                                {
                                  value: 0,
                                  label: "Select area office",
                                },
                                ...areaOfficeOptions.filter((option) => option.value !== 0),
                              ]}
                              error={formErrors.areaOfficeId}
                              required
                              disabled={areaOfficesLoading}
                            />

                            {/* <FormSelectModule
                              label="Supervisor"
                              name="supervisorId"
                              value={formData.supervisorId}
                              onChange={handleInputChange}
                              options={supervisorOptions}
                              disabled={employeesLoading}
                            /> */}

                            <FormSelectModule
                              label="Status"
                              name="isActive"
                              value={formData.isActive.toString()}
                              onChange={handleInputChange}
                              options={[
                                { value: "true", label: "Active" },
                                { value: "false", label: "Inactive" },
                              ]}
                              required
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3: Contact Information */}
                      {currentStep === 3 && (
                        <motion.div
                          key="step-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6"
                        >
                          <div className="border-b pb-3">
                            <h4 className="text-lg font-medium text-gray-900">Contact Information</h4>
                            <p className="text-sm text-gray-600">Provide contact details and address information</p>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                            <FormInputModule
                              label="Email Address"
                              name="email"
                              type="email"
                              placeholder="Enter email address"
                              value={formData.email}
                              onChange={handleInputChange}
                              error={formErrors.email}
                              required
                            />

                            <FormInputModule
                              label="Phone Number"
                              name="phoneNumber"
                              type="tel"
                              placeholder="Enter phone number (e.g., 08099998888)"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              error={formErrors.phoneNumber}
                              required
                            />

                            <FormInputModule
                              label="Emergency Contact"
                              name="emergencyContact"
                              type="tel"
                              placeholder="Enter emergency contact number"
                              value={formData.emergencyContact}
                              onChange={handleInputChange}
                              error={formErrors.emergencyContact}
                            />

                            <div className="sm:col-span-2">
                              <FormInputModule
                                label="Address"
                                name="address"
                                type="text"
                                placeholder="Enter complete address"
                                value={formData.address}
                                onChange={handleInputChange}
                                error={formErrors.address}
                                required
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error Summary */}
                    {Object.keys(formErrors).length > 0 && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Form validation errors</h3>
                            <div className="mt-2 text-sm text-amber-700">
                              <ul className="list-disc space-y-1 pl-5">
                                {Object.values(formErrors).map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Desktop Form Actions */}
                    <div className="hidden justify-between gap-4 border-t pt-6 sm:flex">
                      <div className="flex gap-4">
                        {currentStep > 1 && (
                          <ButtonModule
                            variant="outline"
                            size="md"
                            onClick={prevStep}
                            disabled={inviteLoading}
                            type="button"
                            icon={<VscArrowLeft />}
                            iconPosition="start"
                          >
                            Previous
                          </ButtonModule>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <ButtonModule
                          variant="dangerSecondary"
                          size="md"
                          onClick={handleReset}
                          disabled={inviteLoading}
                          type="button"
                        >
                          Reset
                        </ButtonModule>

                        {currentStep < 3 ? (
                          <ButtonModule
                            variant="primary"
                            size="md"
                            onClick={nextStep}
                            type="button"
                            icon={<VscArrowRight />}
                            iconPosition="end"
                          >
                            Next
                          </ButtonModule>
                        ) : (
                          <ButtonModule
                            variant="primary"
                            size="md"
                            type="submit"
                            disabled={!isFormValid() || inviteLoading}
                          >
                            {inviteLoading ? "Inviting Employee..." : "Invite Employee"}
                          </ButtonModule>
                        )}
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* Bulk Upload Section */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
                >
                  {/* Template Download */}
                  <div className="mb-6 rounded-lg bg-blue-50 p-4">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                        <p className="text-sm text-blue-600">Download our CSV template to ensure proper formatting</p>
                      </div>
                      <ButtonModule variant="primary" size="sm" onClick={downloadTemplate}>
                        Download Template
                      </ButtonModule>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-6 text-center sm:p-8">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".csv"
                      className="hidden"
                    />

                    {!csvFile ? (
                      <div>
                        <svg
                          className="mx-auto size-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <div className="mt-4 flex w-full flex-col items-center justify-center">
                          <ButtonModule variant="primary" onClick={() => fileInputRef.current?.click()}>
                            Choose CSV File
                          </ButtonModule>
                          <p className="mt-2 text-sm text-gray-600">or drag and drop your file here</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">CSV files only (max 10MB)</p>
                      </div>
                    ) : (
                      <div>
                        <svg
                          className="mx-auto size-12 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-gray-900">{csvFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {csvData.length} valid records found
                          {csvErrors.length > 0 && `, ${csvErrors.length} errors`}
                        </p>
                        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                          <ButtonModule
                            variant="secondary"
                            onClick={() => {
                              setCsvFile(null)
                              setCsvData([])
                              setCsvErrors([])
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ""
                              }
                            }}
                          >
                            Choose Different File
                          </ButtonModule>
                          {csvErrors.length === 0 && csvData.length > 0 && (
                            <ButtonModule variant="primary" onClick={handleBulkSubmit} disabled={inviteLoading}>
                              {inviteLoading ? "Processing..." : `Invite ${csvData.length} Employees`}
                            </ButtonModule>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CSV Errors Display */}
                  {csvErrors.length > 0 && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                      <div className="flex">
                        <div className="shrink-0">
                          <svg className="size-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-red-800">
                            CSV Validation Errors ({csvErrors.length})
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="max-h-32 space-y-1 overflow-y-auto">
                              {csvErrors.map((error, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{error}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview of Valid Data */}
                  {csvData.length > 0 && (
                    <div className="rounded-md border border-gray-200">
                      <div className="bg-gray-50 px-4 py-3">
                        <h3 className="text-sm font-medium text-gray-900">Preview ({csvData.length} valid records)</h3>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Employee ID
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Email
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Position
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Role ID
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {csvData.slice(0, 5).map((employee, index) => (
                                <tr key={index}>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {employee.employeeId}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {employee.fullName}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {employee.email}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {employee.position}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {employee.roleIds[0]}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {csvData.length > 5 && (
                          <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-500">
                            ... and {csvData.length - 5} more records
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation for Single Entry */}
      {activeTab === "single" && <MobileBottomNavigation />}

      <TempPasswordModal
        isOpen={showTempPasswordBanner && !!temporaryPassword}
        onRequestClose={() => {
          setShowTempPasswordBanner(false)
          setCopied(false)
          setTemporaryPassword(null)
          setTemporaryEmail(null)
        }}
        temporaryPassword={temporaryPassword}
        email={temporaryEmail}
      />
    </section>
  )
}

export default AddEmployeePage
