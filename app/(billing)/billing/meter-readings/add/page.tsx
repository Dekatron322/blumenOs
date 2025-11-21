"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddIcon } from "components/Icons/Icons"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearCreateMeterReading, createMeterReading, CreateMeterReadingRequest } from "lib/redux/meterReadingSlice"
import { fetchCustomers } from "lib/redux/customerSlice"

interface MeterReadingFormData {
  customerId: number
  period: string
  previousReadingKwh: number
  presentReadingKwh: number
  notes: string
}

interface CSVMeterReading {
  customerId: number
  period: string
  previousReadingKwh: number
  presentReadingKwh: number
  notes: string
}

const AddMeterReadingPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { createMeterReadingLoading, createMeterReadingError, createMeterReadingSuccess, createdMeterReading } =
    useSelector((state: RootState) => state.meterReadings)

  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useSelector((state: RootState) => state.customers)

  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVMeterReading[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<MeterReadingFormData>({
    customerId: 0,
    period: "",
    previousReadingKwh: 0,
    presentReadingKwh: 0,
    notes: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch customers on component mount
  useEffect(() => {
    dispatch(
      fetchCustomers({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  // Generate customer options from API response
  const customerOptions = [
    { value: 0, label: "Select customer" },
    ...customers.map((customer) => ({
      value: customer.id,
      label: `${customer.accountNumber} - ${customer.fullName}`,
    })),
  ]

  // Generate period options (last 12 months)
  const generatePeriodOptions = () => {
    const options = []
    const currentDate = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const period = `${year}-${month}`
      const label = date.toLocaleString("default", { month: "long", year: "numeric" })

      options.push({ value: period, label })
    }

    return options
  }

  const periodOptions = [{ value: "", label: "Select billing period" }, ...generatePeriodOptions()]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (["customerId", "previousReadingKwh", "presentReadingKwh"].includes(name)) {
      processedValue = Number(value)
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (formData.customerId === 0) {
      errors.customerId = "Customer is required"
    }

    if (!formData.period.trim()) {
      errors.period = "Billing period is required"
    }

    if (formData.previousReadingKwh < 0) {
      errors.previousReadingKwh = "Previous reading cannot be negative"
    }

    if (formData.presentReadingKwh < 0) {
      errors.presentReadingKwh = "Present reading cannot be negative"
    }

    if (formData.presentReadingKwh < formData.previousReadingKwh) {
      errors.presentReadingKwh = "Present reading cannot be less than previous reading"
    }

    if (!formData.notes.trim()) {
      errors.notes = "Notes are required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSingleMeterReading()
  }

  const submitSingleMeterReading = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const meterReadingData: CreateMeterReadingRequest = {
        customerId: formData.customerId,
        period: formData.period,
        previousReadingKwh: formData.previousReadingKwh,
        presentReadingKwh: formData.presentReadingKwh,
        notes: formData.notes,
      }

      const result = await dispatch(createMeterReading(meterReadingData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Meter reading created successfully", {
          description: `Meter reading for period ${formData.period} has been recorded`,
          duration: 5000,
        })

        // Reset form
        setFormData({
          customerId: 0,
          period: "",
          previousReadingKwh: 0,
          presentReadingKwh: 0,
          notes: "",
        })
        setFormErrors({})
      }
    } catch (error: any) {
      console.error("Failed to create meter reading:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Failed to create meter reading", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  const handleReset = () => {
    setFormData({
      customerId: 0,
      period: "",
      previousReadingKwh: 0,
      presentReadingKwh: 0,
      notes: "",
    })
    setFormErrors({})
    dispatch(clearCreateMeterReading())
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
        const expectedHeaders = ["customerid", "period", "previousreadingkwh", "presentreadingkwh", "notes"]

        const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header))
        if (missingHeaders.length > 0) {
          setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
          return
        }

        const parsedData: CSVMeterReading[] = []
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
              customerId: parseInt(row.customerid),
              period: row.period,
              previousReadingKwh: parseFloat(row.previousreadingkwh),
              presentReadingKwh: parseFloat(row.presentreadingkwh),
              notes: row.notes,
            })
          }
        }

        setCsvData(parsedData)
        setCsvErrors(errors)

        if (errors.length === 0) {
          notify("success", "CSV file parsed successfully", {
            description: `Found ${parsedData.length} valid meter reading records`,
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

    if (!row.customerid?.trim()) {
      errors.push(`Row ${rowNumber}: Customer ID is required`)
    } else if (isNaN(parseInt(row.customerid))) {
      errors.push(`Row ${rowNumber}: Customer ID must be a valid number`)
    }

    if (!row.period?.trim()) {
      errors.push(`Row ${rowNumber}: Period is required`)
    } else if (!/^\d{4}-\d{2}$/.test(row.period)) {
      errors.push(`Row ${rowNumber}: Period must be in YYYY-MM format`)
    }

    if (!row.previousreadingkwh?.trim()) {
      errors.push(`Row ${rowNumber}: Previous reading is required`)
    } else if (isNaN(parseFloat(row.previousreadingkwh))) {
      errors.push(`Row ${rowNumber}: Previous reading must be a valid number`)
    } else if (parseFloat(row.previousreadingkwh) < 0) {
      errors.push(`Row ${rowNumber}: Previous reading cannot be negative`)
    }

    if (!row.presentreadingkwh?.trim()) {
      errors.push(`Row ${rowNumber}: Present reading is required`)
    } else if (isNaN(parseFloat(row.presentreadingkwh))) {
      errors.push(`Row ${rowNumber}: Present reading must be a valid number`)
    } else if (parseFloat(row.presentreadingkwh) < 0) {
      errors.push(`Row ${rowNumber}: Present reading cannot be negative`)
    }

    if (row.previousreadingkwh?.trim() && row.presentreadingkwh?.trim()) {
      const prev = parseFloat(row.previousreadingkwh)
      const present = parseFloat(row.presentreadingkwh)
      if (present < prev) {
        errors.push(`Row ${rowNumber}: Present reading cannot be less than previous reading`)
      }
    }

    if (!row.notes?.trim()) {
      errors.push(`Row ${rowNumber}: Notes are required`)
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
      // Process each meter reading individually
      let successCount = 0
      let errorCount = 0

      for (const readingData of csvData) {
        try {
          const result = await dispatch(createMeterReading(readingData)).unwrap()
          if (result.isSuccess) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }

      if (errorCount === 0) {
        notify("success", "All meter readings created successfully", {
          description: `${successCount} meter readings have been recorded`,
          duration: 6000,
        })
      } else {
        notify("warning", "Meter readings processed with some errors", {
          description: `${successCount} successful, ${errorCount} failed`,
          duration: 6000,
        })
      }

      // Reset form
      setCsvFile(null)
      setCsvData([])
      setCsvErrors([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
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
    const headers = ["customerId", "period", "previousReadingKwh", "presentReadingKwh", "notes"]

    // Use actual customer IDs from the API for the template
    const exampleCustomerId = customers[0]?.id?.toString() ?? "1"

    const exampleData = [
      {
        customerId: exampleCustomerId,
        period: "2024-01",
        previousReadingKwh: "1500.5",
        presentReadingKwh: "1650.75",
        notes: "Regular monthly reading",
      },
      {
        customerId: exampleCustomerId,
        period: "2024-01",
        previousReadingKwh: "2200.0",
        presentReadingKwh: "2450.25",
        notes: "Customer reported high usage due to AC",
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
    a.download = "meter_reading_template.csv"
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
      formData.customerId !== 0 &&
      formData.period.trim() !== "" &&
      formData.previousReadingKwh >= 0 &&
      formData.presentReadingKwh >= 0 &&
      formData.presentReadingKwh >= formData.previousReadingKwh &&
      formData.notes.trim() !== ""
    )
  }

  // Clear success/error states when switching tabs
  React.useEffect(() => {
    if (createMeterReadingSuccess || createMeterReadingError) {
      dispatch(clearCreateMeterReading())
    }
  }, [activeTab, dispatch])

  // Show error notification if customers fail to load
  useEffect(() => {
    if (customersError) {
      notify("error", "Failed to load customers", {
        description: customersError,
        duration: 5000,
      })
    }
  }, [customersError])

  // Calculate consumption for display
  const consumption = formData.presentReadingKwh - formData.previousReadingKwh

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="container mx-auto flex flex-col">
            {/* Page Header */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Add Meter Reading</h4>
                <p className="text-gray-600">Record new meter readings for customers</p>
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
                  disabled={createMeterReadingLoading}
                >
                  {activeTab === "single" ? "Reset Form" : "Clear CSV"}
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={
                    activeTab === "single"
                      ? () => {
                          void submitSingleMeterReading()
                        }
                      : () => {
                          void handleBulkSubmit()
                        }
                  }
                  disabled={
                    activeTab === "single"
                      ? !isFormValid() || createMeterReadingLoading
                      : csvData.length === 0 || csvErrors.length > 0 || createMeterReadingLoading
                  }
                  icon={<AddIcon />}
                  iconPosition="start"
                >
                  {activeTab === "single"
                    ? createMeterReadingLoading
                      ? "Creating Reading..."
                      : "Create Reading"
                    : createMeterReadingLoading
                    ? "Processing..."
                    : `Create ${csvData.length} Readings`}
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
                    Single Reading
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
                    className="rounded-b-lg  bg-white p-6 shadow-sm"
                  >
                    {/* Form Header */}
                    <div className="mb-6 border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Meter Reading Information</h3>
                      <p className="text-sm text-gray-600">Fill in all required fields to record a new meter reading</p>
                    </div>

                    {/* Meter Reading Form */}
                    <form onSubmit={handleSingleSubmit} className="space-y-8">
                      {/* Section 1: Customer & Period Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Customer & Period</h4>
                          <p className="text-sm text-gray-600">Select the customer and billing period</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormSelectModule
                            label="Customer"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleInputChange}
                            options={[
                              { value: "", label: customersLoading ? "Loading customers..." : "Select customer" },
                              ...customerOptions.filter((option) => option.value !== 0),
                            ]}
                            error={formErrors.customerId}
                            required
                            disabled={customersLoading}
                          />

                          <FormSelectModule
                            label="Billing Period"
                            name="period"
                            value={formData.period}
                            onChange={handleInputChange}
                            options={periodOptions}
                            error={formErrors.period}
                            required
                          />
                        </div>
                      </div>

                      {/* Section 2: Reading Details */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Reading Details</h4>
                          <p className="text-sm text-gray-600">Enter the meter reading values</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          <FormInputModule
                            label="Previous Reading (kWh)"
                            name="previousReadingKwh"
                            type="number"
                            placeholder="0.00"
                            value={formData.previousReadingKwh}
                            onChange={handleInputChange}
                            error={formErrors.previousReadingKwh}
                            required
                            step="0.01"
                            min="0"
                          />

                          <FormInputModule
                            label="Present Reading (kWh)"
                            name="presentReadingKwh"
                            type="number"
                            placeholder="0.00"
                            value={formData.presentReadingKwh}
                            onChange={handleInputChange}
                            error={formErrors.presentReadingKwh}
                            required
                            step="0.01"
                            min="0"
                          />

                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <label className="text-sm font-medium text-gray-600">Consumption (kWh)</label>
                            <p className="text-2xl font-bold text-green-600">{consumption.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Calculated automatically</p>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Additional Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                          <p className="text-sm text-gray-600">Provide any additional notes or comments</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <FormInputModule
                            label="Notes"
                            name="notes"
                            type="text"
                            placeholder="Enter any notes about this reading (e.g., meter condition, estimated reading, etc.)"
                            value={formData.notes}
                            onChange={handleInputChange}
                            error={formErrors.notes}
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
                          disabled={createMeterReadingLoading}
                          type="button"
                        >
                          Reset
                        </ButtonModule>
                        <ButtonModule
                          variant="primary"
                          size="lg"
                          type="submit"
                          disabled={!isFormValid() || createMeterReadingLoading}
                        >
                          {createMeterReadingLoading ? "Creating Reading..." : "Create Reading"}
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
                              <ButtonModule
                                variant="primary"
                                onClick={handleBulkSubmit}
                                disabled={createMeterReadingLoading}
                              >
                                {createMeterReadingLoading ? "Processing..." : `Create ${csvData.length} Readings`}
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
                                  Customer ID
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Period
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Previous (kWh)
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Present (kWh)
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Consumption
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Notes
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {csvData.slice(0, 5).map((reading, index) => (
                                <tr key={index}>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {reading.customerId}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {reading.period}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {reading.previousReadingKwh.toFixed(2)}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {reading.presentReadingKwh.toFixed(2)}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {(reading.presentReadingKwh - reading.previousReadingKwh).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    <div className="max-w-[200px] truncate">{reading.notes}</div>
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

export default AddMeterReadingPage
