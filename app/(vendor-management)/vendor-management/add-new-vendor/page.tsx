"use client"
import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddAgentIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { createBulkVendors } from "lib/redux/vendorSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const { bulkCreateLoading, bulkCreateError, bulkCreateSuccess, createdVendors } = useAppSelector(
    (state) => state.vendors
  )
  const { employees, employeesLoading } = useAppSelector((state) => state.employee)

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVVendor[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
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

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}

    switch (currentStep) {
      case 1: // Basic Information
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
        break

      case 2: // Location & Services
        if (!formData.address.trim()) {
          errors.address = "Address is required"
        }
        if (!formData.city.trim()) {
          errors.city = "City is required"
        }
        if (!formData.state) {
          errors.state = "State is required"
        }
        break

      case 3: // Commission & Assignment
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
    await submitSingleVendor()
  }

  const submitSingleVendor = async () => {
    if (!validateCurrentStep()) {
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
        setCurrentStep(1)
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
    setCurrentStep(1)
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
          {currentStep === 2 && "Location"}
          {currentStep === 3 && "Commission"}
        </div>
      </div>
    </div>
  )

  // Mobile Sidebar Component
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
                  <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
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
                    { step: 1, title: "Basic Information", description: "Vendor contact and identification details" },
                    { step: 2, title: "Location & Services", description: "Address and service capabilities" },
                    {
                      step: 3,
                      title: "Commission & Assignment",
                      description: "Commission rates and employee assignment",
                    },
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
                    disabled={isSubmitting || bulkCreateLoading}
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

  // Step progress component
  const StepProgress = () => (
    <div className="mb-8">
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
                {step === 2 && "Location"}
                {step === 3 && "Commission"}
              </span>
            </div>
            {step < 3 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
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
              disabled={isSubmitting || bulkCreateLoading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting || bulkCreateLoading}
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
              disabled={isSubmitting || bulkCreateLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submitSingleVendor()}
              disabled={!isFormValid() || isSubmitting || bulkCreateLoading}
              className="flex items-center gap-1 rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Vendor"}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4  xl:px-16">
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
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Register New Vendor</h1>
                    <p className="text-sm text-gray-600">Add a new vendor to the system</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isSubmitting || bulkCreateLoading}
                  >
                    Reset Form
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (activeTab === "single") {
                        void submitSingleVendor()
                      } else {
                        void handleBulkSubmit()
                      }
                    }}
                    disabled={
                      activeTab === "single"
                        ? !isFormValid() || isSubmitting || bulkCreateLoading
                        : csvData.length === 0 || csvErrors.length > 0 || bulkCreateLoading
                    }
                  >
                    {activeTab === "single"
                      ? isSubmitting
                        ? "Adding..."
                        : "Add Vendor"
                      : bulkCreateLoading
                      ? "Processing..."
                      : `Process ${csvData.length} Vendors`}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Mobile Optimized */}
            <div className="mb-4">
              <div className="rounded-lg border border-gray-200 bg-white sm:rounded-t-lg">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("single")}
                    className={`flex-1 rounded-l-lg px-4 py-3 text-sm font-medium transition-colors sm:rounded-tl-lg sm:px-6 sm:py-4 ${
                      activeTab === "single"
                        ? "border-b-2 border-blue-500 bg-blue-50 text-blue-600 sm:border-b-0 sm:bg-transparent"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Single Entry
                  </button>
                  <button
                    onClick={() => setActiveTab("bulk")}
                    className={`flex-1 rounded-r-lg px-4 py-3 text-sm font-medium transition-colors sm:rounded-tr-lg sm:px-6 sm:py-4 ${
                      activeTab === "bulk"
                        ? "border-b-2 border-blue-500 bg-blue-50 text-blue-600 sm:border-b-0 sm:bg-transparent"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Bulk Upload (CSV)
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Step Navigation */}
            {activeTab === "single" && <MobileStepNavigation />}

            {/* Mobile Step Sidebar */}
            {activeTab === "single" && <MobileStepSidebar />}

            {/* Main Content Area */}
            <div className="w-full">
              {activeTab === "single" ? (
                /* Single Entry Form */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg bg-white p-4 shadow-sm sm:rounded-b-lg sm:p-6"
                >
                  {/* Form Header */}
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Vendor Information</h3>
                    <p className="text-sm text-gray-600">Fill in all required fields to register a new vendor</p>
                  </div>

                  {/* Desktop Step Progress */}
                  <div className="hidden sm:block">
                    <StepProgress />
                  </div>

                  {/* Vendor Form */}
                  <form onSubmit={handleSingleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {/* Step 1: Basic Information */}
                      {currentStep === 1 && (
                        <motion.div
                          key="step-1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4 rounded-lg bg-[#F9F9F9] p-4 sm:space-y-6 sm:p-6"
                        >
                          <div className="border-b pb-3">
                            <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                            <p className="text-sm text-gray-600">
                              Enter the vendor&apos;s contact and identification details
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
                        </motion.div>
                      )}

                      {/* Step 2: Location & Services */}
                      {currentStep === 2 && (
                        <motion.div
                          key="step-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4 rounded-lg bg-[#F9F9F9] p-4 sm:space-y-6 sm:p-6"
                        >
                          <div className="border-b pb-3">
                            <h4 className="text-lg font-medium text-gray-900">Location & Services</h4>
                            <p className="text-sm text-gray-600">
                              Enter the vendor&apos;s address and service capabilities
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
                        </motion.div>
                      )}

                      {/* Step 3: Commission & Assignment */}
                      {currentStep === 3 && (
                        <motion.div
                          key="step-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4 rounded-lg bg-[#F9F9F9] p-4 sm:space-y-6 sm:p-6"
                        >
                          <div className="border-b pb-3">
                            <h4 className="text-lg font-medium text-gray-900">Commission & Assignment</h4>
                            <p className="text-sm text-gray-600">Configure commission rates and assign employees</p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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

                            <div className="sm:col-span-2">
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
                            size="lg"
                            onClick={prevStep}
                            disabled={isSubmitting || bulkCreateLoading}
                            type="button"
                            icon={<ArrowLeftIcon />}
                            iconPosition="start"
                          >
                            Previous
                          </ButtonModule>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <ButtonModule
                          variant="dangerSecondary"
                          size="lg"
                          onClick={handleReset}
                          disabled={isSubmitting || bulkCreateLoading}
                          type="button"
                        >
                          Reset
                        </ButtonModule>

                        {currentStep < 3 ? (
                          <ButtonModule
                            variant="primary"
                            size="lg"
                            onClick={nextStep}
                            type="button"
                            icon={<ArrowRightIcon />}
                            iconPosition="end"
                          >
                            Next
                          </ButtonModule>
                        ) : (
                          <ButtonModule
                            variant="primary"
                            size="lg"
                            type="submit"
                            disabled={!isFormValid() || isSubmitting || bulkCreateLoading}
                          >
                            {isSubmitting ? "Adding Vendor..." : "Add Vendor"}
                          </ButtonModule>
                        )}
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* Bulk Upload Section */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg bg-white p-4 shadow-sm sm:rounded-b-lg sm:p-6"
                >
                  {/* Template Download */}
                  <div className="mb-6 rounded-lg bg-blue-50 p-4">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                        <p className="text-sm text-blue-600">Download our CSV template to ensure proper formatting</p>
                      </div>
                      <ButtonModule variant="primary" size="sm" onClick={downloadTemplate} className="w-full sm:w-auto">
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
                              disabled={bulkCreateLoading}
                              className="w-full sm:w-auto"
                            >
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
                        <h3 className="text-sm font-medium text-gray-900">Preview ({csvData.length} valid records)</h3>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 sm:px-4">
                                BlumenPay ID
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 sm:px-4">
                                Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 sm:px-4">
                                Phone
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 sm:px-4">
                                Commission
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {csvData.slice(0, 5).map((vendor, index) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 sm:px-4">
                                  {vendor.blumenpayId}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 sm:px-4">
                                  {vendor.name}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 sm:px-4">
                                  {vendor.phoneNumber}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 sm:px-4">
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

                  {/* Bulk Upload Actions */}
                  <div className="mt-6 flex flex-col gap-4 sm:hidden">
                    <ButtonModule
                      variant="outline"
                      onClick={() => {
                        setCsvFile(null)
                        setCsvData([])
                        setCsvErrors([])
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                      disabled={bulkCreateLoading}
                    >
                      Clear CSV
                    </ButtonModule>
                    {csvErrors.length === 0 && csvData.length > 0 && (
                      <ButtonModule variant="primary" onClick={handleBulkSubmit} disabled={bulkCreateLoading}>
                        {bulkCreateLoading ? "Processing..." : `Process ${csvData.length} Vendors`}
                      </ButtonModule>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation for Single Entry Form */}
      {activeTab === "single" && <MobileBottomNavigation />}
    </section>
  )
}

export default AddNewVendor
