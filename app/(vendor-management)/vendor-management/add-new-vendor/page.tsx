"use client"
import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddAgentIcon, RefreshCircleIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { createBulkVendors, clearBulkCreate } from "lib/redux/vendorSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"

interface VendorFormData {
  blumenpayId: string
  name: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  canProcessPostpaid: boolean
  canProcessPrepaid: boolean
  commission: string
  employeeUserId: string
  documentUrls: string[]
}

interface CSVVendor {
  blumenpayId: string
  name: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  canProcessPostpaid: boolean
  canProcessPrepaid: boolean
  commission: string
  employeeUserId: string
  documentUrls: string[]
}

const AddNewVendor = () => {
  const dispatch = useAppDispatch()
  const { bulkCreateLoading, bulkCreateError, bulkCreateSuccess, createdVendors } = useAppSelector(
    (state) => state.vendors
  )
  const { employees, employeesLoading } = useAppSelector((state) => state.employee)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVVendor[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<VendorFormData>({
    blumenpayId: "",
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    canProcessPostpaid: false,
    canProcessPrepaid: false,
    commission: "",
    employeeUserId: "",
    documentUrls: [],
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Load employees for assignment dropdown
  useEffect(() => {
    if (!employees || employees.length === 0) {
      void dispatch(
        fetchEmployees({
          pageNumber: 1,
          pageSize: 1000,
        })
      )
    }
  }, [dispatch, employees])

  const employeeOptions = [
    { value: "", label: "Select employee" },
    ...employees.map((employee) => ({
      value: employee.id.toString(),
      label: `${employee.fullName} (${employee.email})`,
    })),
  ]

  // Options for dropdowns
  const stateOptions = [
    { value: "", label: "Select state" },
    { value: "Lagos", label: "Lagos" },
    { value: "Abuja", label: "Abuja" },
    { value: "Rivers", label: "Rivers" },
    { value: "Kano", label: "Kano" },
    { value: "Oyo", label: "Oyo" },
    { value: "Edo", label: "Edo" },
    { value: "Delta", label: "Delta" },
    { value: "Kaduna", label: "Kaduna" },
    { value: "Ogun", label: "Ogun" },
    { value: "Enugu", label: "Enugu" },
  ]

  const commissionOptions = [
    { value: "", label: "Select commission rate" },
    { value: "1.0", label: "1.0%" },
    { value: "1.5", label: "1.5%" },
    { value: "2.0", label: "2.0%" },
    { value: "2.5", label: "2.5%" },
    { value: "3.0", label: "3.0%" },
    { value: "3.5", label: "3.5%" },
    { value: "4.0", label: "4.0%" },
    { value: "4.5", label: "4.5%" },
    { value: "5.0", label: "5.0%" },
  ]

  const booleanOptions = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string | number | boolean } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    let normalizedValue: string | boolean = value as string
    if (name === "canProcessPostpaid" || name === "canProcessPrepaid") {
      normalizedValue = value === "true"
    }

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.blumenpayId.trim()) {
      errors.blumenpayId = "BlumenPay ID is required"
    }

    if (!formData.name.trim()) {
      errors.name = "Vendor name is required"
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required"
    } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Please enter a valid Nigerian phone number"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }

    if (!formData.city.trim()) {
      errors.city = "City is required"
    }

    if (!formData.state) {
      errors.state = "State is required"
    }

    if (!formData.commission) {
      errors.commission = "Commission rate is required"
    } else if (parseFloat(formData.commission) <= 0) {
      errors.commission = "Commission rate must be greater than 0"
    }

    if (!formData.employeeUserId.trim()) {
      errors.employeeUserId = "Employee User ID is required"
    } else if (isNaN(Number(formData.employeeUserId))) {
      errors.employeeUserId = "Employee User ID must be a number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSingleVendor()
  }

  const submitSingleVendor = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const vendorData = {
        vendors: [
          {
            blumenpayId: formData.blumenpayId,
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            canProcessPostpaid: formData.canProcessPostpaid,
            canProcessPrepaid: formData.canProcessPrepaid,
            commission: parseFloat(formData.commission),
            employeeUserId: parseInt(formData.employeeUserId),
            documentUrls: formData.documentUrls,
          },
        ],
      }

      const result = await dispatch(createBulkVendors(vendorData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Vendor created successfully", {
          description: `${formData.name} has been registered as a vendor`,
          duration: 5000,
        })

        // Reset form
        setFormData({
          blumenpayId: "",
          name: "",
          phoneNumber: "",
          email: "",
          address: "",
          city: "",
          state: "",
          canProcessPostpaid: false,
          canProcessPrepaid: false,
          commission: "",
          employeeUserId: "",
          documentUrls: [],
        })
        setFormErrors({})
      }
    } catch (error: any) {
      console.error("Failed to add vendor:", error)
      const errorMessage = error || "An unexpected error occurred while adding the vendor"
      notify("error", "Failed to add vendor", {
        description: errorMessage,
        duration: 6000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      blumenpayId: "",
      name: "",
      phoneNumber: "",
      email: "",
      address: "",
      city: "",
      state: "",
      canProcessPostpaid: false,
      canProcessPrepaid: false,
      commission: "",
      employeeUserId: "",
      documentUrls: [],
    })
    setFormErrors({})
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

        const headers = lines[0]!.split(",").map((header) => header.trim().toLowerCase().replace(/\s+/g, ""))

        // Validate headers
        const expectedHeaders = [
          "blumenpayid",
          "name",
          "phonenumber",
          "email",
          "address",
          "city",
          "state",
          "canprocesspostpaid",
          "canprocessprepaid",
          "commission",
          "employeeuserid",
          "documenturls",
        ]

        const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header))
        if (missingHeaders.length > 0) {
          setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
          return
        }

        const parsedData: CSVVendor[] = []
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
              blumenpayId: row.blumenpayid,
              name: row.name,
              phoneNumber: row.phonenumber,
              email: row.email,
              address: row.address,
              city: row.city,
              state: row.state,
              canProcessPostpaid: row.canprocesspostpaid.toLowerCase() === "true",
              canProcessPrepaid: row.canprocessprepaid.toLowerCase() === "true",
              commission: row.commission,
              employeeUserId: row.employeeuserid,
              documentUrls: row.documenturls ? row.documenturls.split(";").filter((url: string) => url.trim()) : [],
            })
          }
        }

        setCsvData(parsedData)
        setCsvErrors(errors)

        if (errors.length === 0) {
          notify("success", "CSV file parsed successfully", {
            description: `Found ${parsedData.length} valid vendor records`,
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

    if (!row.blumenpayid?.trim()) {
      errors.push(`Row ${rowNumber}: BlumenPay ID is required`)
    }

    if (!row.name?.trim()) {
      errors.push(`Row ${rowNumber}: Vendor name is required`)
    }

    if (!row.phonenumber?.trim()) {
      errors.push(`Row ${rowNumber}: Phone number is required`)
    } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(row.phonenumber.replace(/\s/g, ""))) {
      errors.push(`Row ${rowNumber}: Please enter a valid Nigerian phone number`)
    }

    if (!row.email?.trim()) {
      errors.push(`Row ${rowNumber}: Email is required`)
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push(`Row ${rowNumber}: Please enter a valid email address`)
    }

    if (!row.address?.trim()) {
      errors.push(`Row ${rowNumber}: Address is required`)
    }

    if (!row.city?.trim()) {
      errors.push(`Row ${rowNumber}: City is required`)
    }

    if (!row.state?.trim()) {
      errors.push(`Row ${rowNumber}: State is required`)
    }

    if (!row.canprocesspostpaid?.trim()) {
      errors.push(`Row ${rowNumber}: Can Process Postpaid is required (true/false)`)
    } else if (!["true", "false"].includes(row.canprocesspostpaid.toLowerCase())) {
      errors.push(`Row ${rowNumber}: Can Process Postpaid must be true or false`)
    }

    if (!row.canprocessprepaid?.trim()) {
      errors.push(`Row ${rowNumber}: Can Process Prepaid is required (true/false)`)
    } else if (!["true", "false"].includes(row.canprocessprepaid.toLowerCase())) {
      errors.push(`Row ${rowNumber}: Can Process Prepaid must be true or false`)
    }

    if (!row.commission?.trim()) {
      errors.push(`Row ${rowNumber}: Commission rate is required`)
    } else if (parseFloat(row.commission) <= 0) {
      errors.push(`Row ${rowNumber}: Commission rate must be greater than 0`)
    }

    if (!row.employeeuserid?.trim()) {
      errors.push(`Row ${rowNumber}: Employee User ID is required`)
    } else if (isNaN(Number(row.employeeuserid))) {
      errors.push(`Row ${rowNumber}: Employee User ID must be a number`)
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
      const bulkVendorData = {
        vendors: csvData.map((vendor) => ({
          ...vendor,
          commission: parseFloat(vendor.commission),
          employeeUserId: parseInt(vendor.employeeUserId),
        })),
      }

      const result = await dispatch(createBulkVendors(bulkVendorData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Bulk upload completed successfully", {
          description: `${csvData.length} vendors have been registered successfully`,
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
      notify("error", "Bulk upload processing failed", {
        description: error || "There was an error processing the bulk upload",
        duration: 6000,
      })
    }
  }

  const downloadTemplate = () => {
    const headers = [
      "blumenpayId",
      "name",
      "phoneNumber",
      "email",
      "address",
      "city",
      "state",
      "canProcessPostpaid",
      "canProcessPrepaid",
      "commission",
      "employeeUserId",
      "documentUrls",
    ]

    const exampleData = [
      {
        blumenpayId: "BLU001",
        name: "Buy Power Limited",
        phoneNumber: "08012345678",
        email: "info@buypower.com",
        address: "123 Lagos Island",
        city: "Lagos",
        state: "Lagos",
        canProcessPostpaid: "true",
        canProcessPrepaid: "true",
        commission: "2.5",
        employeeUserId: "123",
        documentUrls: "https://example.com/doc1.pdf;https://example.com/doc2.pdf",
      },
      {
        blumenpayId: "BLU002",
        name: "Energy Solutions Ltd",
        phoneNumber: "08087654321",
        email: "contact@energysolutions.com",
        address: "456 Ikeja",
        city: "Lagos",
        state: "Lagos",
        canProcessPostpaid: "false",
        canProcessPrepaid: "true",
        commission: "3.0",
        employeeUserId: "124",
        documentUrls: "",
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
    a.download = "vendor_bulk_upload_template.csv"
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
      formData.blumenpayId.trim() !== "" &&
      formData.name.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state !== "" &&
      formData.commission !== "" &&
      formData.employeeUserId.trim() !== ""
    )
  }

  // Handle document URLs input
  const handleDocumentUrlsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urls = e.target.value
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url)
    setFormData((prev) => ({
      ...prev,
      documentUrls: urls,
    }))
  }

  return (
    <section className="size-full">
      <DashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          {/* Page Header */}
          <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
            <div>
              <h4 className="text-2xl font-semibold">Register New Vendor</h4>
              <p className="text-gray-600">Add a new vendor to the system</p>
            </div>

            <motion.div
              className="flex items-center justify-end gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ButtonModule
                variant="outline"
                size="md"
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
                disabled={isSubmitting || bulkCreateLoading}
              >
                {activeTab === "single" ? "Reset Form" : "Clear CSV"}
              </ButtonModule>
              <ButtonModule
                variant="primary"
                size="md"
                onClick={
                  activeTab === "single"
                    ? () => {
                        void submitSingleVendor()
                      }
                    : () => {
                        void handleBulkSubmit()
                      }
                }
                disabled={
                  activeTab === "single"
                    ? !isFormValid() || isSubmitting
                    : csvData.length === 0 || csvErrors.length > 0 || bulkCreateLoading
                }
                icon={<AddAgentIcon />}
                iconPosition="start"
              >
                {activeTab === "single"
                  ? isSubmitting
                    ? "Adding Vendor..."
                    : "Add Vendor"
                  : bulkCreateLoading
                  ? "Processing..."
                  : `Process ${csvData.length} Vendors`}
              </ButtonModule>
            </motion.div>
          </div>
          <div className="container mx-auto flex w-full flex-col">
            {/* Tab Navigation */}
            <div className="px-16 max-md:px-0 max-sm:px-3">
              <div className="rounded-t-lg border-b border-gray-200 bg-white">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("single")}
                    className={`flex-1 rounded-tl-lg px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "single"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Single Entry
                  </button>
                  <button
                    onClick={() => setActiveTab("bulk")}
                    className={`flex-1 rounded-tr-lg px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "bulk"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Bulk Upload (CSV)
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {activeTab === "single" ? (
                  /* Single Entry Form */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-b-lg rounded-tr-lg bg-white p-6 shadow-sm"
                  >
                    {/* Form Header */}
                    <div className="mb-6 border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Vendor Information</h3>
                      <p className="text-sm text-gray-600">Fill in all required fields to register a new vendor</p>
                    </div>

                    {/* Vendor Form */}
                    <form onSubmit={handleSingleSubmit} className="space-y-6">
                      <div className="rounded-lg bg-[#F9F9F9] p-6">
                        <h4 className="font-medium text-gray-900">Basic Information</h4>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          {/* Basic Information */}

                          <FormInputModule
                            label="BlumenPay ID"
                            name="blumenpayId"
                            type="text"
                            placeholder="Enter BlumenPay ID"
                            value={formData.blumenpayId}
                            onChange={handleInputChange}
                            error={formErrors.blumenpayId}
                            required
                          />

                          <FormInputModule
                            label="Vendor Name"
                            name="name"
                            type="text"
                            placeholder="Enter vendor name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={formErrors.name}
                            required
                          />

                          <FormInputModule
                            label="Phone Number"
                            name="phoneNumber"
                            type="tel"
                            placeholder="Enter phone number (e.g., 08012345678)"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            error={formErrors.phoneNumber}
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
                        </div>
                      </div>
                      {/* Commission & Employee */}
                      <div className="grid grid-cols-1 gap-6 rounded-lg bg-[#F9F9F9] p-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Commission & Assignment</h4>

                          <FormSelectModule
                            label="Commission Rate (%)"
                            name="commission"
                            value={formData.commission}
                            onChange={handleInputChange}
                            options={commissionOptions}
                            error={formErrors.commission}
                            required
                          />

                          <FormSelectModule
                            label="Employee User ID"
                            name="employeeUserId"
                            value={formData.employeeUserId}
                            onChange={handleInputChange}
                            options={employeeOptions}
                            error={formErrors.employeeUserId}
                            required
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Documents</h4>
                          <FormInputModule
                            label="Document URLs (comma-separated)"
                            name="documentUrls"
                            type="text"
                            placeholder="https://example.com/doc1.pdf, https://example.com/doc2.pdf"
                            value={formData.documentUrls.join(", ")}
                            onChange={handleDocumentUrlsChange}
                          />
                        </div>
                      </div>

                      {/* Location & Services */}
                      <div className="rounded-lg bg-[#F9F9F9] p-6">
                        <h4 className="font-medium text-gray-900">Location & Services</h4>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                            label="City"
                            name="city"
                            type="text"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={handleInputChange}
                            error={formErrors.city}
                            required
                          />

                          <FormSelectModule
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            options={stateOptions}
                            error={formErrors.state}
                            required
                          />

                          <FormSelectModule
                            label="Can Process Postpaid"
                            name="canProcessPostpaid"
                            value={formData.canProcessPostpaid.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                            required
                          />

                          <FormSelectModule
                            label="Can Process Prepaid"
                            name="canProcessPrepaid"
                            value={formData.canProcessPrepaid.toString()}
                            onChange={handleInputChange}
                            options={booleanOptions}
                            required
                          />
                        </div>
                      </div>

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

                      {/* Form Actions */}
                      <div className="flex justify-end gap-4 border-t pt-6">
                        <ButtonModule
                          variant="dangerSecondary"
                          size="lg"
                          onClick={handleReset}
                          disabled={isSubmitting}
                          type="button"
                        >
                          Reset
                        </ButtonModule>
                        <ButtonModule
                          variant="primary"
                          size="lg"
                          type="submit"
                          disabled={!isFormValid() || isSubmitting}
                        >
                          {isSubmitting ? "Adding Vendor..." : "Add Vendor"}
                        </ButtonModule>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  /* Bulk Upload Section */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-b-lg rounded-tl-lg bg-white p-6 shadow-sm"
                  >
                    {/* Template Download */}
                    <div className="mb-6 rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
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
                    <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-8 text-center">
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
                              <ButtonModule variant="primary" onClick={handleBulkSubmit} disabled={bulkCreateLoading}>
                                {bulkCreateLoading ? "Processing..." : `Process ${csvData.length} Vendors`}
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
                          <h3 className="text-sm font-medium text-gray-900">
                            Preview ({csvData.length} valid records)
                          </h3>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  BlumenPay ID
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Phone
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Commission
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {csvData.slice(0, 5).map((vendor, index) => (
                                <tr key={index}>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {vendor.blumenpayId}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{vendor.name}</td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {vendor.phoneNumber}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {vendor.commission}%
                                  </td>
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
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddNewVendor
