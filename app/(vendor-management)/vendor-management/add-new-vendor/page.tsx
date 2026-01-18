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
import { VscArrowLeft, VscArrowRight } from "react-icons/vsc"

interface VendorFormData {
  name: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  canProcessPostpaid: boolean
  canProcessPrepaid: boolean
  posCollectionAllowed: boolean
  urbanCommissionPercent: number
  ruralCommissionPercent: number
  employeeUserId: number
  documentUrls: string[]
  webhookUrl: string
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    canProcessPostpaid: false,
    canProcessPrepaid: false,
    posCollectionAllowed: false,
    urbanCommissionPercent: 0,
    ruralCommissionPercent: 0,
    employeeUserId: 0,
    documentUrls: [],
    webhookUrl: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    { value: "Abia", label: "Abia" },
    { value: "Adamawa", label: "Adamawa" },
    { value: "Akwa Ibom", label: "Akwa Ibom" },
    { value: "Anambra", label: "Anambra" },
    { value: "Bauchi", label: "Bauchi" },
    { value: "Bayelsa", label: "Bayelsa" },
    { value: "Benue", label: "Benue" },
    { value: "Borno", label: "Borno" },
    { value: "Cross River", label: "Cross River" },
    { value: "Delta", label: "Delta" },
    { value: "Ebonyi", label: "Ebonyi" },
    { value: "Edo", label: "Edo" },
    { value: "Ekiti", label: "Ekiti" },
    { value: "Enugu", label: "Enugu" },
    { value: "FCT", label: "Federal Capital Territory" },
    { value: "Gombe", label: "Gombe" },
    { value: "Imo", label: "Imo" },
    { value: "Jigawa", label: "Jigawa" },
    { value: "Kaduna", label: "Kaduna" },
    { value: "Kano", label: "Kano" },
    { value: "Katsina", label: "Katsina" },
    { value: "Kebbi", label: "Kebbi" },
    { value: "Kogi", label: "Kogi" },
    { value: "Kwara", label: "Kwara" },
    { value: "Lagos", label: "Lagos" },
    { value: "Nasarawa", label: "Nasarawa" },
    { value: "Niger", label: "Niger" },
    { value: "Ogun", label: "Ogun" },
    { value: "Ondo", label: "Ondo" },
    { value: "Osun", label: "Osun" },
    { value: "Oyo", label: "Oyo" },
    { value: "Plateau", label: "Plateau" },
    { value: "Rivers", label: "Rivers" },
    { value: "Sokoto", label: "Sokoto" },
    { value: "Taraba", label: "Taraba" },
    { value: "Yobe", label: "Yobe" },
    { value: "Zamfara", label: "Zamfara" },
  ]

  const commissionOptions = [
    { value: "0", label: "Select commission rate" },
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

    let normalizedValue: string | number | boolean = value as string
    if (name === "canProcessPostpaid" || name === "canProcessPrepaid" || name === "posCollectionAllowed") {
      normalizedValue = value === "true"
    } else if (name === "urbanCommissionPercent" || name === "ruralCommissionPercent" || name === "employeeUserId") {
      normalizedValue = parseFloat(value as string) || 0
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
        if (formData.urbanCommissionPercent <= 0) {
          errors.urbanCommissionPercent = "Urban commission rate must be greater than 0"
        }
        if (formData.ruralCommissionPercent <= 0) {
          errors.ruralCommissionPercent = "Rural commission rate must be greater than 0"
        }
        if (!formData.employeeUserId || formData.employeeUserId <= 0) {
          errors.employeeUserId = "Employee User ID is required and must be greater than 0"
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
            blumenpayId: "", // Generate or set this as needed
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            canProcessPostpaid: formData.canProcessPostpaid,
            canProcessPrepaid: formData.canProcessPrepaid,
            posCollectionAllowed: false, // Set default value as needed
            urbanCommissionPercent: formData.urbanCommissionPercent,
            ruralCommissionPercent: formData.ruralCommissionPercent || 0, // Set default value as needed
            employeeUserId: formData.employeeUserId,
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
          name: "",
          phoneNumber: "",
          email: "",
          address: "",
          city: "",
          state: "",
          canProcessPostpaid: false,
          canProcessPrepaid: false,
          posCollectionAllowed: false,
          urbanCommissionPercent: 0,
          ruralCommissionPercent: 0,
          employeeUserId: 0,
          documentUrls: [],
          webhookUrl: "",
        })
        setFormErrors({})
        setCurrentStep(1)
        setUploadedFiles([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
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
      name: "",
      phoneNumber: "",
      email: "",
      address: "",
      city: "",
      state: "",
      canProcessPostpaid: false,
      canProcessPrepaid: false,
      posCollectionAllowed: false,
      urbanCommissionPercent: 0,
      ruralCommissionPercent: 0,
      employeeUserId: 0,
      documentUrls: [],
      webhookUrl: "",
    })
    setFormErrors({})
    setCurrentStep(1)
    setUploadedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isFormValid = (): boolean => {
    return (
      formData.name.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state !== "" &&
      formData.urbanCommissionPercent > 0 &&
      formData.ruralCommissionPercent > 0 &&
      formData.employeeUserId > 0
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

  // File upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ]
      const isValidType = validTypes.includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB

      if (!isValidType) {
        notify("error", `Invalid file type: ${file.name}`, {
          description: "Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed",
          duration: 4000,
        })
        return false
      }

      if (!isValidSize) {
        notify("error", `File too large: ${file.name}`, {
          description: "Maximum file size is 10MB",
          duration: 4000,
        })
        return false
      }

      return true
    })

    const newFiles = [...uploadedFiles, ...validFiles]
    setUploadedFiles(newFiles)

    // Update form data with file names (you might want to upload files and get URLs)
    const fileNames = newFiles.map((file) => file.name)
    setFormData((prev) => ({
      ...prev,
      documentUrls: fileNames,
    }))
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)

    const fileNames = newFiles.map((file) => file.name)
    setFormData((prev) => ({
      ...prev,
      documentUrls: fileNames,
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
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 lg:px-6  2xl:px-16">
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
                    onClick={() => void submitSingleVendor()}
                    disabled={!isFormValid() || isSubmitting || bulkCreateLoading}
                  >
                    {isSubmitting ? "Adding..." : "Add Vendor"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Mobile Step Navigation */}
            <MobileStepNavigation />

            {/* Mobile Step Sidebar */}
            <MobileStepSidebar />

            {/* Main Content Area */}
            <div className="w-full">
              {/* Single Entry Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className=" bg-white p-4 shadow-sm sm:rounded-b-lg sm:p-6"
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

                          <FormSelectModule
                            label="POS Collection Allowed"
                            name="posCollectionAllowed"
                            value={formData.posCollectionAllowed.toString()}
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
                            label="Urban Commission (%)"
                            name="urbanCommissionPercent"
                            value={formData.urbanCommissionPercent.toString()}
                            onChange={handleInputChange}
                            options={commissionOptions}
                            error={formErrors.urbanCommissionPercent}
                            required
                          />

                          <FormSelectModule
                            label="Rural Commission (%)"
                            name="ruralCommissionPercent"
                            value={formData.ruralCommissionPercent.toString()}
                            onChange={handleInputChange}
                            options={commissionOptions}
                            error={formErrors.ruralCommissionPercent}
                            required
                          />

                          <FormSelectModule
                            label="Employee User ID"
                            name="employeeUserId"
                            value={formData.employeeUserId.toString()}
                            onChange={handleInputChange}
                            options={employeeOptions}
                            error={formErrors.employeeUserId}
                            required
                          />

                          <FormInputModule
                            label="Webhook URL"
                            name="webhookUrl"
                            type="url"
                            placeholder="https://example.com/webhook"
                            value={formData.webhookUrl}
                            onChange={handleInputChange}
                          />

                          <div className="sm:col-span-2">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">Document Upload</label>
                              <div
                                className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                  isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                              >
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  multiple
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={handleFileSelect}
                                  className="absolute inset-0 cursor-pointer opacity-0"
                                />
                                <div className="flex flex-col items-center space-y-2">
                                  <svg
                                    className="h-10 w-10 text-gray-400"
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
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium text-blue-600 hover:text-blue-500">
                                      Click to upload
                                    </span>{" "}
                                    or drag and drop
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB each
                                  </p>
                                </div>
                              </div>

                              {uploadedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                                  <div className="space-y-1">
                                    {uploadedFiles.map((file, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm"
                                      >
                                        <span className="truncate">{file.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => removeFile(index)}
                                          className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                          <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
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
                          size="md"
                          onClick={prevStep}
                          disabled={isSubmitting || bulkCreateLoading}
                          type="button"
                          icon={<VscArrowLeft />}
                          iconPosition="start"
                        >
                          Previous
                        </ButtonModule>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <ButtonModule
                        variant="dangerSecondary"
                        size="md"
                        onClick={handleReset}
                        disabled={isSubmitting || bulkCreateLoading}
                        type="button"
                      >
                        Reset
                      </ButtonModule>

                      {currentStep < 3 ? (
                        <ButtonModule
                          variant="primary"
                          size="md"
                          onClick={nextStep}
                          type="button"
                          icon={<VscArrowRight />}
                          iconPosition="end"
                        >
                          Next
                        </ButtonModule>
                      ) : (
                        <ButtonModule
                          variant="primary"
                          size="md"
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
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation for Single Entry Form */}
      <MobileBottomNavigation />
    </section>
  )
}

export default AddNewVendor
