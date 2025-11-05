"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { useAddCustomerMutation } from "lib/redux/customerSlice"
import { AddCustomerIcon, RefreshCircleIcon } from "components/Icons/Icons"

interface CustomerFormData {
  accountNumber: string
  customerName: string
  customerType: "" | "PREPAID" | "POSTPAID"
  serviceBand: string
  tariffClass: string
  region: string
  businessUnit: string
  address: string
  phoneNumber: string
  email: string
}

interface CSVCustomer {
  accountNumber: string
  customerName: string
  customerType: "PREPAID" | "POSTPAID"
  serviceBand: string
  tariffClass: string
  region: string
  businessUnit: string
  address: string
  phoneNumber: string
  email: string
}

const AddCustomerPage = () => {
  const [addCustomer, { isLoading }] = useAddCustomerMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVCustomer[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CustomerFormData>({
    accountNumber: "",
    customerName: "",
    customerType: "",
    serviceBand: "",
    tariffClass: "",
    region: "",
    businessUnit: "",
    address: "",
    phoneNumber: "",
    email: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Options for dropdowns
  const customerTypeOptions = [
    { value: "", label: "Select customer type" },
    { value: "PREPAID", label: "Prepaid" },
    { value: "POSTPAID", label: "Postpaid" },
  ]

  const serviceBandOptions = [
    { value: "", label: "Select service band" },
    { value: "A", label: "Band A" },
    { value: "B", label: "Band B" },
    { value: "C", label: "Band C" },
    { value: "D", label: "Band D" },
    { value: "E", label: "Band E" },
  ]

  const tariffClassOptions = [
    { value: "", label: "Select tariff class" },
    { value: "T1", label: "T1 - Residential" },
    { value: "T2", label: "T2 - Commercial" },
    { value: "T3", label: "T3 - Industrial" },
    { value: "T4", label: "T4 - Special Load" },
  ]

  const regionOptions = [
    { value: "", label: "Select region" },
    { value: "North", label: "North" },
    { value: "South", label: "South" },
    { value: "East", label: "East" },
    { value: "West", label: "West" },
    { value: "Central", label: "Central" },
  ]

  const businessUnitOptions = [
    { value: "", label: "Select business unit" },
    { value: "UnitA", label: "Unit A" },
    { value: "UnitB", label: "Unit B" },
    { value: "UnitC", label: "Unit C" },
    { value: "UnitD", label: "Unit D" },
  ]

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.accountNumber.trim()) {
      errors.accountNumber = "Account number is required"
    }

    if (!formData.customerName.trim()) {
      errors.customerName = "Customer name is required"
    }

    if (!formData.customerType) {
      errors.customerType = "Customer type is required"
    }

    if (!formData.serviceBand.trim()) {
      errors.serviceBand = "Service band is required"
    }

    if (!formData.tariffClass.trim()) {
      errors.tariffClass = "Tariff class is required"
    }

    if (!formData.region.trim()) {
      errors.region = "Region is required"
    }

    if (!formData.businessUnit.trim()) {
      errors.businessUnit = "Business unit is required"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
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

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSingleCustomer()
  }

  const submitSingleCustomer = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await addCustomer({
        accountNumber: formData.accountNumber,
        customerName: formData.customerName,
        customerType: formData.customerType as "PREPAID" | "POSTPAID",
        serviceBand: formData.serviceBand,
        tariffClass: formData.tariffClass,
        region: formData.region,
        businessUnit: formData.businessUnit,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        status: "ACTIVE",
      }).unwrap()

      console.log("Customer added successfully:", result)

      notify("success", "Customer created successfully", {
        description: `${formData.customerName} (${formData.accountNumber}) has been added to the system`,
        duration: 5000,
      })

      // Reset form
      setFormData({
        accountNumber: "",
        customerName: "",
        customerType: "",
        serviceBand: "",
        tariffClass: "",
        region: "",
        businessUnit: "",
        address: "",
        phoneNumber: "",
        email: "",
      })
      setFormErrors({})
    } catch (error: any) {
      console.error("Failed to add customer:", error)
      const errorMessage = error?.data?.message || "An unexpected error occurred while adding the customer"
      notify("error", "Failed to add customer", {
        description: errorMessage,
        duration: 6000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      accountNumber: "",
      customerName: "",
      customerType: "",
      serviceBand: "",
      tariffClass: "",
      region: "",
      businessUnit: "",
      address: "",
      phoneNumber: "",
      email: "",
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

        const headers = lines[0]!.split(",").map((header) => header.trim().toLowerCase())

        // Validate headers
        const expectedHeaders = [
          "accountnumber",
          "customername",
          "customertype",
          "serviceband",
          "tariffclass",
          "region",
          "businessunit",
          "address",
          "phonenumber",
          "email",
        ]

        const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header))
        if (missingHeaders.length > 0) {
          setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
          return
        }

        const parsedData: CSVCustomer[] = []
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
              accountNumber: row.accountnumber,
              customerName: row.customername,
              customerType: row.customertype.toUpperCase() as "PREPAID" | "POSTPAID",
              serviceBand: row.serviceband,
              tariffClass: row.tariffclass,
              region: row.region,
              businessUnit: row.businessunit,
              address: row.address,
              phoneNumber: row.phonenumber,
              email: row.email,
            })
          }
        }

        setCsvData(parsedData)
        setCsvErrors(errors)

        if (errors.length === 0) {
          notify("success", "CSV file parsed successfully", {
            description: `Found ${parsedData.length} valid customer records`,
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

    if (!row.accountnumber?.trim()) {
      errors.push(`Row ${rowNumber}: Account number is required`)
    }

    if (!row.customername?.trim()) {
      errors.push(`Row ${rowNumber}: Customer name is required`)
    }

    if (!row.customertype?.trim()) {
      errors.push(`Row ${rowNumber}: Customer type is required`)
    } else if (!["PREPAID", "POSTPAID"].includes(row.customertype.toUpperCase())) {
      errors.push(`Row ${rowNumber}: Customer type must be PREPAID or POSTPAID`)
    }

    if (!row.serviceband?.trim()) {
      errors.push(`Row ${rowNumber}: Service band is required`)
    }

    if (!row.tariffclass?.trim()) {
      errors.push(`Row ${rowNumber}: Tariff class is required`)
    }

    if (!row.region?.trim()) {
      errors.push(`Row ${rowNumber}: Region is required`)
    }

    if (!row.businessunit?.trim()) {
      errors.push(`Row ${rowNumber}: Business unit is required`)
    }

    if (!row.address?.trim()) {
      errors.push(`Row ${rowNumber}: Address is required`)
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
      console.log("Bulk customer data ready for upload:", csvData)

      notify("success", "Bulk upload ready", {
        description: `${csvData.length} customers validated and ready for upload. Backend integration pending.`,
        duration: 6000,
      })

      // In a real implementation, you would send the data to your API here:
      // await bulkAddCustomers(csvData).unwrap()

      // Reset form
      setCsvFile(null)
      setCsvData([])
      setCsvErrors([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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

  const downloadTemplate = () => {
    const headers = [
      "accountNumber",
      "customerName",
      "customerType",
      "serviceBand",
      "tariffClass",
      "region",
      "businessUnit",
      "address",
      "phoneNumber",
      "email",
    ]

    const exampleData = [
      {
        accountNumber: "ACC00123",
        customerName: "John Doe",
        customerType: "PREPAID",
        serviceBand: "A",
        tariffClass: "T1",
        region: "North",
        businessUnit: "UnitA",
        address: "123 Main Street, Lagos",
        phoneNumber: "08012345678",
        email: "john.doe@example.com",
      },
      {
        accountNumber: "ACC00124",
        customerName: "Jane Smith",
        customerType: "POSTPAID",
        serviceBand: "B",
        tariffClass: "T2",
        region: "South",
        businessUnit: "UnitB",
        address: "456 Broad Avenue, Abuja",
        phoneNumber: "08087654321",
        email: "jane.smith@example.com",
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
    a.download = "customer_upload_template.csv"
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
      formData.accountNumber.trim() !== "" &&
      formData.customerName.trim() !== "" &&
      formData.customerType !== "" &&
      formData.serviceBand.trim() !== "" &&
      formData.tariffClass.trim() !== "" &&
      formData.region.trim() !== "" &&
      formData.businessUnit.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.email.trim() !== ""
    )
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="container mx-auto flex flex-col">
            {/* Page Header */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Add New Customer</h4>
                <p className="text-gray-600">Create a new customer account in the system</p>
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
                  disabled={isSubmitting || isBulkLoading}
                >
                  {activeTab === "single" ? "Reset Form" : "Clear CSV"}
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={
                    activeTab === "single"
                      ? () => {
                          void submitSingleCustomer()
                        }
                      : () => {
                          void handleBulkSubmit()
                        }
                  }
                  disabled={
                    activeTab === "single"
                      ? !isFormValid() || isSubmitting
                      : csvData.length === 0 || csvErrors.length > 0 || isBulkLoading
                  }
                  icon={<AddCustomerIcon />}
                  iconPosition="start"
                >
                  {activeTab === "single"
                    ? isSubmitting
                      ? "Adding Customer..."
                      : "Add Customer"
                    : isBulkLoading
                    ? "Processing..."
                    : `Process ${csvData.length} Customers`}
                </ButtonModule>
              </motion.div>
            </div>

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
                      <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                      <p className="text-sm text-gray-600">
                        Fill in all required fields to create a new customer account
                      </p>
                    </div>

                    {/* Customer Form */}
                    <form onSubmit={handleSingleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Account Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Account Information</h4>

                          <FormInputModule
                            label="Account Number"
                            name="accountNumber"
                            type="text"
                            placeholder="Enter account number (e.g., ACC00123)"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            error={formErrors.accountNumber}
                            required
                          />

                          <FormInputModule
                            label="Customer Name"
                            name="customerName"
                            type="text"
                            placeholder="Enter customer full name"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            error={formErrors.customerName}
                            required
                          />

                          <FormSelectModule
                            label="Customer Type"
                            name="customerType"
                            value={formData.customerType}
                            onChange={handleInputChange}
                            options={customerTypeOptions}
                            error={formErrors.customerType}
                            required
                          />
                        </div>

                        {/* Service Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Service Information</h4>

                          <FormSelectModule
                            label="Service Band"
                            name="serviceBand"
                            value={formData.serviceBand}
                            onChange={handleInputChange}
                            options={serviceBandOptions}
                            error={formErrors.serviceBand}
                            required
                          />

                          <FormSelectModule
                            label="Tariff Class"
                            name="tariffClass"
                            value={formData.tariffClass}
                            onChange={handleInputChange}
                            options={tariffClassOptions}
                            error={formErrors.tariffClass}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Location Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Location Information</h4>

                          <FormSelectModule
                            label="Region"
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            options={regionOptions}
                            error={formErrors.region}
                            required
                          />

                          <FormSelectModule
                            label="Business Unit"
                            name="businessUnit"
                            value={formData.businessUnit}
                            onChange={handleInputChange}
                            options={businessUnitOptions}
                            error={formErrors.businessUnit}
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
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Contact Information</h4>

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

                      {/* Error Summary */}
                      {Object.keys(formErrors).length > 0 && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
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
                          {isSubmitting ? "Adding Customer..." : "Add Customer"}
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
                    {/* <div className="mb-6 rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                          <p className="text-sm text-blue-600">Download our CSV template to ensure proper formatting</p>
                        </div>
                        <ButtonModule variant="primary" size="sm" onClick={downloadTemplate}>
                          Download Template
                        </ButtonModule>
                      </div>
                    </div> */}

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
                              <ButtonModule variant="primary" onClick={handleBulkSubmit} disabled={isBulkLoading}>
                                {isBulkLoading ? "Processing..." : `Process ${csvData.length} Customers`}
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
                          <div className="flex-shrink-0">
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
                                  Account
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Type
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Email
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {csvData.slice(0, 5).map((customer, index) => (
                                <tr key={index}>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {customer.accountNumber}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {customer.customerName}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {customer.customerType}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {customer.email}
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

                {/* Help Section */}
                {/* <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-6 rounded-lg bg-blue-50 p-6"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="size-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        {activeTab === "single" ? "Need help with customer creation?" : "Need help with bulk upload?"}
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc space-y-1 pl-5">
                          {activeTab === "single" ? (
                            <>
                              <li>Ensure all required fields are filled before submitting</li>
                              <li>Account numbers must be unique across the system</li>
                              <li>Phone numbers must be valid Nigerian numbers</li>
                              <li>Email addresses must be in valid format</li>
                            </>
                          ) : (
                            <>
                              <li>Download the template to ensure proper CSV formatting</li>
                              <li>All columns in the template are required</li>
                              <li>Customer type must be either PREPAID or POSTPAID</li>
                              <li>Phone numbers must be valid Nigerian numbers</li>
                              <li>Maximum file size is 10MB</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddCustomerPage
