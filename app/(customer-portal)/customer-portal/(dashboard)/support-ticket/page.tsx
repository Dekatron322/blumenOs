"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { BsCheckCircle, BsClock, BsExclamationCircle, BsEye, BsHeadset, BsPaperclip } from "react-icons/bs"
import { FaLightbulb, FaRegEnvelope, FaTicketAlt, FaUser } from "react-icons/fa"
import { MdOutlineAttachFile, MdOutlineCategory, MdOutlineSupportAgent } from "react-icons/md"
import { HiOutlineDocumentText } from "react-icons/hi"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"
import { notify } from "components/ui/Notification/Notification"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import type { AppDispatch } from "lib/redux/store"
import {
  getSupportCategories,
  getSupportTickets,
  raiseTicket,
  selectRaisedTicketData,
  selectRaiseTicketError,
  selectRaiseTicketLoading,
  selectRaiseTicketMessage,
  selectRaiseTicketSuccess,
  selectSupportCategoriesError,
  selectSupportCategoriesList,
  selectSupportCategoriesLoading,
  selectSupportCategoriesSuccess,
  selectSupportTicketsError,
  selectSupportTicketsList,
  selectSupportTicketsLoading,
  selectSupportTicketsSuccess,
} from "lib/redux/customersDashboardSlice"

// Interface for ticket categories from API
interface TicketCategory {
  id: number
  name: string
  description: string
  isActive: boolean
  icon?: React.ReactNode
}

interface RecentTicket {
  id: number
  reference: string
  title: string
  categoryName: string
  status: "Open" | "In-Progress" | "Resolved" | "Closed"
  createdAtUtc: string
  lastMessageAtUtc: string
}

// Helper function to get icon based on category name
const getCategoryIcon = (categoryName: string): React.ReactNode => {
  const name = categoryName.toLowerCase()
  if (name.includes("billing") || name.includes("payment")) {
    return <FaRegEnvelope className="text-blue-500" />
  }
  if (name.includes("meter")) {
    return <FaLightbulb className="text-green-500" />
  }
  if (name.includes("outage") || name.includes("power")) {
    return <BsExclamationCircle className="text-red-500" />
  }
  if (name.includes("connection") || name.includes("disconnection")) {
    return <MdOutlineSupportAgent className="text-purple-500" />
  }
  if (name.includes("account")) {
    return <FaUser className="text-amber-500" />
  }
  if (name.includes("technical") || name.includes("support")) {
    return <BsHeadset className="text-indigo-500" />
  }
  return <BsHeadset className="text-gray-500" />
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Open":
      return { backgroundColor: "#F3F4F6", color: "#374151", icon: <FaTicketAlt className="size-4" /> }
    case "In-Progress":
      return { backgroundColor: "#E0F2FE", color: "#0C4A6E", icon: <BsClock className="size-4" /> }
    case "Resolved":
      return { backgroundColor: "#D1FAE5", color: "#065F46", icon: <BsCheckCircle className="size-4" /> }
    case "Closed":
      return { backgroundColor: "#F3F4F6", color: "#6B7280", icon: <BsCheckCircle className="size-4" /> }
    default:
      return { backgroundColor: "#F3F4F6", color: "#374151", icon: <FaTicketAlt className="size-4" /> }
  }
}

const SupportTicket: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  // Redux state for support categories
  const supportCategories = useSelector(selectSupportCategoriesList)
  const isLoadingCategories = useSelector(selectSupportCategoriesLoading)
  const categoriesError = useSelector(selectSupportCategoriesError)
  const categoriesSuccess = useSelector(selectSupportCategoriesSuccess)

  // Redux state for raise ticket
  const isRaisingTicket = useSelector(selectRaiseTicketLoading)
  const raiseTicketError = useSelector(selectRaiseTicketError)
  const raiseTicketSuccess = useSelector(selectRaiseTicketSuccess)
  const raiseTicketMessage = useSelector(selectRaiseTicketMessage)
  const raisedTicketData = useSelector(selectRaisedTicketData)

  // Redux state for support tickets
  const supportTickets = useSelector(selectSupportTicketsList)
  const isLoadingTickets = useSelector(selectSupportTicketsLoading)
  const ticketsError = useSelector(selectSupportTicketsError)
  const ticketsSuccess = useSelector(selectSupportTicketsSuccess)

  // Form state (matching API structure)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([])

  // Fetch support categories and tickets on component mount
  useEffect(() => {
    dispatch(getSupportCategories())
    dispatch(getSupportTickets({ pageNumber: 1, pageSize: 10 }))
  }, [dispatch])

  // Transform API categories to include icon
  const ticketCategories: TicketCategory[] = supportCategories
    ? supportCategories.map((category) => ({
        ...category,
        icon: getCategoryIcon(category.name),
      }))
    : []

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
    return `TKT-${new Date().getFullYear()}-${timestamp}${random}`
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...filesArray])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const refreshTickets = () => {
    dispatch(getSupportTickets({ pageNumber: 1, pageSize: 10 }))
  }

  // Mock function to simulate file upload and return URLs
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    // In a real implementation, you would upload files to your server/cloud storage
    // and get back URLs. For now, we'll mock it with a delay to simulate upload
    return new Promise((resolve) => {
      setTimeout(() => {
        const urls = files.map(
          (file, index) => `https://example.com/uploads/ticket_${Date.now()}_${index}_${file.name}`
        )
        resolve(urls)
      }, 1000)
    })
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!selectedCategory) {
      notify("warning", "Please select a ticket category")
      return
    }

    if (!title.trim()) {
      notify("warning", "Please enter a title for your ticket")
      return
    }

    if (!message.trim()) {
      notify("warning", "Please describe your issue in detail")
      return
    }

    try {
      // Upload files if any
      let uploadedFileUrls: string[] = []
      if (attachments.length > 0) {
        uploadedFileUrls = await uploadFiles(attachments)
        setUploadedFileUrls(uploadedFileUrls)
      }

      // Prepare the request data matching API structure
      const ticketData = {
        categoryId: selectedCategory,
        title: title.trim(),
        message: message.trim(),
        fileUrls: uploadedFileUrls,
      }

      console.log("Submitting ticket data:", ticketData)

      // Dispatch the raiseTicket action
      const result = await dispatch(raiseTicket(ticketData))

      if (raiseTicket.fulfilled.match(result)) {
        // Success - set the ticket number from the response
        if (result.payload && result.payload.data) {
          setTicketNumber(result.payload.data.reference || generateTicketNumber())
        } else {
          setTicketNumber(generateTicketNumber())
        }
        setIsSubmitted(true)
        setCurrentStep(4) // Show success message
        // Refresh tickets list to show the newly created ticket
        refreshTickets()
      } else {
        // Error - show the error message
        notify("error", "Failed to raise ticket", {
          description: (result.payload as string) || "An error occurred while submitting your ticket",
        })
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
      notify("error", "Unexpected Error", {
        description: "An unexpected error occurred while raising the ticket",
      })
    }
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setTitle("")
    setMessage("")
    setAttachments([])
    setUploadedFileUrls([])
    setTicketNumber(null)
    setIsSubmitted(false)
    setCurrentStep(1)
  }

  const validateCurrentStep = () => {
    if (currentStep === 1 && !selectedCategory) {
      notify("warning", "Please select a ticket category before continuing")
      return false
    }

    if (currentStep === 2 && (!title.trim() || !message.trim())) {
      notify("warning", "Please fill in both title and message before continuing")
      return false
    }

    return true
  }

  const nextStep = () => {
    if (!validateCurrentStep()) return
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const submitForm = async () => {
    // Directly call the submit handler
    const formEvent = new Event("submit", { cancelable: true }) as any
    formEvent.preventDefault = () => {}
    await handleSubmitTicket(formEvent)
  }

  // STEP 1: Category Selection
  const renderCategorySelection = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <MdOutlineCategory className="text-blue-500" />
        Select Ticket Category
      </h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {isLoadingCategories ? (
          // Loading state
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex flex-col items-start rounded-lg border-2 border-gray-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-gray-300"></div>
                  <div className="h-4 w-24 rounded bg-gray-300"></div>
                </div>
                <div className="h-3 w-full rounded bg-gray-300"></div>
                <div className="mt-1 h-3 w-3/4 rounded bg-gray-300"></div>
              </div>
            </div>
          ))
        ) : categoriesError ? (
          // Error state
          <div className="col-span-full">
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center">
              <BsExclamationCircle className="mx-auto mb-2 size-8 text-red-500" />
              <p className="text-sm font-medium text-red-800">Failed to load support categories</p>
              <p className="text-xs text-red-600">{categoriesError}</p>
              <button
                type="button"
                onClick={() => dispatch(getSupportCategories())}
                className="mt-2 rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        ) : ticketCategories.length === 0 ? (
          // Empty state
          <div className="col-span-full">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
              <BsHeadset className="mx-auto mb-2 size-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-800">No support categories available</p>
              <p className="text-xs text-gray-600">Please check back later or contact support directly</p>
            </div>
          </div>
        ) : (
          // Categories loaded successfully
          ticketCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                selectedCategory === category.id
                  ? "border-[#004B23] bg-[#004B23]/5"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                {category.icon}
                <span className="font-semibold text-gray-800">{category.name}</span>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
              {!category.isActive && (
                <div className="mt-2">
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    Inactive
                  </span>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </motion.div>
  )

  // STEP 2: Title & Message
  const renderTitleAndMessage = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <HiOutlineDocumentText className="text-purple-500" />
        Ticket Details
      </h2>

      <div className="space-y-5">
        <div className="space-y-2">
          <FormInputModule
            label="Title"
            name="title"
            type="text"
            placeholder="Brief summary of your issue"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500">Keep it short and descriptive</p>
        </div>

        <div className="space-y-2">
          <FormTextAreaModule
            label="Message"
            name="message"
            placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or other relevant information..."
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            required
            rows={8}
          />
          <p className="text-xs text-gray-500">The more details you provide, the better we can assist you.</p>
        </div>

        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">
            💡 Tip: Include specific details like account numbers, meter numbers, dates, and any error messages to help
            us resolve your issue faster.
          </p>
        </div>
      </div>
    </motion.div>
  )

  // STEP 3: File Upload
  const renderFileUpload = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <MdOutlineAttachFile className="text-green-500" />
        Attach Files (Optional)
      </h2>

      <div className="space-y-5">
        <div className="rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
          <BsPaperclip className="mx-auto mb-3 size-10 text-gray-400" />
          <p className="mb-2 text-sm font-medium text-gray-700">Drag & drop files here or click to browse</p>
          <p className="mb-4 text-xs text-gray-500">Upload screenshots, documents, or photos related to your issue</p>

          <input type="file" id="file-upload" multiple onChange={handleFileUpload} className="hidden" />
          <label
            htmlFor="file-upload"
            className="inline-block cursor-pointer rounded-md bg-[#004B23] px-5 py-2 text-sm font-medium text-white hover:bg-[#003919]"
          >
            Browse Files
          </label>

          <p className="mt-3 text-xs text-gray-500">
            Maximum 5 files, 10MB each. Supported formats: PDF, JPG, PNG, DOC, DOCX
          </p>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Selected Files ({attachments.length})</h3>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <BsPaperclip className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                        {file.type?.split("/")?.[1]?.toUpperCase() || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            📎 File upload is optional. You can proceed without uploading any files.
          </p>
        </div>
      </div>
    </motion.div>
  )

  // STEP 4: Review
  const renderReview = () => {
    const selectedCategoryData = ticketCategories.find((cat) => cat.id === selectedCategory)

    return (
      <motion.div
        className="rounded-md border bg-white p-5 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <BsEye className="text-purple-500" />
          Review Your Ticket
        </h2>

        <div className="space-y-6">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Check className="size-4 text-green-500" />
              Please review your ticket details before submitting
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-2 text-sm font-medium text-gray-600">Category</h4>
                <div className="flex items-center gap-2">
                  {selectedCategoryData?.icon}
                  <p className="font-medium text-gray-800">{selectedCategoryData?.name || "Not selected"}</p>
                </div>
                {selectedCategoryData?.description && (
                  <p className="mt-1 text-xs text-gray-500">{selectedCategoryData.description}</p>
                )}
              </div>

              <div className="rounded-md border border-gray-200 p-4">
                <h4 className="mb-2 text-sm font-medium text-gray-600">Attachments</h4>
                <p className="font-medium text-gray-800">{attachments.length} file(s) attached</p>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((file, index) => (
                      <p key={index} className="truncate text-xs text-gray-500">
                        • {file.name} ({(file.size / 1024).toFixed(0)} KB)
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-600">Title</h4>
              <p className="font-medium text-gray-800">{title || "Not provided"}</p>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-600">Message</h4>
              <p className="whitespace-pre-wrap text-gray-800">{message || "Not provided"}</p>
            </div>

            <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">
                📋 Once submitted, our support team will review your ticket and contact you within 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const StepProgress = () => (
    <div className="mb-4 hidden sm:block">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 ${
                  step === currentStep
                    ? "border-[#004B23] bg-[#004B23] text-white"
                    : step < currentStep
                    ? "border-[#004B23] bg-[#004B23] text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step < currentStep ? <Check className="size-5" /> : step}
              </div>
              <span
                className={`mt-2 hidden text-xs font-medium md:block ${
                  step === currentStep ? "text-[#004B23]" : "text-gray-500"
                }`}
              >
                {step === 1 && "Category"}
                {step === 2 && "Details"}
                {step === 3 && "Files"}
                {step === 4 && "Review"}
              </span>
            </div>
            {step < 4 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  const MobileStepNavigation = () => (
    <div className="mb-4 rounded-lg bg-white p-3 shadow-sm sm:hidden">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Step {currentStep} of 4</div>
        <div className="text-xs text-gray-500">
          {currentStep === 1 && "Select category"}
          {currentStep === 2 && "Title & message"}
          {currentStep === 3 && "File upload"}
          {currentStep === 4 && "Review & submit"}
        </div>
      </div>
    </div>
  )

  const renderSuccessMessage = () => (
    <motion.div
      className="rounded-md border border-green-200 bg-green-50 p-6 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-green-100">
        <FaTicketAlt className="size-8 text-green-600" />
      </div>

      <h3 className="mb-2 text-xl font-bold text-green-800">Support Ticket Created Successfully!</h3>
      <p className="mb-4 text-sm text-green-700">
        Your support request has been submitted. Our team will contact you within the estimated response time.
      </p>

      <div className="mx-auto max-w-md space-y-3 rounded-md bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Ticket Number:</span>
          <span className="font-mono font-bold text-[#004B23]">{ticketNumber}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Category:</span>
          <span className="font-medium text-gray-800">
            {ticketCategories.find((c) => c.id === selectedCategory)?.name || "Not specified"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Attachments:</span>
          <span className="font-medium text-gray-800">{attachments.length} file(s)</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            ✉️ You&apos;ll receive a confirmation email with your ticket details. Keep your ticket number for reference.
          </p>
        </div>

        <div className="flex gap-3">
          <ButtonModule type="button" variant="secondary" className="w-full" onClick={resetForm}>
            Create Another Ticket
          </ButtonModule>
          <ButtonModule
            type="button"
            variant="primary"
            className="w-full"
            onClick={() => alert(`Tracking ticket: ${ticketNumber}`)}
          >
            Track This Ticket
          </ButtonModule>
        </div>
      </div>
    </motion.div>
  )

  const renderRecentTickets = () => (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Recent Tickets</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{supportTickets ? supportTickets.length : 0}</span>
          <button
            onClick={() => router.push("/customer-portal/all-support-ticket")}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
            title="View All Tickets"
          >
            <ArrowLeft className="size-3 rotate-180" />
          </button>
        </div>
      </div>

      {isLoadingTickets ? (
        <div className="flex justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border border-gray-300 border-t-gray-600"></div>
        </div>
      ) : ticketsError ? (
        <div className="text-xs text-red-600">{ticketsError}</div>
      ) : !supportTickets || supportTickets.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-500">No tickets</p>
        </div>
      ) : (
        <div className="space-y-2">
          {supportTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="cursor-pointer rounded-md border-b border-gray-100 p-2 pb-2 transition-colors last:border-b-0 hover:bg-gray-50"
              onClick={() => router.push(`/customer-portal/all-support-ticket/${ticket.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">{ticket.reference}</p>
                  <p className="truncate text-xs text-gray-600">{ticket.title}</p>
                </div>
                <span
                  className="ml-2 rounded px-2 py-1 text-xs"
                  style={{
                    backgroundColor:
                      ticket.status === "Open"
                        ? "#FEF3C7"
                        : ticket.status === "In-Progress"
                        ? "#DBEAFE"
                        : ticket.status === "Resolved"
                        ? "#D1FAE5"
                        : "#F3F4F6",
                    color:
                      ticket.status === "Open"
                        ? "#92400E"
                        : ticket.status === "In-Progress"
                        ? "#1E40AF"
                        : ticket.status === "Resolved"
                        ? "#065F46"
                        : "#6B7280",
                  }}
                >
                  {ticket.status}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span>{ticket.categoryName}</span>
                <span>•</span>
                <span>{new Date(ticket.createdAtUtc).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderSupportInfo = () => (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-900">Support Options</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-xs font-medium text-gray-900">Phone</p>
            <p className="text-xs text-gray-600">0700-POWER-NG</p>
          </div>
          <span className="text-xs text-gray-500">8AM-6PM</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-xs font-medium text-gray-900">Email</p>
            <p className="text-xs text-gray-600">support@powerutility.ng</p>
          </div>
          <span className="text-xs text-gray-500">24h response</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-xs font-medium text-gray-900">Live Chat</p>
            <p className="text-xs text-gray-600">Website & App</p>
          </div>
          <span className="text-xs text-gray-500">Business hours</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-xs font-medium text-gray-900">Self-Service</p>
            <p className="text-xs text-gray-600">Knowledge base</p>
          </div>
          <span className="text-xs text-gray-500">24/7</span>
        </div>
      </div>
    </div>
  )

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <CustomerDashboardNav />
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 py-4 lg:container sm:px-4 md:px-6 xl:px-16">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Raise Support Ticket</h1>
                <p className="text-sm text-gray-600">
                  Get help with billing, technical issues, service requests, and more.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2">
                <BsClock className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Average Resolution Time: <span className="font-bold">2.5 days</span>
                </span>
              </div>
            </div>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-4">
              {/* Left Column - Form Steps */}
              <div className="space-y-6 lg:col-span-3">
                <StepProgress />
                <MobileStepNavigation />

                <form onSubmit={handleSubmitTicket} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && renderCategorySelection()}
                    {currentStep === 2 && renderTitleAndMessage()}
                    {currentStep === 3 && renderFileUpload()}
                    {currentStep === 4 && (isSubmitted ? renderSuccessMessage() : renderReview())}
                  </AnimatePresence>

                  {!isSubmitted && (
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                      <div className="flex gap-3">
                        {currentStep > 1 && (
                          <ButtonModule
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={prevStep}
                            disabled={isRaisingTicket}
                            icon={<ArrowLeft />}
                            iconPosition="start"
                          >
                            Previous
                          </ButtonModule>
                        )}

                        <ButtonModule
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={resetForm}
                          disabled={isRaisingTicket}
                        >
                          Reset
                        </ButtonModule>
                      </div>

                      <div className="flex gap-3 sm:justify-end">
                        {currentStep < 4 ? (
                          <ButtonModule
                            type="button"
                            variant="primary"
                            className="w-full sm:w-auto"
                            onClick={nextStep}
                            disabled={isRaisingTicket}
                            icon={<ArrowRight />}
                            iconPosition="end"
                          >
                            {currentStep === 3 ? "Review" : "Next"}
                          </ButtonModule>
                        ) : (
                          <ButtonModule
                            type="button"
                            variant="primary"
                            className="w-full sm:w-auto"
                            onClick={submitForm}
                            disabled={isRaisingTicket || !selectedCategory || !title.trim() || !message.trim()}
                          >
                            {isRaisingTicket ? "Creating Ticket..." : "Submit Support Ticket"}
                          </ButtonModule>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column - Recent Tickets & Support Info */}
              <div className="space-y-6">
                {renderRecentTickets()}
                {renderSupportInfo()}
              </div>
            </div>

            {/* Information Section */}
            <div className="mt-8 rounded-md border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Support Ticket Process</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <span className="font-bold">1</span>
                  </div>
                  <h3 className="mb-1 font-medium text-blue-800">Category</h3>
                  <p className="text-xs text-blue-700">Select the type of issue you&apos;re experiencing</p>
                </div>

                <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <span className="font-bold">2</span>
                  </div>
                  <h3 className="mb-1 font-medium text-amber-800">Details</h3>
                  <p className="text-xs text-amber-700">Provide title and detailed description</p>
                </div>

                <div className="rounded-md border border-purple-100 bg-purple-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <span className="font-bold">3</span>
                  </div>
                  <h3 className="mb-1 font-medium text-purple-800">Files</h3>
                  <p className="text-xs text-purple-700">Optionally upload supporting documents</p>
                </div>

                <div className="rounded-md border border-green-100 bg-green-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <span className="font-bold">4</span>
                  </div>
                  <h3 className="mb-1 font-medium text-green-800">Submit</h3>
                  <p className="text-xs text-green-700">Review and submit your ticket</p>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800">What to Expect After Submitting:</p>
                <ul className="ml-5 mt-2 list-disc space-y-1 text-sm text-gray-600">
                  <li>Immediate confirmation with your ticket number</li>
                  <li>Email/SMS updates at each stage of the process</li>
                  <li>Response within 24-48 hours for most issues</li>
                  <li>Ability to track ticket status using your ticket number</li>
                  <li>Option to add additional information or clarify details</li>
                  <li>Follow-up survey after resolution to rate our service</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SupportTicket
