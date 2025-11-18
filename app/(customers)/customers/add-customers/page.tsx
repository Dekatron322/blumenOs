"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddCustomerIcon, RefreshCircleIcon } from "components/Icons/Icons"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  clearCreateState,
  bulkCreateCustomers,
  CreateCustomerRequest,
  BulkCreateCustomerRequest,
} from "lib/redux/customerSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"

interface CustomerFormData {
  fullName: string
  phoneNumber: string
  email: string
  address: string
  distributionSubstationId: number
  status: string
  addressTwo: string
  city: string
  state: string
  serviceCenterId: number
  latitude: number
  longitude: number
  tariff: number
  meterNumber: string
  isPPM: boolean
  isMD: boolean
  comment: string
  band: string
  storedAverage: number
  totalMonthlyVend: number
  totalMonthlyDebt: number
  customerOutstandingDebtBalance: number
  salesRepUserId: number
  technicalEngineerUserId: number
}

type CSVCustomer = CreateCustomerRequest

const AddCustomerPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { createLoading, createError, createSuccess, bulkCreateResults } = useSelector(
    (state: RootState) => state.customers
  )

  const {
    distributionSubstations,
    loading: distributionSubstationsLoading,
    error: distributionSubstationsError,
  } = useSelector((state: RootState) => state.distributionSubstations)

  const {
    serviceStations,
    loading: serviceStationsLoading,
    error: serviceStationsError,
  } = useSelector((state: RootState) => state.serviceStations)

  const { employees, employeesLoading, employeesError } = useSelector((state: RootState) => state.employee)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVCustomer[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    distributionSubstationId: 0,
    status: "ACTIVE",
    addressTwo: "",
    city: "",
    state: "",
    serviceCenterId: 0,
    latitude: 0,
    longitude: 0,
    tariff: 0,
    meterNumber: "",
    isPPM: false,
    isMD: false,
    comment: "",
    band: "",
    storedAverage: 0,
    totalMonthlyVend: 0,
    totalMonthlyDebt: 0,
    customerOutstandingDebtBalance: 0,
    salesRepUserId: 0,
    technicalEngineerUserId: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch related data when component mounts
  React.useEffect(() => {
    // Fetch distribution substations for the dropdown
    dispatch(
      fetchDistributionSubstations({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Fetch service centers for the dropdown
    dispatch(
      fetchServiceStations({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Fetch employees for the dropdowns
    dispatch(
      fetchEmployees({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  // Handle success and error states
  React.useEffect(() => {
    if (createSuccess) {
      if (activeTab === "single") {
        notify("success", "Customer created successfully", {
          description: `${formData.fullName} has been added to the system`,
          duration: 5000,
        })
        // Reset form after successful creation
        handleReset()
      } else if (activeTab === "bulk" && bulkCreateResults) {
        const { successful, failed } = bulkCreateResults
        const successCount = successful.length
        const failedCount = failed.length

        if (failedCount === 0) {
          notify("success", "Bulk upload completed successfully", {
            description: `All ${successCount} customers have been created successfully`,
            duration: 6000,
          })
        } else {
          notify("warning", "Bulk upload completed with some errors", {
            description: `${successCount} customers created successfully, ${failedCount} failed`,
            duration: 8000,
          })
        }

        // Reset bulk upload state
        setCsvFile(null)
        setCsvData([])
        setCsvErrors([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }

    if (createError) {
      notify("error", "Failed to create customer", {
        description: createError,
        duration: 6000,
      })
    }
  }, [createSuccess, createError, bulkCreateResults, activeTab, formData.fullName])

  // Clear state when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearCreateState())
    }
  }, [dispatch])

  // Options for dropdowns
  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ]

  const bandOptions = [
    { value: "", label: "Select band" },
    { value: "Band A", label: "Band A" },
    { value: "Band B", label: "Band B" },
    { value: "Band C", label: "Band C" },
    { value: "Band D", label: "Band D" },
    { value: "Band E", label: "Band E" },
  ]

  // Distribution substation options from fetched data
  const distributionSubstationOptions = [
    { value: 0, label: "Select distribution substation" },
    ...distributionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.dssCode} (${substation.nercCode})`,
    })),
  ]

  // Service center options from fetched data
  const serviceCenterOptions = [
    { value: 0, label: "Select service center" },
    ...serviceStations.map((serviceStation) => ({
      value: serviceStation.id,
      label: `${serviceStation.name} (${serviceStation.code})`,
    })),
  ]

  // Employee options for sales rep and technical engineer
  const employeeOptions = [
    { value: 0, label: "Select employee" },
    ...employees.map((employee) => ({
      value: employee.id,
      label: `${employee.fullName} (${employee.email})`,
    })),
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields
    let processedValue = value
    if (
      [
        "distributionSubstationId",
        "serviceCenterId",
        "latitude",
        "longitude",
        "tariff",
        "storedAverage",
        "totalMonthlyVend",
        "totalMonthlyDebt",
        "customerOutstandingDebtBalance",
        "salesRepUserId",
        "technicalEngineerUserId",
      ].includes(name)
    ) {
      processedValue = value === "" ? 0 : Number(value)
    }

    // Handle boolean fields
    if (["isPPM", "isMD"].includes(name)) {
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
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

    if (!formData.distributionSubstationId || formData.distributionSubstationId === 0) {
      errors.distributionSubstationId = "Distribution substation is required"
    }

    if (!formData.serviceCenterId || formData.serviceCenterId === 0) {
      errors.serviceCenterId = "Service center is required"
    }

    if (!formData.band.trim()) {
      errors.band = "Band is required"
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

    try {
      const createData: CreateCustomerRequest = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        distributionSubstationId: formData.distributionSubstationId,
        status: formData.status,
        addressTwo: formData.addressTwo,
        city: formData.city,
        state: formData.state,
        serviceCenterId: formData.serviceCenterId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        tariff: formData.tariff,
        meterNumber: formData.meterNumber,
        isPPM: formData.isPPM,
        isMD: formData.isMD,
        comment: formData.comment,
        band: formData.band,
        storedAverage: formData.storedAverage,
        totalMonthlyVend: formData.totalMonthlyVend,
        totalMonthlyDebt: formData.totalMonthlyDebt,
        customerOutstandingDebtBalance: formData.customerOutstandingDebtBalance,
        salesRepUserId: formData.salesRepUserId,
        technicalEngineerUserId: formData.technicalEngineerUserId,
      }

      const bulkPayload: BulkCreateCustomerRequest = {
        customers: [createData],
      }

      await dispatch(bulkCreateCustomers(bulkPayload)).unwrap()

      // Success is handled in the useEffect above
    } catch (error: any) {
      console.error("Failed to create customer:", error)
      // Error is handled in the useEffect above
    }
  }

  const handleReset = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
      distributionSubstationId: 0,
      status: "ACTIVE",
      addressTwo: "",
      city: "",
      state: "",
      serviceCenterId: 0,
      latitude: 0,
      longitude: 0,
      tariff: 0,
      meterNumber: "",
      isPPM: false,
      isMD: false,
      comment: "",
      band: "",
      storedAverage: 0,
      totalMonthlyVend: 0,
      totalMonthlyDebt: 0,
      customerOutstandingDebtBalance: 0,
      salesRepUserId: 0,
      technicalEngineerUserId: 0,
    })
    setFormErrors({})
    dispatch(clearCreateState())
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

        const headers = lines[0]!.split(",").map((header) => header.trim())

        // Validate headers: use the exact camelCase headers from the template
        const requiredHeaders = [
          "fullName",
          "phoneNumber",
          "email",
          "address",
          "distributionSubstationId",
          "serviceCenterId",
          "band",
        ]

        const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))
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
            const customer: CSVCustomer = {
              fullName: row.fullName,
              phoneNumber: row.phoneNumber,
              email: row.email,
              address: row.address,
              distributionSubstationId: row.distributionSubstationId ? Number(row.distributionSubstationId) : 0,
              status: row.status || "ACTIVE",
              addressTwo: row.addressTwo || "",
              city: row.city || "",
              state: row.state || "",
              serviceCenterId: row.serviceCenterId ? Number(row.serviceCenterId) : 0,
              latitude: row.latitude ? Number(row.latitude) : 0,
              longitude: row.longitude ? Number(row.longitude) : 0,
              tariff: row.tariff ? Number(row.tariff) : 0,
              meterNumber: row.meterNumber || "",
              isPPM: String(row.isPPM).toLowerCase() === "true",
              isMD: String(row.isMD).toLowerCase() === "true",
              comment: row.comment || "",
              band: row.band,
              storedAverage: row.storedAverage ? Number(row.storedAverage) : 0,
              totalMonthlyVend: row.totalMonthlyVend ? Number(row.totalMonthlyVend) : 0,
              totalMonthlyDebt: row.totalMonthlyDebt ? Number(row.totalMonthlyDebt) : 0,
              customerOutstandingDebtBalance: row.customerOutstandingDebtBalance
                ? Number(row.customerOutstandingDebtBalance)
                : 0,
              salesRepUserId: row.salesRepUserId ? Number(row.salesRepUserId) : 0,
              technicalEngineerUserId: row.technicalEngineerUserId ? Number(row.technicalEngineerUserId) : 0,
            }

            parsedData.push(customer)
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

    if (!row.fullName?.trim()) {
      errors.push(`Row ${rowNumber}: Full name is required`)
    }

    if (!row.phoneNumber?.trim()) {
      errors.push(`Row ${rowNumber}: Phone number is required`)
    } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(row.phoneNumber.replace(/\s/g, ""))) {
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

    if (!row.distributionSubstationId?.trim()) {
      errors.push(`Row ${rowNumber}: Distribution substation ID is required`)
    }

    if (!row.serviceCenterId?.trim()) {
      errors.push(`Row ${rowNumber}: Service center ID is required`)
    }

    if (!row.band?.trim()) {
      errors.push(`Row ${rowNumber}: Band is required`)
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
      // csvData already contains CreateCustomerRequest-compatible objects
      const bulkData: BulkCreateCustomerRequest = {
        customers: csvData,
      }

      await dispatch(bulkCreateCustomers(bulkData)).unwrap()

      // Success is handled in the useEffect above
    } catch (error: any) {
      console.error("Failed to process bulk upload:", error)
      // Error is handled in the useEffect above
    }
  }

  const downloadTemplate = () => {
    const headers = [
      "fullName",
      "phoneNumber",
      "email",
      "address",
      "distributionSubstationId",
      "status",
      "addressTwo",
      "city",
      "state",
      "serviceCenterId",
      "latitude",
      "longitude",
      "tariff",
      "meterNumber",
      "isPPM",
      "isMD",
      "comment",
      "band",
      "storedAverage",
      "totalMonthlyVend",
      "totalMonthlyDebt",
      "customerOutstandingDebtBalance",
      "salesRepUserId",
      "technicalEngineerUserId",
    ] as const

    const exampleData: CSVCustomer[] = [
      {
        fullName: "Muritala Ibrahim",
        phoneNumber: "09017292738",
        email: "muritalaibrahim097@gmail.com",
        address: "King Land, Jiwa Abuja",
        distributionSubstationId: 2,
        status: "ACTIVE",
        addressTwo: "",
        city: "Abuja",
        state: "Abuja",
        serviceCenterId: 2,
        latitude: 9.123,
        longitude: 6.123,
        tariff: 100,
        meterNumber: "",
        isPPM: false,
        isMD: false,
        comment: "",
        band: "Band B",
        storedAverage: 0.02,
        totalMonthlyVend: 0,
        totalMonthlyDebt: 0,
        customerOutstandingDebtBalance: 0,
        salesRepUserId: 11,
        technicalEngineerUserId: 9,
      },
      {
        fullName: "Jane Doe",
        phoneNumber: "08012345678",
        email: "jane.doe@example.com",
        address: "12 Example Street, Kaduna",
        distributionSubstationId: 3,
        status: "ACTIVE",
        addressTwo: "",
        city: "Kaduna",
        state: "Kaduna",
        serviceCenterId: 4,
        latitude: 10.512,
        longitude: 7.345,
        tariff: 85,
        meterNumber: "12345678901",
        isPPM: true,
        isMD: false,
        comment: "High-usage customer",
        band: "Band A",
        storedAverage: 0.5,
        totalMonthlyVend: 10000,
        totalMonthlyDebt: 2000,
        customerOutstandingDebtBalance: 5000,
        salesRepUserId: 15,
        technicalEngineerUserId: 12,
      },
    ]

    let csvContent = headers.join(",") + "\n"
    exampleData.forEach((row) => {
      csvContent += headers.map((header) => String(row[header])).join(",") + "\n"
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
      formData.fullName.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.distributionSubstationId !== 0 &&
      formData.serviceCenterId !== 0 &&
      formData.band.trim() !== ""
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
                  disabled={createLoading}
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
                      ? !isFormValid() || createLoading
                      : csvData.length === 0 || csvErrors.length > 0 || createLoading
                  }
                  icon={<AddCustomerIcon />}
                  iconPosition="start"
                >
                  {activeTab === "single"
                    ? createLoading
                      ? "Adding Customer..."
                      : "Add Customer"
                    : createLoading
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
                    <form onSubmit={handleSingleSubmit} className="space-y-8">
                      {/* Section 1: Personal Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Personal Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the customer&apos;s personal and contact details
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormInputModule
                            label="Full Name"
                            name="fullName"
                            type="text"
                            placeholder="Enter full name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            error={formErrors.fullName}
                            required
                          />

                          <FormInputModule
                            label="Phone Number"
                            name="phoneNumber"
                            type="text"
                            placeholder="Enter phone number"
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
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            options={statusOptions}
                            error={formErrors.status}
                            required
                          />
                        </div>
                      </div>

                      {/* Section 2: Address Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Address Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the customer&apos;s address and location details
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <FormInputModule
                            label="Address Line 1"
                            name="address"
                            type="text"
                            placeholder="Enter address line 1"
                            value={formData.address}
                            onChange={handleInputChange}
                            error={formErrors.address}
                            required
                          />

                          <FormInputModule
                            label="Address Line 2"
                            name="addressTwo"
                            type="text"
                            placeholder="Enter address line 2 (optional)"
                            value={formData.addressTwo}
                            onChange={handleInputChange}
                          />

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormInputModule
                              label="City"
                              name="city"
                              type="text"
                              placeholder="Enter city"
                              value={formData.city}
                              onChange={handleInputChange}
                            />

                            <FormInputModule
                              label="State"
                              name="state"
                              type="text"
                              placeholder="Enter state"
                              value={formData.state}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormInputModule
                              label="Latitude"
                              name="latitude"
                              type="number"
                              placeholder="Enter latitude"
                              value={formData.latitude}
                              onChange={handleInputChange}
                              step="0.000001"
                            />

                            <FormInputModule
                              label="Longitude"
                              name="longitude"
                              type="number"
                              placeholder="Enter longitude"
                              value={formData.longitude}
                              onChange={handleInputChange}
                              step="0.000001"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Service Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Service Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the customer&apos;s service and distribution details
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormSelectModule
                            label="Distribution Substation"
                            name="distributionSubstationId"
                            value={formData.distributionSubstationId}
                            onChange={handleInputChange}
                            options={distributionSubstationOptions}
                            error={formErrors.distributionSubstationId}
                            required
                            disabled={distributionSubstationsLoading}
                          />

                          <FormSelectModule
                            label="Service Center"
                            name="serviceCenterId"
                            value={formData.serviceCenterId}
                            onChange={handleInputChange}
                            options={serviceCenterOptions}
                            error={formErrors.serviceCenterId}
                            required
                            disabled={serviceStationsLoading}
                          />

                          <FormInputModule
                            label="Tariff"
                            name="tariff"
                            type="number"
                            placeholder="Enter tariff"
                            value={formData.tariff}
                            onChange={handleInputChange}
                            step="0.01"
                          />

                          <FormSelectModule
                            label="Band"
                            name="band"
                            value={formData.band}
                            onChange={handleInputChange}
                            options={bandOptions}
                            error={formErrors.band}
                            required
                          />
                        </div>

                        {distributionSubstationsLoading && (
                          <p className="text-sm text-gray-500">Loading distribution substations...</p>
                        )}
                        {distributionSubstationsError && (
                          <p className="text-sm text-red-500">
                            Error loading distribution substations: {distributionSubstationsError}
                          </p>
                        )}
                        {serviceStationsLoading && <p className="text-sm text-gray-500">Loading service centers...</p>}
                        {serviceStationsError && (
                          <p className="text-sm text-red-500">Error loading service centers: {serviceStationsError}</p>
                        )}
                      </div>

                      {/* Section 5: Financial Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Financial Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the customer&apos;s financial and billing details
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
                          <FormInputModule
                            label="Stored Average"
                            name="storedAverage"
                            type="number"
                            placeholder="Enter stored average"
                            value={formData.storedAverage}
                            onChange={handleInputChange}
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Section 6: Additional Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                          <p className="text-sm text-gray-600">Enter additional customer details and comments</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <FormInputModule
                            label="Comment"
                            name="comment"
                            type="text"
                            placeholder="Enter any comments or notes"
                            value={formData.comment}
                            onChange={handleInputChange}
                          />

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormSelectModule
                              label="Sales Representative"
                              name="salesRepUserId"
                              value={formData.salesRepUserId}
                              onChange={handleInputChange}
                              options={employeeOptions}
                              disabled={employeesLoading}
                            />

                            <FormSelectModule
                              label="Technical Engineer"
                              name="technicalEngineerUserId"
                              value={formData.technicalEngineerUserId}
                              onChange={handleInputChange}
                              options={employeeOptions}
                              disabled={employeesLoading}
                            />
                          </div>

                          {employeesLoading && <p className="text-sm text-gray-500">Loading employees...</p>}
                          {employeesError && (
                            <p className="text-sm text-red-500">Error loading employees: {employeesError}</p>
                          )}
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
                          disabled={createLoading}
                          type="button"
                        >
                          Reset
                        </ButtonModule>
                        <ButtonModule
                          variant="primary"
                          size="lg"
                          type="submit"
                          disabled={!isFormValid() || createLoading}
                        >
                          {createLoading ? "Adding Customer..." : "Add Customer"}
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
                              <ButtonModule variant="primary" onClick={handleBulkSubmit} disabled={createLoading}>
                                {createLoading ? "Processing..." : `Process ${csvData.length} Customers`}
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
                                  Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Phone
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Email
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Band
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {csvData.slice(0, 5).map((customer, index) => (
                                <tr key={index}>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {customer.fullName}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {customer.phoneNumber}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {customer.email}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{customer.band}</td>
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

export default AddCustomerPage
