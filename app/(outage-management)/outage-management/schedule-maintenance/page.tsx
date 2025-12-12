"use client"
import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddAgentIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { createMaintenance, CreateMaintenanceRequest, fetchMaintenances } from "lib/redux/maintenanceSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"

interface MaintenanceFormData {
  title: string
  details: string
  type: number | ""
  priority: number | ""
  scheduledStartAt: string
  scheduledEndAt: string
  distributionSubstationId: number | ""
  feederId: number | ""
  scope: number | ""
  requiresShutdown: boolean
  customerNotified: boolean
}

interface CSVMaintenance {
  title: string
  details: string
  type: number
  priority: number
  scheduledStartAt: string
  scheduledEndAt: string
  distributionSubstationId: number
  feederId: number
  scope: number
  requiresShutdown: boolean
  customerNotified: boolean
}

const ScheduleMaintenance = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { createLoading, createError, createSuccess } = useSelector((state: RootState) => state.maintenances)

  const {
    distributionSubstations,
    loading: distributionSubstationsLoading,
    error: distributionSubstationsError,
  } = useSelector((state: RootState) => state.distributionSubstations)

  const { feeders, loading: feedersLoading, error: feedersError } = useSelector((state: RootState) => state.feeders)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVMaintenance[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<MaintenanceFormData>({
    title: "",
    details: "",
    type: "",
    priority: "",
    scheduledStartAt: "",
    scheduledEndAt: "",
    distributionSubstationId: "",
    feederId: "",
    scope: "",
    requiresShutdown: false,
    customerNotified: false,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    dispatch(
      fetchDistributionSubstations({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    dispatch(
      fetchFeeders({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  // Options for dropdowns
  const typeOptions = [
    { value: "", label: "Select maintenance type" },
    { value: "1", label: "Preventive" },
    { value: "2", label: "Corrective" },
    { value: "3", label: "Emergency" },
  ]

  const priorityOptions = [
    { value: "", label: "Select priority" },
    { value: "1", label: "Low" },
    { value: "2", label: "Medium" },
    { value: "3", label: "High" },
    { value: "4", label: "Critical" },
  ]

  const scopeOptions = [
    { value: "", label: "Select scope" },
    { value: "1", label: "Local" },
    { value: "2", label: "Regional" },
  ]

  const booleanOptions = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  // Mock data for distribution substations and feeders (in real app, fetch from API)
  const distributionSubstationOptions = [
    { value: "", label: "Select distribution substation" },
    ...distributionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.dssCode} (${substation.nercCode})`,
    })),
  ]

  const feederOptions = [
    { value: "", label: "Select feeder" },
    ...feeders.map((feeder) => ({
      value: feeder.id,
      label: feeder.injectionSubstation?.injectionSubstationCode
        ? `${feeder.name} (${feeder.nercCode}) - ${feeder.injectionSubstation.injectionSubstationCode}`
        : `${feeder.name} (${feeder.nercCode})`,
    })),
  ]

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string | number | boolean } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle boolean values from select
    let processedValue: string | number | boolean = value
    if (name === "requiresShutdown" || name === "customerNotified") {
      processedValue = value === "true"
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

    if (!formData.title.trim()) {
      errors.title = "Maintenance title is required"
    } else if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters long"
    }

    if (!formData.details.trim()) {
      errors.details = "Maintenance details are required"
    } else if (formData.details.length < 10) {
      errors.details = "Details must be at least 10 characters long"
    }

    if (!formData.type) {
      errors.type = "Maintenance type is required"
    }

    if (!formData.priority) {
      errors.priority = "Priority is required"
    }

    if (!formData.scheduledStartAt) {
      errors.scheduledStartAt = "Scheduled start time is required"
    } else {
      const startTime = new Date(formData.scheduledStartAt)
      const now = new Date()
      if (startTime <= now) {
        errors.scheduledStartAt = "Scheduled start time must be in the future"
      }
    }

    if (!formData.scheduledEndAt) {
      errors.scheduledEndAt = "Scheduled end time is required"
    } else if (formData.scheduledStartAt) {
      const startTime = new Date(formData.scheduledStartAt)
      const endTime = new Date(formData.scheduledEndAt)
      if (endTime <= startTime) {
        errors.scheduledEndAt = "Scheduled end time must be after start time"
      }
    }

    if (!formData.distributionSubstationId) {
      errors.distributionSubstationId = "Distribution substation is required"
    }

    if (!formData.feederId) {
      errors.feederId = "Feeder is required"
    }

    if (!formData.scope) {
      errors.scope = "Scope is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSingleMaintenance()
  }

  const submitSingleMaintenance = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const maintenanceData: CreateMaintenanceRequest = {
        title: formData.title,
        details: formData.details,
        type: Number(formData.type),
        priority: Number(formData.priority),
        scheduledStartAt: new Date(formData.scheduledStartAt).toISOString(),
        scheduledEndAt: new Date(formData.scheduledEndAt).toISOString(),
        distributionSubstationId: Number(formData.distributionSubstationId),
        feederId: Number(formData.feederId),
        scope: Number(formData.scope),
        requiresShutdown: formData.requiresShutdown,
        customerNotified: formData.customerNotified,
      }

      const result = await dispatch(createMaintenance(maintenanceData)).unwrap()

      notify("success", "Maintenance scheduled successfully", {
        description: `Maintenance "${formData.title}" has been scheduled and assigned reference code: ${result.data.referenceCode}`,
        duration: 5000,
      })

      // Reset form
      setFormData({
        title: "",
        details: "",
        type: "",
        priority: "",
        scheduledStartAt: "",
        scheduledEndAt: "",
        distributionSubstationId: "",
        feederId: "",
        scope: "",
        requiresShutdown: false,
        customerNotified: false,
      })
      setFormErrors({})

      // Refresh the maintenances list
      dispatch(
        fetchMaintenances({
          pageNumber: 1,
          pageSize: 10,
        })
      )
    } catch (error: any) {
      console.error("Failed to schedule maintenance:", error)
      const errorMessage = error || "An unexpected error occurred while scheduling the maintenance"
      notify("error", "Failed to schedule maintenance", {
        description: errorMessage,
        duration: 6000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      title: "",
      details: "",
      type: "",
      priority: "",
      scheduledStartAt: "",
      scheduledEndAt: "",
      distributionSubstationId: "",
      feederId: "",
      scope: "",
      requiresShutdown: false,
      customerNotified: false,
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
          "title",
          "details",
          "type",
          "priority",
          "scheduledstartat",
          "scheduledendat",
          "distributionsubstationid",
          "feederid",
          "scope",
          "requiresshutdown",
          "customernotified",
        ]

        const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header))
        if (missingHeaders.length > 0) {
          setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
          return
        }

        const parsedData: CSVMaintenance[] = []
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
              title: row.title,
              details: row.details,
              type: parseInt(row.type),
              priority: parseInt(row.priority),
              scheduledStartAt: row.scheduledstartat,
              scheduledEndAt: row.scheduledendat,
              distributionSubstationId: parseInt(row.distributionsubstationid),
              feederId: parseInt(row.feederid),
              scope: parseInt(row.scope),
              requiresShutdown: row.requiresshutdown.toLowerCase() === "true",
              customerNotified: row.customernotified.toLowerCase() === "true",
            })
          }
        }

        setCsvData(parsedData)
        setCsvErrors(errors)

        if (errors.length === 0) {
          notify("success", "CSV file parsed successfully", {
            description: `Found ${parsedData.length} valid maintenance records`,
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

    if (!row.title?.trim()) {
      errors.push(`Row ${rowNumber}: Maintenance title is required`)
    } else if (row.title.length < 5) {
      errors.push(`Row ${rowNumber}: Title must be at least 5 characters long`)
    }

    if (!row.details?.trim()) {
      errors.push(`Row ${rowNumber}: Maintenance details are required`)
    } else if (row.details.length < 10) {
      errors.push(`Row ${rowNumber}: Details must be at least 10 characters long`)
    }

    if (!row.type?.trim()) {
      errors.push(`Row ${rowNumber}: Maintenance type is required`)
    } else if (isNaN(parseInt(row.type))) {
      errors.push(`Row ${rowNumber}: Type must be a number (1-3)`)
    } else if (![1, 2, 3].includes(parseInt(row.type))) {
      errors.push(`Row ${rowNumber}: Type must be 1 (Preventive), 2 (Corrective), or 3 (Emergency)`)
    }

    if (!row.priority?.trim()) {
      errors.push(`Row ${rowNumber}: Priority is required`)
    } else if (isNaN(parseInt(row.priority))) {
      errors.push(`Row ${rowNumber}: Priority must be a number (1-4)`)
    } else if (![1, 2, 3, 4].includes(parseInt(row.priority))) {
      errors.push(`Row ${rowNumber}: Priority must be between 1 and 4`)
    }

    if (!row.scheduledstartat?.trim()) {
      errors.push(`Row ${rowNumber}: Scheduled start time is required`)
    } else {
      const startTime = new Date(row.scheduledstartat)
      if (isNaN(startTime.getTime())) {
        errors.push(`Row ${rowNumber}: Scheduled start time must be a valid date`)
      }
    }

    if (!row.scheduledendat?.trim()) {
      errors.push(`Row ${rowNumber}: Scheduled end time is required`)
    } else {
      const endTime = new Date(row.scheduledendat)
      if (isNaN(endTime.getTime())) {
        errors.push(`Row ${rowNumber}: Scheduled end time must be a valid date`)
      }
    }

    if (row.scheduledstartat && row.scheduledendat) {
      const startTime = new Date(row.scheduledstartat)
      const endTime = new Date(row.scheduledendat)
      if (endTime <= startTime) {
        errors.push(`Row ${rowNumber}: Scheduled end time must be after start time`)
      }
    }

    if (!row.distributionsubstationid?.trim()) {
      errors.push(`Row ${rowNumber}: Distribution substation ID is required`)
    } else if (isNaN(parseInt(row.distributionsubstationid))) {
      errors.push(`Row ${rowNumber}: Distribution substation ID must be a number`)
    }

    if (!row.feederid?.trim()) {
      errors.push(`Row ${rowNumber}: Feeder ID is required`)
    } else if (isNaN(parseInt(row.feederid))) {
      errors.push(`Row ${rowNumber}: Feeder ID must be a number`)
    }

    if (!row.scope?.trim()) {
      errors.push(`Row ${rowNumber}: Scope is required`)
    } else if (isNaN(parseInt(row.scope))) {
      errors.push(`Row ${rowNumber}: Scope must be a number (1 or 2)`)
    } else if (![1, 2].includes(parseInt(row.scope))) {
      errors.push(`Row ${rowNumber}: Scope must be 1 (Local) or 2 (Regional)`)
    }

    if (!row.requiresshutdown?.trim()) {
      errors.push(`Row ${rowNumber}: Requires shutdown is required`)
    } else if (!["true", "false"].includes(row.requiresshutdown.toLowerCase())) {
      errors.push(`Row ${rowNumber}: Requires shutdown must be "true" or "false"`)
    }

    if (!row.customernotified?.trim()) {
      errors.push(`Row ${rowNumber}: Customer notified is required`)
    } else if (!["true", "false"].includes(row.customernotified.toLowerCase())) {
      errors.push(`Row ${rowNumber}: Customer notified must be "true" or "false"`)
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
      // Normalize dates and process each maintenance in the CSV data
      const payloads: CreateMaintenanceRequest[] = csvData.map((maintenance) => ({
        title: maintenance.title,
        details: maintenance.details,
        type: maintenance.type,
        priority: maintenance.priority,
        scheduledStartAt: new Date(maintenance.scheduledStartAt).toISOString(),
        scheduledEndAt: new Date(maintenance.scheduledEndAt).toISOString(),
        distributionSubstationId: maintenance.distributionSubstationId,
        feederId: maintenance.feederId,
        scope: maintenance.scope,
        requiresShutdown: maintenance.requiresShutdown,
        customerNotified: maintenance.customerNotified,
      }))

      const results = await Promise.allSettled(payloads.map((payload) => dispatch(createMaintenance(payload))))

      const successful = results.filter((result) => result.status === "fulfilled").length
      const failed = results.filter((result) => result.status === "rejected").length

      if (failed === 0) {
        notify("success", "Bulk maintenance scheduling completed", {
          description: `Successfully scheduled ${successful} maintenance tasks`,
          duration: 6000,
        })
      } else {
        notify("warning", "Bulk maintenance scheduling completed with errors", {
          description: `Successfully scheduled ${successful} maintenance tasks, ${failed} failed`,
          duration: 6000,
        })
      }

      // Refresh the maintenances list
      dispatch(
        fetchMaintenances({
          pageNumber: 1,
          pageSize: 10,
        })
      )

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
      "title",
      "details",
      "type",
      "priority",
      "scheduledStartAt",
      "scheduledEndAt",
      "distributionSubstationId",
      "feederId",
      "scope",
      "requiresShutdown",
      "customerNotified",
    ]

    const exampleData = [
      {
        title: "Transformer Maintenance - Kaduna Central",
        details: "Routine maintenance and inspection of main transformer at Kaduna Central substation",
        type: "1",
        priority: "2",
        scheduledStartAt: "2024-02-01T08:00:00Z",
        scheduledEndAt: "2024-02-01T16:00:00Z",
        distributionSubstationId: "1",
        feederId: "1",
        scope: "1",
        requiresShutdown: "true",
        customerNotified: "true",
      },
      {
        title: "Cable Replacement - Barnawa Feeder",
        details: "Replace faulty underground cable causing intermittent outages in Barnawa area",
        type: "2",
        priority: "3",
        scheduledStartAt: "2024-02-05T06:00:00Z",
        scheduledEndAt: "2024-02-05T12:00:00Z",
        distributionSubstationId: "2",
        feederId: "2",
        scope: "1",
        requiresShutdown: "true",
        customerNotified: "true",
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
    a.download = "maintenance_schedule_template.csv"
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
      formData.title.trim() !== "" &&
      formData.details.trim() !== "" &&
      formData.type !== "" &&
      formData.priority !== "" &&
      formData.scheduledStartAt !== "" &&
      formData.scheduledEndAt !== "" &&
      formData.distributionSubstationId !== "" &&
      formData.feederId !== "" &&
      formData.scope !== ""
    )
  }

  return (
    <section className="size-full">
      <DashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col px-3 2xl:container max-sm:px-3 xl:px-16">
          {/* Page Header */}
          <div className="flex w-full justify-between gap-6 max-md:flex-col max-md:items-start max-sm:my-4 md:my-8">
            <div>
              <h4 className="text-2xl font-semibold">Schedule Maintenance</h4>
              <p className="text-gray-600">Schedule new maintenance tasks for equipment and infrastructure</p>
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
                        void submitSingleMaintenance()
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
              >
                {activeTab === "single"
                  ? isSubmitting
                    ? "Scheduling Maintenance..."
                    : "Schedule Maintenance"
                  : isBulkLoading
                  ? "Processing..."
                  : `Process ${csvData.length} Maintenance Tasks`}
              </ButtonModule>
            </motion.div>
          </div>
          <div className="flex w-full flex-col">
            {/* Tab Navigation */}
            <div className="">
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
            <div className="flex w-full gap-6 max-md:flex-col max-sm:my-4">
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
                      <h3 className="text-lg font-semibold text-gray-900">Maintenance Information</h3>
                      <p className="text-sm text-gray-600">
                        Fill in all required fields to schedule a new maintenance task
                      </p>
                    </div>

                    {/* Maintenance Form */}
                    <form onSubmit={handleSingleSubmit} className="space-y-4">
                      <div className="flex w-full flex-col gap-6">
                        {/* Basic Information */}
                        <div className="rounded-lg bg-[#f9f9f9] p-4">
                          <h4 className="mb-4 font-medium text-gray-900">Basic Information</h4>
                          <div className="flex w-full flex-col gap-4 md:flex-row">
                            <FormInputModule
                              label="Maintenance Title"
                              name="title"
                              type="text"
                              placeholder="Enter maintenance title (e.g., Transformer Maintenance - Kaduna Central)"
                              value={formData.title}
                              onChange={handleInputChange}
                              error={formErrors.title}
                              className="w-full"
                              required
                            />

                            <FormInputModule
                              label="Maintenance Details"
                              name="details"
                              type="textarea"
                              placeholder="Provide detailed description of the maintenance work, equipment involved, and procedures"
                              value={formData.details}
                              onChange={handleInputChange}
                              error={formErrors.details}
                              className="w-full"
                              required
                            />
                          </div>
                        </div>

                        {/* Maintenance Details */}
                        <div className="rounded-lg bg-[#f9f9f9] p-4">
                          <h4 className="mb-4 font-medium text-gray-900">Maintenance Details</h4>
                          <div className="grid w-full gap-4 md:grid-cols-2">
                            <FormSelectModule
                              label="Maintenance Type"
                              name="type"
                              value={formData.type}
                              onChange={handleInputChange}
                              options={typeOptions}
                              error={formErrors.type}
                              required
                            />

                            <FormSelectModule
                              label="Priority"
                              name="priority"
                              value={formData.priority}
                              onChange={handleInputChange}
                              options={priorityOptions}
                              error={formErrors.priority}
                              required
                            />

                            <FormInputModule
                              label="Scheduled Start Time"
                              name="scheduledStartAt"
                              type="datetime-local"
                              value={formData.scheduledStartAt}
                              onChange={handleInputChange}
                              error={formErrors.scheduledStartAt}
                              required
                              placeholder={""}
                            />

                            <FormInputModule
                              label="Scheduled End Time"
                              name="scheduledEndAt"
                              type="datetime-local"
                              value={formData.scheduledEndAt}
                              onChange={handleInputChange}
                              error={formErrors.scheduledEndAt}
                              required
                              placeholder={""}
                            />
                          </div>
                        </div>

                        {/* Location and Configuration */}
                        <div className=" space-y-4 rounded-lg bg-[#f9f9f9] p-4">
                          <h4 className="font-medium text-gray-900">Location & Configuration</h4>

                          <div className="grid w-full gap-4 md:grid-cols-2">
                            <FormSelectModule
                              label="Distribution Substation"
                              name="distributionSubstationId"
                              value={formData.distributionSubstationId}
                              onChange={handleInputChange}
                              options={distributionSubstationOptions}
                              error={formErrors.distributionSubstationId}
                              required
                            />

                            <FormSelectModule
                              label="Feeder"
                              name="feederId"
                              value={formData.feederId}
                              onChange={handleInputChange}
                              options={feederOptions}
                              error={formErrors.feederId}
                              required
                            />

                            <FormSelectModule
                              label="Scope"
                              name="scope"
                              value={formData.scope}
                              onChange={handleInputChange}
                              options={scopeOptions}
                              error={formErrors.scope}
                              required
                            />

                            <FormSelectModule
                              label="Requires Shutdown"
                              name="requiresShutdown"
                              value={formData.requiresShutdown.toString()}
                              onChange={handleInputChange}
                              options={booleanOptions}
                              required
                            />

                            <FormSelectModule
                              label="Customer Notified"
                              name="customerNotified"
                              value={formData.customerNotified.toString()}
                              onChange={handleInputChange}
                              options={booleanOptions}
                              required
                            />
                          </div>
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
                          size="md"
                          onClick={handleReset}
                          disabled={isSubmitting}
                          type="button"
                        >
                          Reset
                        </ButtonModule>
                        <ButtonModule
                          variant="primary"
                          size="md"
                          type="submit"
                          disabled={!isFormValid() || isSubmitting}
                        >
                          {isSubmitting ? "Scheduling Maintenance..." : "Schedule Maintenance"}
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
                                {isBulkLoading ? "Processing..." : `Process ${csvData.length} Maintenance Tasks`}
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
                                  Title
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Type
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Priority
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Start Time
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {csvData.slice(0, 5).map((maintenance, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    <div className="max-w-xs truncate">{maintenance.title}</div>
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {maintenance.type === 1
                                      ? "Preventive"
                                      : maintenance.type === 2
                                      ? "Corrective"
                                      : "Emergency"}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {maintenance.priority === 1
                                      ? "Low"
                                      : maintenance.priority === 2
                                      ? "Medium"
                                      : maintenance.priority === 3
                                      ? "High"
                                      : "Critical"}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {new Date(maintenance.scheduledStartAt).toLocaleDateString()}
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

export default ScheduleMaintenance
