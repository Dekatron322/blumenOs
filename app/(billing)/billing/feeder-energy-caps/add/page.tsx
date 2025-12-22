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
import {
  applyFeederEnergyCaps,
  ApplyFeederEnergyCapsRequest,
  clearApplyFeederEnergyCaps,
} from "lib/redux/feederEnergyCapSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Download, FileText, Menu, Upload, X } from "lucide-react"

interface FeederEnergyCapFormData {
  period: string
  energyCapKwh: number
  tariffOverridePerKwh: number
  notes: string
  areaOfficeId: number
}

interface CSVFeederEnergyCap {
  period: string
  energyCapKwh: number
  tariffOverridePerKwh: number
  notes: string
  areaOfficeId: number
}

const AddFeederEnergyCapPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    applyFeederEnergyCapsLoading,
    applyFeederEnergyCapsError,
    applyFeederEnergyCapsSuccess,
    appliedFeederEnergyCaps,
  } = useSelector((state: RootState) => state.feederEnergyCaps)

  const {
    areaOffices,
    loading: areaOfficesLoading,
    error: areaOfficesError,
  } = useSelector((state: RootState) => state.areaOffices)

  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVFeederEnergyCap[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FeederEnergyCapFormData>({
    period: "",
    energyCapKwh: 0,
    tariffOverridePerKwh: 0,
    notes: "",
    areaOfficeId: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch area offices on component mount
  useEffect(() => {
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )
  }, [dispatch])

  // Generate area office options from API response
  const areaOfficeOptions = [
    { value: 0, label: "Select area office" },
    ...(areaOffices?.map((office) => ({
      value: office.id,
      label: `${office.newKaedcoCode} - ${office.nameOfNewOAreaffice}`,
    })) || []),
  ]

  // Generate period options (next 12 months)
  const generatePeriodOptions = () => {
    const options = []
    const currentDate = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
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
    if (["energyCapKwh", "tariffOverridePerKwh", "areaOfficeId"].includes(name)) {
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

    if (formData.areaOfficeId === 0) {
      errors.areaOfficeId = "Area office is required"
    }

    if (!formData.period.trim()) {
      errors.period = "Billing period is required"
    }

    if (formData.energyCapKwh <= 0) {
      errors.energyCapKwh = "Energy cap must be greater than 0"
    }

    if (formData.tariffOverridePerKwh < 0) {
      errors.tariffOverridePerKwh = "Tariff override cannot be negative"
    }

    if (!formData.notes.trim()) {
      errors.notes = "Notes are required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSingleFeederEnergyCap()
  }

  const submitSingleFeederEnergyCap = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const feederEnergyCapData: ApplyFeederEnergyCapsRequest = {
        period: formData.period,
        energyCapKwh: formData.energyCapKwh,
        tariffOverridePerKwh: formData.tariffOverridePerKwh,
        notes: formData.notes,
        areaOfficeId: formData.areaOfficeId,
      }

      const result = await dispatch(applyFeederEnergyCaps(feederEnergyCapData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Feeder energy caps applied successfully", {
          description: `Energy caps for period ${formData.period} have been applied to ${result.data.length} feeders`,
          duration: 5000,
        })

        // Reset form
        setFormData({
          period: "",
          energyCapKwh: 0,
          tariffOverridePerKwh: 0,
          notes: "",
          areaOfficeId: 0,
        })
        setFormErrors({})
      }
    } catch (error: any) {
      console.error("Failed to apply feeder energy caps:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Failed to apply feeder energy caps", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  const handleReset = () => {
    setFormData({
      period: "",
      energyCapKwh: 0,
      tariffOverridePerKwh: 0,
      notes: "",
      areaOfficeId: 0,
    })
    setFormErrors({})
    dispatch(clearApplyFeederEnergyCaps())
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
        const expectedHeaders = ["period", "energycapkwh", "tariffoverrideperkwh", "notes", "areaofficeid"]

        const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header))
        if (missingHeaders.length > 0) {
          setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
          return
        }

        const parsedData: CSVFeederEnergyCap[] = []
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
              period: row.period,
              energyCapKwh: parseFloat(row.energycapkwh),
              tariffOverridePerKwh: parseFloat(row.tariffoverrideperkwh),
              notes: row.notes,
              areaOfficeId: parseInt(row.areaofficeid),
            })
          }
        }

        setCsvData(parsedData)
        setCsvErrors(errors)

        if (errors.length === 0) {
          notify("success", "CSV file parsed successfully", {
            description: `Found ${parsedData.length} valid feeder energy cap records`,
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

    if (!row.period?.trim()) {
      errors.push(`Row ${rowNumber}: Period is required`)
    } else if (!/^\d{4}-\d{2}$/.test(row.period)) {
      errors.push(`Row ${rowNumber}: Period must be in YYYY-MM format`)
    }

    if (!row.energycapkwh?.trim()) {
      errors.push(`Row ${rowNumber}: Energy cap is required`)
    } else if (isNaN(parseFloat(row.energycapkwh))) {
      errors.push(`Row ${rowNumber}: Energy cap must be a valid number`)
    } else if (parseFloat(row.energycapkwh) <= 0) {
      errors.push(`Row ${rowNumber}: Energy cap must be greater than 0`)
    }

    if (!row.tariffoverrideperkwh?.trim()) {
      errors.push(`Row ${rowNumber}: Tariff override is required`)
    } else if (isNaN(parseFloat(row.tariffoverrideperkwh))) {
      errors.push(`Row ${rowNumber}: Tariff override must be a valid number`)
    } else if (parseFloat(row.tariffoverrideperkwh) < 0) {
      errors.push(`Row ${rowNumber}: Tariff override cannot be negative`)
    }

    if (!row.notes?.trim()) {
      errors.push(`Row ${rowNumber}: Notes are required`)
    }

    if (!row.areaofficeid?.trim()) {
      errors.push(`Row ${rowNumber}: Area office ID is required`)
    } else if (isNaN(parseInt(row.areaofficeid))) {
      errors.push(`Row ${rowNumber}: Area office ID must be a valid number`)
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
      // Process each feeder energy cap individually
      let successCount = 0
      let errorCount = 0

      for (const energyCapData of csvData) {
        try {
          const result = await dispatch(applyFeederEnergyCaps(energyCapData)).unwrap()
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
        notify("success", "All feeder energy caps applied successfully", {
          description: `${successCount} feeder energy caps have been applied`,
          duration: 6000,
        })
      } else {
        notify("warning", "Feeder energy caps processed with some errors", {
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
    const headers = ["period", "energyCapKwh", "tariffOverridePerKwh", "notes", "areaOfficeId"]

    // Use actual area office IDs from the API for the template
    const exampleAreaOfficeId = areaOffices[0]?.id?.toString() ?? "1"

    const exampleData = [
      {
        period: "2024-01",
        energyCapKwh: "1000.0",
        tariffOverridePerKwh: "50.75",
        notes: "Standard energy cap for all feeders",
        areaOfficeId: exampleAreaOfficeId,
      },
      {
        period: "2024-01",
        energyCapKwh: "1500.0",
        tariffOverridePerKwh: "45.25",
        notes: "Increased cap for high-demand area",
        areaOfficeId: exampleAreaOfficeId,
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
    a.download = "feeder_energy_cap_template.csv"
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
      formData.areaOfficeId !== 0 &&
      formData.period.trim() !== "" &&
      formData.energyCapKwh > 0 &&
      formData.tariffOverridePerKwh >= 0 &&
      formData.notes.trim() !== ""
    )
  }

  // Clear success/error states when switching tabs
  React.useEffect(() => {
    if (applyFeederEnergyCapsSuccess || applyFeederEnergyCapsError) {
      dispatch(clearApplyFeederEnergyCaps())
    }
  }, [activeTab, dispatch])

  // Show error notification if area offices fail to load
  useEffect(() => {
    if (areaOfficesError) {
      notify("error", "Failed to load area offices", {
        description: areaOfficesError,
        duration: 5000,
      })
    }
  }, [areaOfficesError])

  // Mobile Tab Navigation
  const MobileTabNavigation = () => (
    <div className="sticky top-0 z-40 mb-4 rounded-lg bg-white p-3 shadow-sm sm:hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="size-4" />
          <span>{activeTab === "single" ? "Single Entry" : "Bulk Upload"}</span>
        </button>
        <div className="text-sm font-medium text-gray-900">
          {activeTab === "single" ? "Single Application" : "Bulk CSV Upload"}
        </div>
      </div>
    </div>
  )

  // Mobile Menu Sidebar
  const MobileMenuSidebar = () => (
    <>
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 sm:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-xl transition-transform duration-200 ease-in-out sm:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
              <button
                type="button"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">Choose application method</p>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("single")
                  setIsMobileMenuOpen(false)
                }}
                className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                  activeTab === "single" ? "bg-blue-50 text-blue-600" : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full ${
                    activeTab === "single" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <FileText className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Single Application</div>
                  <div className="mt-1 text-xs text-gray-600">Apply caps to individual feeders</div>
                </div>
                {activeTab === "single" && <ChevronRight className="size-4 flex-shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("bulk")
                  setIsMobileMenuOpen(false)
                }}
                className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                  activeTab === "bulk" ? "bg-blue-50 text-blue-600" : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full ${
                    activeTab === "bulk" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Upload className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Bulk Upload (CSV)</div>
                  <div className="mt-1 text-xs text-gray-600">Upload CSV file for multiple feeders</div>
                </div>
                {activeTab === "bulk" && <ChevronRight className="size-4 flex-shrink-0" />}
              </button>
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-gray-50 p-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900"
            >
              Close Menu
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-3 xl:px-16">
            {/* Page Header - Mobile Optimized */}
            <div className="mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 sm:hidden"
                    aria-label="Go back"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Apply Feeder Energy Caps</h1>
                    <p className="text-sm text-gray-600">Set energy caps and tariff overrides for feeders</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                    disabled={applyFeederEnergyCapsLoading}
                    className="flex-1 sm:flex-none"
                  >
                    {activeTab === "single" ? "Reset Form" : "Clear CSV"}
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={
                      activeTab === "single"
                        ? () => {
                            void submitSingleFeederEnergyCap()
                          }
                        : () => {
                            void handleBulkSubmit()
                          }
                    }
                    disabled={
                      activeTab === "single"
                        ? !isFormValid() || applyFeederEnergyCapsLoading
                        : csvData.length === 0 || csvErrors.length > 0 || applyFeederEnergyCapsLoading
                    }
                    icon={<AddIcon />}
                    iconPosition="start"
                    className="flex-1 sm:flex-none"
                  >
                    {activeTab === "single"
                      ? applyFeederEnergyCapsLoading
                        ? "Applying..."
                        : "Apply Caps"
                      : applyFeederEnergyCapsLoading
                      ? "Processing..."
                      : `Apply ${csvData.length} Caps`}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <MobileTabNavigation />

            {/* Mobile Menu Sidebar */}
            <MobileMenuSidebar />

            {/* Desktop Tab Navigation */}
            <div className="hidden sm:block">
              <div className="rounded-t-lg border-b border-gray-200 bg-white">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("single")}
                    className={`flex-1 rounded-tl-lg px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${
                      activeTab === "single"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Single Application
                  </button>
                  <button
                    onClick={() => setActiveTab("bulk")}
                    className={`flex-1 rounded-tr-lg px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${
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
            <div className="w-full">
              {activeTab === "single" ? (
                /* Single Entry Form */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-b-lg rounded-tl-lg bg-white p-4 shadow-sm sm:rounded-t-lg sm:p-6"
                >
                  {/* Form Header */}
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Feeder Energy Cap Information</h3>
                    <p className="text-sm text-gray-600">Fill in all required fields to apply energy caps to feeders</p>
                  </div>

                  {/* Feeder Energy Cap Form */}
                  <form onSubmit={handleSingleSubmit} className="space-y-8">
                    {/* Section 1: Area Office & Period Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Area Office & Period</h4>
                        <p className="text-sm text-gray-600">Select the area office and billing period</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                    {/* Section 2: Energy Cap Details */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Energy Cap Details</h4>
                        <p className="text-sm text-gray-600">Set the energy cap and tariff override values</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInputModule
                          label="Energy Cap (kWh)"
                          name="energyCapKwh"
                          type="number"
                          placeholder="0.00"
                          value={formData.energyCapKwh}
                          onChange={handleInputChange}
                          error={formErrors.energyCapKwh}
                          required
                          step="0.01"
                          min="0.01"
                        />

                        <FormInputModule
                          label="Tariff Override (per kWh)"
                          name="tariffOverridePerKwh"
                          type="number"
                          placeholder="0.00"
                          value={formData.tariffOverridePerKwh}
                          onChange={handleInputChange}
                          error={formErrors.tariffOverridePerKwh}
                          required
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Section 3: Additional Information */}
                    <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-4 sm:p-6">
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                        <p className="text-sm text-gray-600">Provide any additional notes or comments</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormInputModule
                          label="Notes"
                          name="notes"
                          type="text"
                          placeholder="Enter any notes about these energy caps (e.g., special conditions, seasonal adjustments, etc.)"
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
                            <AlertCircle className="size-5 text-amber-400" />
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
                    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end sm:gap-4">
                      <ButtonModule
                        variant="dangerSecondary"
                        size="lg"
                        onClick={handleReset}
                        disabled={applyFeederEnergyCapsLoading}
                        type="button"
                        className="w-full sm:w-auto"
                      >
                        Reset
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="lg"
                        type="submit"
                        disabled={!isFormValid() || applyFeederEnergyCapsLoading}
                        className="w-full sm:w-auto"
                      >
                        {applyFeederEnergyCapsLoading ? "Applying Caps..." : "Apply Energy Caps"}
                      </ButtonModule>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* Bulk Upload Section */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-b-lg rounded-tl-lg bg-white p-4 shadow-sm sm:rounded-t-lg sm:p-6"
                >
                  {/* Template Download */}
                  <div className="mb-6 rounded-lg bg-blue-50 p-4">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                        <p className="text-sm text-blue-600">Download our CSV template to ensure proper formatting</p>
                      </div>
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        onClick={downloadTemplate}
                        icon={<Download className="size-4" />}
                        iconPosition="start"
                        className="w-full sm:w-auto"
                      >
                        Download Template
                      </ButtonModule>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-6 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".csv"
                      className="hidden"
                    />

                    {!csvFile ? (
                      <div>
                        <Upload className="mx-auto size-12 text-gray-400" />
                        <div className="mt-4 flex w-full flex-col items-center justify-center">
                          <ButtonModule
                            variant="primary"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto"
                          >
                            Choose CSV File
                          </ButtonModule>
                          <p className="mt-2 text-sm text-gray-600">or drag and drop your file here</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">CSV files only (max 10MB)</p>
                      </div>
                    ) : (
                      <div>
                        <CheckCircle className="mx-auto size-12 text-green-500" />
                        <p className="mt-2 text-sm font-medium text-gray-900">{csvFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {csvData.length} valid records found
                          {csvErrors.length > 0 && `, ${csvErrors.length} errors`}
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
                            className="w-full sm:w-auto"
                          >
                            Choose Different File
                          </ButtonModule>
                          {csvErrors.length === 0 && csvData.length > 0 && (
                            <ButtonModule
                              variant="primary"
                              onClick={handleBulkSubmit}
                              disabled={applyFeederEnergyCapsLoading}
                              className="w-full sm:w-auto"
                            >
                              {applyFeederEnergyCapsLoading ? "Processing..." : `Apply ${csvData.length} Caps`}
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
                          <AlertCircle className="size-5 text-red-400" />
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-red-800">
                            CSV Validation Errors ({csvErrors.length})
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="max-h-32 space-y-1 overflow-y-auto">
                              {csvErrors.slice(0, 5).map((error, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span className="break-all">{error}</span>
                                </li>
                              ))}
                              {csvErrors.length > 5 && (
                                <li className="text-gray-600">... and {csvErrors.length - 5} more errors</li>
                              )}
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
                      <div className="max-h-48 overflow-x-auto overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 sm:px-4">
                                Period
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 sm:px-4">
                                Energy Cap
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 sm:px-4">
                                Tariff
                              </th>
                              <th className="hidden px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 sm:table-cell sm:px-4">
                                Area Office
                              </th>
                              <th className="hidden px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 md:table-cell md:px-4">
                                Notes
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {csvData.slice(0, 5).map((energyCap, index) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 sm:px-4">
                                  {energyCap.period}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 sm:px-4">
                                  {energyCap.energyCapKwh.toFixed(2)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 sm:px-4">
                                  {energyCap.tariffOverridePerKwh.toFixed(2)}
                                </td>
                                <td className="hidden whitespace-nowrap px-3 py-2 text-sm text-gray-900 sm:table-cell sm:px-4">
                                  {energyCap.areaOfficeId}
                                </td>
                                <td className="hidden px-3 py-2 text-sm text-gray-900 md:table-cell md:px-4">
                                  <div className="max-w-[200px] truncate">{energyCap.notes}</div>
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
    </section>
  )
}

export default AddFeederEnergyCapPage
