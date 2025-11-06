"use client"
import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddAgentIcon, RefreshCircleIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"

interface VendorFormData {
  companyName: string
  contactPerson: string
  phoneNumber: string
  email: string
  businessType: string
  taxId: string
  location: string
  commissionRate: string
  initialStock: string
  deviceId: string
  address: string
}

interface CSVVendor {
  companyName: string
  contactPerson: string
  phoneNumber: string
  email: string
  businessType: string
  taxId: string
  location: string
  commissionRate: string
  initialStock: string
  deviceId: string
  address: string
}

const AddNewVendor = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVVendor[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<VendorFormData>({
    companyName: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    businessType: "",
    taxId: "",
    location: "",
    commissionRate: "",
    initialStock: "",
    deviceId: "",
    address: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Options for dropdowns
  const businessTypeOptions = [
    { value: "", label: "Select business type" },
    { value: "energy-retailer", label: "Energy Retailer" },
    { value: "tech-solutions", label: "Tech Solutions" },
    { value: "vending-services", label: "Vending Services" },
    { value: "energy-distribution", label: "Energy Distribution" },
    { value: "smart-meter-solutions", label: "Smart Meter Solutions" },
    { value: "technology-retail", label: "Technology Retail" },
    { value: "supermarket", label: "Supermarket" },
    { value: "convenience-store", label: "Convenience Store" },
    { value: "shopping-mall", label: "Shopping Mall" },
  ]

  const locationOptions = [
    { value: "", label: "Select location" },
    { value: "lagos-island", label: "Lagos Island" },
    { value: "ikeja", label: "Ikeja" },
    { value: "surulere", label: "Surulere" },
    { value: "victoria-island", label: "Victoria Island" },
    { value: "lekki", label: "Lekki" },
    { value: "ajah", label: "Ajah" },
    { value: "yaba", label: "Yaba" },
    { value: "ilupeju", label: "Ilupeju" },
    { value: "maryland", label: "Maryland" },
  ]

  const commissionRateOptions = [
    { value: "", label: "Select commission rate" },
    { value: "1.5", label: "1.5%" },
    { value: "2.0", label: "2.0%" },
    { value: "2.5", label: "2.5%" },
    { value: "3.0", label: "3.0%" },
    { value: "3.5", label: "3.5%" },
    { value: "4.0", label: "4.0%" },
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

    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required"
    }

    if (!formData.contactPerson.trim()) {
      errors.contactPerson = "Contact person is required"
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

    if (!formData.businessType) {
      errors.businessType = "Business type is required"
    }

    if (!formData.taxId.trim()) {
      errors.taxId = "Tax ID is required"
    } else if (formData.taxId.length < 8) {
      errors.taxId = "Tax ID must be at least 8 characters"
    }

    if (!formData.location) {
      errors.location = "Location is required"
    }

    if (!formData.commissionRate) {
      errors.commissionRate = "Commission rate is required"
    } else if (parseFloat(formData.commissionRate) <= 0) {
      errors.commissionRate = "Commission rate must be greater than 0"
    }

    if (!formData.initialStock.trim()) {
      errors.initialStock = "Initial stock is required"
    } else if (parseFloat(formData.initialStock.replace(/[₦,]/g, "")) <= 0) {
      errors.initialStock = "Initial stock must be greater than 0"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Vendor data ready for submission:", {
        ...formData,
        initialStock: parseFloat(formData.initialStock.replace(/[₦,]/g, "")),
        commissionRate: parseFloat(formData.commissionRate),
      })

      notify("success", "Vendor created successfully", {
        description: `${formData.companyName} has been registered as a vendor`,
        duration: 5000,
      })

      // Reset form
      setFormData({
        companyName: "",
        contactPerson: "",
        phoneNumber: "",
        email: "",
        businessType: "",
        taxId: "",
        location: "",
        commissionRate: "",
        initialStock: "",
        deviceId: "",
        address: "",
      })
      setFormErrors({})
    } catch (error: any) {
      console.error("Failed to add vendor:", error)
      const errorMessage = error?.data?.message || "An unexpected error occurred while adding the vendor"
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
      companyName: "",
      contactPerson: "",
      phoneNumber: "",
      email: "",
      businessType: "",
      taxId: "",
      location: "",
      commissionRate: "",
      initialStock: "",
      deviceId: "",
      address: "",
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
          "companyname",
          "contactperson",
          "phonenumber",
          "email",
          "businesstype",
          "taxid",
          "location",
          "commissionrate",
          "initialstock",
          "deviceid",
          "address",
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
              companyName: row.companyname,
              contactPerson: row.contactperson,
              phoneNumber: row.phonenumber,
              email: row.email,
              businessType: row.businesstype,
              taxId: row.taxid,
              location: row.location,
              commissionRate: row.commissionrate,
              initialStock: row.initialstock,
              deviceId: row.deviceid || "",
              address: row.address,
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

    if (!row.companyname?.trim()) {
      errors.push(`Row ${rowNumber}: Company name is required`)
    }

    if (!row.contactperson?.trim()) {
      errors.push(`Row ${rowNumber}: Contact person is required`)
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

    if (!row.businesstype?.trim()) {
      errors.push(`Row ${rowNumber}: Business type is required`)
    }

    if (!row.taxid?.trim()) {
      errors.push(`Row ${rowNumber}: Tax ID is required`)
    } else if (row.taxid.length < 8) {
      errors.push(`Row ${rowNumber}: Tax ID must be at least 8 characters`)
    }

    if (!row.location?.trim()) {
      errors.push(`Row ${rowNumber}: Location is required`)
    }

    if (!row.commissionrate?.trim()) {
      errors.push(`Row ${rowNumber}: Commission rate is required`)
    } else if (parseFloat(row.commissionrate) <= 0) {
      errors.push(`Row ${rowNumber}: Commission rate must be greater than 0`)
    }

    if (!row.initialstock?.trim()) {
      errors.push(`Row ${rowNumber}: Initial stock is required`)
    } else if (parseFloat(row.initialstock.replace(/[₦,]/g, "")) <= 0) {
      errors.push(`Row ${rowNumber}: Initial stock must be greater than 0`)
    }

    if (!row.address?.trim()) {
      errors.push(`Row ${rowNumber}: Address is required`)
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

      console.log("Bulk vendor data ready for upload:", csvData)

      notify("success", "Bulk upload ready", {
        description: `${csvData.length} vendors validated and ready for upload. Backend integration pending.`,
        duration: 6000,
      })

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
      "companyName",
      "contactPerson",
      "phoneNumber",
      "email",
      "businessType",
      "taxId",
      "location",
      "commissionRate",
      "initialStock",
      "deviceId",
      "address",
    ]

    const exampleData = [
      {
        companyName: "Buy Power",
        contactPerson: "Mr. Johnson Ade",
        phoneNumber: "08012345678",
        email: "johnson@buypower.com",
        businessType: "energy-retailer",
        taxId: "TAX12345678",
        location: "lagos-island",
        commissionRate: "2.5",
        initialStock: "500000",
        deviceId: "POS001",
        address: "123 Lagos Island, Lagos",
      },
      {
        companyName: "Blumentech",
        contactPerson: "Ms. Sarah Blume",
        phoneNumber: "08087654321",
        email: "sarah@blumentech.com",
        businessType: "tech-solutions",
        taxId: "TAX87654321",
        location: "ikeja",
        commissionRate: "3.0",
        initialStock: "750000",
        deviceId: "POS002",
        address: "456 Ikeja, Lagos",
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
    a.download = "vendor_upload_template.csv"
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
      formData.companyName.trim() !== "" &&
      formData.contactPerson.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.businessType !== "" &&
      formData.taxId.trim() !== "" &&
      formData.location !== "" &&
      formData.commissionRate !== "" &&
      formData.initialStock.trim() !== "" &&
      formData.address.trim() !== ""
    )
  }

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[₦,]/g, "")
    if (!numericValue) return ""

    // Format as currency
    const number = parseFloat(numericValue)
    if (isNaN(number)) return value

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(number)
      .replace("NGN", "₦")
  }

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const formattedValue = formatCurrency(value)
    handleInputChange({
      target: { name, value: formattedValue },
    })
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
                        void submitSingleVendor()
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
                icon={<AddAgentIcon />}
                iconPosition="start"
              >
                {activeTab === "single"
                  ? isSubmitting
                    ? "Adding Vendor..."
                    : "Add Vendor"
                  : isBulkLoading
                  ? "Processing..."
                  : `Process ${csvData.length} Vendors`}
              </ButtonModule>
            </motion.div>
          </div>
          <div className="container mx-auto flex max-w-4xl flex-col">
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
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Company Information */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Company Information</h4>

                          <FormInputModule
                            label="Company Name"
                            name="companyName"
                            type="text"
                            placeholder="Enter company name"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            error={formErrors.companyName}
                            required
                          />

                          <FormInputModule
                            label="Contact Person"
                            name="contactPerson"
                            type="text"
                            placeholder="Enter contact person name"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            error={formErrors.contactPerson}
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

                          <FormSelectModule
                            label="Business Type"
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleInputChange}
                            options={businessTypeOptions}
                            error={formErrors.businessType}
                            required
                          />
                        </div>

                        {/* Vendor Details */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Vendor Details</h4>

                          <FormInputModule
                            label="Tax ID"
                            name="taxId"
                            type="text"
                            placeholder="Enter tax identification number"
                            value={formData.taxId}
                            onChange={handleInputChange}
                            error={formErrors.taxId}
                            required
                          />

                          <FormSelectModule
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            options={locationOptions}
                            error={formErrors.location}
                            required
                          />

                          <FormSelectModule
                            label="Commission Rate (%)"
                            name="commissionRate"
                            value={formData.commissionRate}
                            onChange={handleInputChange}
                            options={commissionRateOptions}
                            error={formErrors.commissionRate}
                            required
                          />

                          <FormInputModule
                            label="Initial Stock (₦)"
                            name="initialStock"
                            type="text"
                            placeholder="Opening stock amount"
                            value={formData.initialStock}
                            onChange={handleCurrencyInput}
                            error={formErrors.initialStock}
                            required
                          />

                          <FormInputModule
                            label="Device ID (Optional)"
                            name="deviceId"
                            type="text"
                            placeholder="POS terminal ID"
                            value={formData.deviceId}
                            onChange={handleInputChange}
                            error={formErrors.deviceId}
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Business Address</h4>
                        <FormInputModule
                          label="Address"
                          name="address"
                          type="text"
                          placeholder="Enter complete business address"
                          value={formData.address}
                          onChange={handleInputChange}
                          error={formErrors.address}
                          required
                        />
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
                              <ButtonModule variant="primary" onClick={handleBulkSubmit} disabled={isBulkLoading}>
                                {isBulkLoading ? "Processing..." : `Process ${csvData.length} Vendors`}
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
                                  Company
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Contact
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Business Type
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
                                    {vendor.companyName}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {vendor.contactPerson}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {vendor.businessType}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {vendor.commissionRate}%
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
