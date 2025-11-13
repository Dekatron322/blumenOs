"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import CloseIcon from "public/close-icon"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearInviteStatus, fetchEmployees, inviteEmployees } from "lib/redux/employeeSlice"
import { fetchRoles } from "lib/redux/roleSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearDepartments, fetchDepartments } from "lib/redux/departmentSlice"

interface AddEmployeeModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
}

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

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onRequestClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { inviteLoading, inviteError, inviteSuccess, employees, employeesLoading } = useSelector(
    (state: RootState) => state.employee
  )
  const { roles, loading: rolesLoading } = useSelector((state: RootState) => state.roles)
  const { areaOffices, loading: areaOfficesLoading } = useSelector((state: RootState) => state.areaOffices)
  const { departments, loading: departmentsLoading } = useSelector((state: RootState) => state.departments)

  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVEmployee[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<EmployeeFormData>({
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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch roles, employees, area offices, and departments on modal open
  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchRoles({
          pageNumber: 1,
          pageSize: 100,
        })
      )

      dispatch(
        fetchEmployees({
          pageNumber: 1,
          pageSize: 100,
        })
      )

      dispatch(
        fetchAreaOffices({
          pageNumber: 1,
          pageSize: 100,
        })
      )

      dispatch(
        fetchDepartments({
          pageNumber: 1,
          pageSize: 100,
          isActive: true,
        })
      )
    }

    return () => {
      dispatch(clearAreaOffices())
      dispatch(clearDepartments())
    }
  }, [isOpen, dispatch])

  // Handle success and error states
  useEffect(() => {
    if (inviteSuccess) {
      notify("success", "Employees invited successfully", {
        description: `${
          activeTab === "single" ? "Employee" : csvData.length + " employees"
        } has been invited to the system`,
        duration: 5000,
      })

      if (onSuccess) onSuccess()
      handleClose()
    }

    if (inviteError) {
      notify("error", "Failed to invite employees", {
        description: inviteError,
        duration: 6000,
      })
    }
  }, [inviteSuccess, inviteError, activeTab, csvData.length, onSuccess])

  const handleClose = () => {
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
    setCsvFile(null)
    setCsvData([])
    setCsvErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ""
    dispatch(clearInviteStatus())
    onRequestClose()
  }

  // Generate options from API response
  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }))

  const areaOfficeOptions = [
    { value: 0, label: "Select area office" },
    ...areaOffices.map((areaOffice) => ({
      value: areaOffice.id,
      label: `${areaOffice.nameOfNewOAreaffice} (${areaOffice.newKaedcoCode})`,
    })),
  ]

  const departmentOptions = [
    { value: 0, label: "Select department" },
    ...departments.map((department) => ({
      value: department.id,
      label: `${department.name}${department.description ? ` - ${department.description}` : ""}`,
    })),
  ]

  const supervisorOptions = [
    { value: 0, label: "Select supervisor" },
    ...employees
      .filter((employee) => employee.isActive)
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

    let processedValue = value
    if (["areaOfficeId", "departmentId", "supervisorId"].includes(name)) {
      processedValue = Number(value)
    } else if (name === "roleIds") {
      processedValue = [Number(value)]
    } else if (name === "isActive") {
      processedValue = value === "true" || value === true
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required"
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }

    if (!formData.position.trim()) {
      errors.position = "Position is required"
    }

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

    if (!formData.emergencyContact.trim()) {
      errors.emergencyContact = "Emergency contact is required"
    }

    if (!formData.employmentType) {
      errors.employmentType = "Employment type is required"
    }

    if (formData.roleIds.length === 0 || formData.roleIds[0] === 0) {
      errors.roleIds = "Role is required"
    }

    if (formData.areaOfficeId === 0) {
      errors.areaOfficeId = "Area office is required"
    }

    if (formData.departmentId === 0) {
      errors.departmentId = "Department is required"
    }

    if (formData.supervisorId === 0) {
      errors.supervisorId = "Please select a supervisor or choose 'No supervisor'"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitSingleEmployee = async () => {
    if (!validateForm()) {
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

      await dispatch(inviteEmployees(inviteData)).unwrap()
    } catch (error: any) {
      console.error("Failed to invite employee:", error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".csv")) {
      notify("error", "Invalid file type", {
        description: "Please select a CSV file",
        duration: 4000,
      })
      return
    }

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
          "supervisorid",
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

    if (!row.roleids?.trim()) {
      errors.push(`Row ${rowNumber}: Role ID is required`)
    } else if (isNaN(parseInt(row.roleids))) {
      errors.push(`Row ${rowNumber}: Role ID must be a valid number`)
    }

    if (!row.areaofficeid?.trim()) {
      errors.push(`Row ${rowNumber}: Area office ID is required`)
    } else if (isNaN(parseInt(row.areaofficeid))) {
      errors.push(`Row ${rowNumber}: Area office ID must be a valid number`)
    }

    if (!row.departmentid?.trim()) {
      errors.push(`Row ${rowNumber}: Department ID is required`)
    } else if (isNaN(parseInt(row.departmentid))) {
      errors.push(`Row ${rowNumber}: Department ID must be a valid number`)
    }

    if (row.supervisorid?.trim() && isNaN(parseInt(row.supervisorid))) {
      errors.push(`Row ${rowNumber}: Supervisor ID must be a valid number`)
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
      const inviteData = {
        users: csvData,
      }

      await dispatch(inviteEmployees(inviteData)).unwrap()
    } catch (error: any) {
      console.error("Failed to process bulk upload:", error)
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

    const exampleRoleId = roles[0]?.id?.toString() ?? "1"
    const exampleAreaOfficeId = areaOffices[0]?.id?.toString() ?? "1"
    const exampleDepartmentId = departments[0]?.id?.toString() ?? "1"
    const exampleSupervisorId = employees[0]?.id?.toString() ?? "0"

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
        supervisorId: exampleSupervisorId,
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
        supervisorId: exampleSupervisorId,
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
      formData.emergencyContact.trim() !== "" &&
      formData.employmentType !== "" &&
      formData.roleIds.length > 0 &&
      formData.roleIds[0] !== 0 &&
      formData.areaOfficeId !== 0 &&
      formData.departmentId !== 0 &&
      formData.supervisorId !== 0
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[800px] max-w-4xl rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "single"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Single Entry
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "bulk" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Bulk Upload (CSV)
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {activeTab === "single" ? (
            <div className="mt-6 grid grid-cols-2 gap-6 px-6 pb-6">
              {/* Single Entry Form */}
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
                  { value: "", label: departmentsLoading ? "Loading departments..." : "Select department" },
                  ...departmentOptions.filter((option) => option.value !== 0),
                ]}
                error={formErrors.departmentId}
                required
                disabled={departmentsLoading}
              />

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
                required
              />

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
                options={[{ value: "", label: rolesLoading ? "Loading roles..." : "Select role" }, ...roleOptions]}
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
                    value: "",
                    label: areaOfficesLoading ? "Loading area offices..." : "Select area office",
                  },
                  ...areaOfficeOptions.filter((option) => option.value !== 0),
                ]}
                error={formErrors.areaOfficeId}
                required
                disabled={areaOfficesLoading}
              />

              <FormSelectModule
                label="Supervisor"
                name="supervisorId"
                value={formData.supervisorId}
                onChange={handleInputChange}
                options={[
                  { value: 0, label: employeesLoading ? "Loading supervisors..." : "Select supervisor" },
                  ...supervisorOptions.filter((option) => option.value !== 0),
                ]}
                error={formErrors.supervisorId}
                required
                disabled={employeesLoading}
              />

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

              {/* Error Display for Single Entry */}
              {Object.keys(formErrors).length > 0 && (
                <div className="col-span-2 rounded-md border border-amber-200 bg-amber-50 p-4">
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
            </div>
          ) : (
            <div className="p-6">
              {/* Bulk Upload Section */}
              <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-8 text-center">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv" className="hidden" />

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
                    <div className="mt-4 flex justify-center gap-3">
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
                          {inviteLoading ? "Processing..." : `Process ${csvData.length} Employees`}
                        </ButtonModule>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Template Download */}
              <div className="mb-6 flex items-center justify-between rounded-lg bg-blue-50 p-4">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                  <p className="text-sm text-blue-600">Download our CSV template to ensure proper formatting</p>
                </div>
                <ButtonModule variant="secondary" size="sm" onClick={downloadTemplate}>
                  Download Template
                </ButtonModule>
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
                      <h3 className="text-sm font-medium text-red-800">CSV Validation Errors ({csvErrors.length})</h3>
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
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                            Employee ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Position</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {csvData.slice(0, 5).map((employee, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{employee.employeeId}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{employee.fullName}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{employee.email}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{employee.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.length > 5 && (
                      <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-500">
                        ... and {csvData.length - 5} more records
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule
            variant="dangerSecondary"
            className="flex-1"
            size="lg"
            onClick={handleClose}
            disabled={inviteLoading}
          >
            Cancel
          </ButtonModule>
          {activeTab === "single" ? (
            <ButtonModule
              variant="primary"
              className="flex-1"
              size="lg"
              onClick={() => {
                void submitSingleEmployee()
              }}
              disabled={!isFormValid() || inviteLoading}
            >
              {inviteLoading ? "Adding Employee..." : "Add Employee"}
            </ButtonModule>
          ) : (
            <ButtonModule
              variant="primary"
              className="flex-1"
              size="lg"
              onClick={() => {
                void handleBulkSubmit()
              }}
              disabled={csvData.length === 0 || csvErrors.length > 0 || inviteLoading}
            >
              {inviteLoading ? "Processing..." : `Process ${csvData.length} Employees`}
            </ButtonModule>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AddEmployeeModal
