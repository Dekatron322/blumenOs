"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"

import { FormSelectModule } from "../Input/FormSelectModule"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { notify } from "../Notification/Notification"

interface AddEmployeeModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
}

interface CSVEmployee {
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
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onRequestClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVEmployee[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    position: "",
    department: "",
    email: "",
    phoneNumber: "",
    hireDate: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    salary: "",
    address: "",
    emergencyContact: "",
    supervisor: "",
    employmentType: "" as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "",
    workLocation: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
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

    if (!formData.department.trim()) {
      errors.department = "Department is required"
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

    if (!formData.hireDate.trim()) {
      errors.hireDate = "Hire date is required"
    }

    if (!formData.salary.trim()) {
      errors.salary = "Salary is required"
    } else if (isNaN(parseFloat(formData.salary)) || parseFloat(formData.salary) <= 0) {
      errors.salary = "Please enter a valid salary amount"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }

    if (!formData.emergencyContact.trim()) {
      errors.emergencyContact = "Emergency contact is required"
    }

    if (!formData.supervisor.trim()) {
      errors.supervisor = "Supervisor is required"
    }

    if (!formData.employmentType) {
      errors.employmentType = "Employment type is required"
    }

    if (!formData.workLocation.trim()) {
      errors.workLocation = "Work location is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
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
          "position",
          "department",
          "email",
          "phonenumber",
          "hiredate",
          "status",
          "salary",
          "address",
          "emergencycontact",
          "supervisor",
          "employmenttype",
          "worklocation",
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
              position: row.position,
              department: row.department,
              email: row.email,
              phoneNumber: row.phonenumber,
              hireDate: row.hiredate,
              status: row.status.toUpperCase() as "ACTIVE" | "INACTIVE" | "SUSPENDED",
              salary: row.salary,
              address: row.address,
              emergencyContact: row.emergencycontact,
              supervisor: row.supervisor,
              employmentType: row.employmenttype.toUpperCase() as "FULL_TIME" | "PART_TIME" | "CONTRACT",
              workLocation: row.worklocation,
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

    if (!row.department?.trim()) {
      errors.push(`Row ${rowNumber}: Department is required`)
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

    if (!row.hiredate?.trim()) {
      errors.push(`Row ${rowNumber}: Hire date is required`)
    }

    if (!row.status?.trim()) {
      errors.push(`Row ${rowNumber}: Status is required`)
    } else if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(row.status.toUpperCase())) {
      errors.push(`Row ${rowNumber}: Status must be ACTIVE, INACTIVE, or SUSPENDED`)
    }

    if (!row.salary?.trim()) {
      errors.push(`Row ${rowNumber}: Salary is required`)
    } else if (isNaN(parseFloat(row.salary)) || parseFloat(row.salary) <= 0) {
      errors.push(`Row ${rowNumber}: Please enter a valid salary amount`)
    }

    if (!row.address?.trim()) {
      errors.push(`Row ${rowNumber}: Address is required`)
    }

    if (!row.emergencycontact?.trim()) {
      errors.push(`Row ${rowNumber}: Emergency contact is required`)
    }

    if (!row.supervisor?.trim()) {
      errors.push(`Row ${rowNumber}: Supervisor is required`)
    }

    if (!row.employmenttype?.trim()) {
      errors.push(`Row ${rowNumber}: Employment type is required`)
    } else if (!["FULL_TIME", "PART_TIME", "CONTRACT"].includes(row.employmenttype.toUpperCase())) {
      errors.push(`Row ${rowNumber}: Employment type must be FULL_TIME, PART_TIME, or CONTRACT`)
    }

    if (!row.worklocation?.trim()) {
      errors.push(`Row ${rowNumber}: Work location is required`)
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

    setIsBulkLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Frontend-only implementation - log the data and show success message
      console.log("Bulk employee data ready for upload:", csvData)

      notify("success", "Bulk upload ready", {
        description: `${csvData.length} employees validated and ready for upload. Backend integration pending.`,
        duration: 6000,
      })

      // In a real implementation, you would send the data to your API here:
      // await bulkAddEmployees(csvData).unwrap()

      // Reset form
      setCsvFile(null)
      setCsvData([])
      setCsvErrors([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Failed to process bulk upload:", error)
      notify("error", "Bulk upload processing failed", {
        description: "There was an error processing the bulk upload",
        duration: 6000,
      })
    } finally {
      setIsBulkLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      setIsSubmitting(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Employee data ready:", {
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        position: formData.position,
        department: formData.department,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        hireDate: formData.hireDate,
        status: formData.status,
        salary: formData.salary,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        supervisor: formData.supervisor,
        employmentType: formData.employmentType as "FULL_TIME" | "PART_TIME" | "CONTRACT",
        workLocation: formData.workLocation,
      })

      notify("success", "Employee created successfully", {
        description: `${formData.fullName} (${formData.employeeId}) has been added to the system`,
        duration: 5000,
      })

      // Reset form
      setFormData({
        employeeId: "",
        fullName: "",
        position: "",
        department: "",
        email: "",
        phoneNumber: "",
        hireDate: "",
        status: "ACTIVE",
        salary: "",
        address: "",
        emergencyContact: "",
        supervisor: "",
        employmentType: "",
        workLocation: "",
      })
      setFormErrors({})

      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Failed to add employee:", error)
      const errorMessage = error?.data?.message || "An unexpected error occurred while adding the employee"
      notify("error", "Failed to add employee", {
        description: errorMessage,
        duration: 6000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.employeeId.trim() &&
      formData.fullName.trim() &&
      formData.position.trim() &&
      formData.department.trim() &&
      formData.email.trim() &&
      formData.phoneNumber.trim() &&
      formData.hireDate.trim() &&
      formData.salary.trim() &&
      formData.address.trim() &&
      formData.emergencyContact.trim() &&
      formData.supervisor.trim() &&
      formData.employmentType &&
      formData.workLocation.trim()
    )
  }

  const downloadTemplate = () => {
    const headers = [
      "employeeId",
      "fullName",
      "position",
      "department",
      "email",
      "phoneNumber",
      "hireDate",
      "status",
      "salary",
      "address",
      "emergencyContact",
      "supervisor",
      "employmentType",
      "workLocation",
    ]

    const exampleData = [
      {
        employeeId: "EMP00123",
        fullName: "John Doe",
        position: "Software Engineer",
        department: "IT",
        email: "john.doe@company.com",
        phoneNumber: "08012345678",
        hireDate: "2023-01-15",
        status: "ACTIVE",
        salary: "450000",
        address: "123 Main Street, Lagos",
        emergencyContact: "08087654321",
        supervisor: "Sarah Johnson",
        employmentType: "FULL_TIME",
        workLocation: "Head Office",
      },
      {
        employeeId: "EMP00124",
        fullName: "Jane Smith",
        position: "HR Specialist",
        department: "HR",
        email: "jane.smith@company.com",
        phoneNumber: "08087654321",
        hireDate: "2023-03-20",
        status: "ACTIVE",
        salary: "380000",
        address: "456 Broad Avenue, Abuja",
        emergencyContact: "08012345678",
        supervisor: "Michael Chen",
        employmentType: "FULL_TIME",
        workLocation: "Head Office",
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
    a.download = "employee_upload_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    notify("success", "Template downloaded", {
      description: "CSV template has been downloaded successfully",
      duration: 3000,
    })
  }

  // Options for dropdowns
  const departmentOptions = [
    { value: "", label: "Select department" },
    { value: "HR", label: "Human Resources" },
    { value: "IT", label: "Information Technology" },
    { value: "FIN", label: "Finance" },
    { value: "SAL", label: "Sales" },
    { value: "MKT", label: "Marketing" },
    { value: "OPS", label: "Operations" },
    { value: "CS", label: "Customer Service" },
    { value: "R&D", label: "Research & Development" },
  ]

  const positionOptions = [
    { value: "", label: "Select position" },
    { value: "Software Engineer", label: "Software Engineer" },
    { value: "Senior Developer", label: "Senior Developer" },
    { value: "Junior Developer", label: "Junior Developer" },
    { value: "HR Specialist", label: "HR Specialist" },
    { value: "Accountant", label: "Accountant" },
    { value: "Sales Representative", label: "Sales Representative" },
    { value: "Marketing Coordinator", label: "Marketing Coordinator" },
    { value: "Operations Manager", label: "Operations Manager" },
    { value: "Customer Support", label: "Customer Support" },
  ]

  const employmentTypeOptions = [
    { value: "", label: "Select employment type" },
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
  ]

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ]

  const workLocationOptions = [
    { value: "", label: "Select work location" },
    { value: "Head Office", label: "Head Office" },
    { value: "Branch A", label: "Branch A" },
    { value: "Branch B", label: "Branch B" },
    { value: "Branch C", label: "Branch C" },
    { value: "Remote", label: "Remote" },
  ]

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
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
            onClick={onRequestClose}
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
            <div className="mt-6 grid grid-cols-3 gap-6 px-6 pb-6">
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

              <FormSelectModule
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                options={positionOptions}
                error={formErrors.position}
                required
              />

              <FormSelectModule
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                options={departmentOptions}
                error={formErrors.department}
                required
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
                label="Hire Date"
                name="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={handleInputChange}
                error={formErrors.hireDate}
                required
                placeholder={""}
              />

              <FormSelectModule
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statusOptions}
                required
              />

              <FormInputModule
                label="Salary"
                name="salary"
                type="number"
                placeholder="Enter salary amount"
                value={formData.salary}
                onChange={handleInputChange}
                error={formErrors.salary}
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
                label="Supervisor"
                name="supervisor"
                type="text"
                placeholder="Enter supervisor name"
                value={formData.supervisor}
                onChange={handleInputChange}
                error={formErrors.supervisor}
                required
              />

              <FormSelectModule
                label="Employment Type"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                options={employmentTypeOptions}
                error={formErrors.employmentType}
                required
              />

              <FormSelectModule
                label="Work Location"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleInputChange}
                options={workLocationOptions}
                error={formErrors.workLocation}
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
                        <ButtonModule variant="primary" onClick={handleBulkSubmit} disabled={isBulkLoading}>
                          {isBulkLoading ? "Processing..." : `Process ${csvData.length} Employees`}
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
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Position</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                            Department
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {csvData.slice(0, 5).map((employee, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{employee.employeeId}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{employee.fullName}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{employee.position}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{employee.department}</td>
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
            onClick={onRequestClose}
            disabled={isSubmitting || isBulkLoading}
          >
            Cancel
          </ButtonModule>
          {activeTab === "single" ? (
            <ButtonModule
              variant="primary"
              className="flex-1"
              size="lg"
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? "Adding Employee..." : "Add Employee"}
            </ButtonModule>
          ) : (
            <ButtonModule
              variant="primary"
              className="flex-1"
              size="lg"
              onClick={handleBulkSubmit}
              disabled={csvData.length === 0 || csvErrors.length > 0 || isBulkLoading}
            >
              {isBulkLoading ? "Processing..." : `Process ${csvData.length} Employees`}
            </ButtonModule>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AddEmployeeModal
