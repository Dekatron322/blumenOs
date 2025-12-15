"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { BsHeadset, BsCalendar, BsClock, BsPaperclip, BsExclamationCircle, BsCheckCircle } from "react-icons/bs"
import { FaTicketAlt, FaRegCommentDots, FaRegEnvelope, FaPhone, FaUser, FaLightbulb } from "react-icons/fa"
import { MdOutlinePriorityHigh, MdOutlineAttachFile, MdOutlineCategory, MdOutlineSupportAgent } from "react-icons/md"
import { HiOutlineDocumentText } from "react-icons/hi"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"

// Mock data for ticket categories
interface TicketCategory {
  id: number
  name: string
  description: string
  icon: React.ReactNode
  responseTime: string
}

interface PriorityLevel {
  id: number
  name: string
  description: string
  color: string
  responseTime: string
}

interface RecentTicket {
  id: number
  ticketNumber: string
  subject: string
  category: string
  status: "open" | "in-progress" | "resolved" | "closed"
  createdAt: string
  lastUpdate: string
}

const ticketCategories: TicketCategory[] = [
  {
    id: 1,
    name: "Billing & Payments",
    description: "Questions about bills, payments, or charges",
    icon: <FaRegEnvelope className="text-blue-500" />,
    responseTime: "24 hours",
  },
  {
    id: 2,
    name: "Meter Issues",
    description: "Problems with meter reading, faults, or replacement",
    icon: <FaLightbulb className="text-green-500" />,
    responseTime: "48 hours",
  },
  {
    id: 3,
    name: "Outage & Power Quality",
    description: "Report outages, voltage fluctuations, or power quality issues",
    icon: <BsExclamationCircle className="text-red-500" />,
    responseTime: "4 hours",
  },
  {
    id: 4,
    name: "Connection & Disconnection",
    description: "New connections, reconnections, or disconnections",
    icon: <MdOutlineSupportAgent className="text-purple-500" />,
    responseTime: "72 hours",
  },
  {
    id: 5,
    name: "Account Management",
    description: "Update account details, change tariff, or transfer service",
    icon: <FaUser className="text-amber-500" />,
    responseTime: "48 hours",
  },
  {
    id: 6,
    name: "Technical Support",
    description: "Technical issues with online services or mobile app",
    icon: <BsHeadset className="text-indigo-500" />,
    responseTime: "12 hours",
  },
]

const priorityLevels: PriorityLevel[] = [
  {
    id: 1,
    name: "Low",
    description: "General inquiries, non-urgent matters",
    color: "bg-green-100 text-green-800",
    responseTime: "3 business days",
  },
  {
    id: 2,
    name: "Medium",
    description: "Issues affecting service but not critical",
    color: "bg-blue-100 text-blue-800",
    responseTime: "24 hours",
  },
  {
    id: 3,
    name: "High",
    description: "Service disruption or billing errors",
    color: "bg-amber-100 text-amber-800",
    responseTime: "12 hours",
  },
  {
    id: 4,
    name: "Urgent",
    description: "Safety issues or complete service loss",
    color: "bg-red-100 text-red-800",
    responseTime: "4 hours",
  },
]

const recentTickets: RecentTicket[] = [
  {
    id: 1,
    ticketNumber: "TKT-2024-00123",
    subject: "Incorrect billing amount for January",
    category: "Billing & Payments",
    status: "resolved",
    createdAt: "2024-01-15 09:30",
    lastUpdate: "2024-01-16 14:45",
  },
  {
    id: 2,
    ticketNumber: "TKT-2024-00145",
    subject: "Meter not displaying readings",
    category: "Meter Issues",
    status: "in-progress",
    createdAt: "2024-01-14 15:20",
    lastUpdate: "2024-01-15 11:30",
  },
  {
    id: 3,
    ticketNumber: "TKT-2024-00167",
    subject: "Request for tariff change",
    category: "Account Management",
    status: "open",
    createdAt: "2024-01-13 10:15",
    lastUpdate: "2024-01-13 10:15",
  },
]

const getStatusStyle = (status: string) => {
  switch (status) {
    case "open":
      return { backgroundColor: "#F3F4F6", color: "#374151", icon: <FaTicketAlt className="size-4" /> }
    case "in-progress":
      return { backgroundColor: "#E0F2FE", color: "#0C4A6E", icon: <BsClock className="size-4" /> }
    case "resolved":
      return { backgroundColor: "#D1FAE5", color: "#065F46", icon: <BsCheckCircle className="size-4" /> }
    case "closed":
      return { backgroundColor: "#F3F4F6", color: "#6B7280", icon: <BsCheckCircle className="size-4" /> }
    default:
      return { backgroundColor: "#F3F4F6", color: "#374151", icon: <FaTicketAlt className="size-4" /> }
  }
}

const SupportTicket: React.FC = () => {
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null)
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [contactPreference, setContactPreference] = useState<"email" | "phone" | "both">("email")
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [estimatedResponseTime, setEstimatedResponseTime] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Logged in customer info
  const customerInfo = {
    name: "John Smith",
    accountNumber: "ACC00123456",
    email: "john.smith@example.com",
    phoneNumber: "+2348012345678",
    address: "123 Main Street, Ikeja, Lagos",
  }

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

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory) {
      alert("Please select a ticket category")
      return
    }

    if (!selectedPriority) {
      alert("Please select a priority level")
      return
    }

    if (!subject.trim()) {
      alert("Please enter a subject for your ticket")
      return
    }

    if (!description.trim()) {
      alert("Please describe your issue in detail")
      return
    }

    setIsSubmitting(true)

    // Simulate API delay
    setTimeout(() => {
      const newTicketNumber = generateTicketNumber()
      const selectedCategoryObj = ticketCategories.find((cat) => cat.id === selectedCategory)
      const selectedPriorityObj = priorityLevels.find((pri) => pri.id === selectedPriority)

      setTicketNumber(newTicketNumber)
      setEstimatedResponseTime(selectedPriorityObj?.responseTime || "24 hours")
      setIsSubmitted(true)
      setIsSubmitting(false)
      setCurrentStep(3)
    }, 2000)
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setSelectedPriority(null)
    setSubject("")
    setDescription("")
    setAttachments([])
    setContactPreference("email")
    setTicketNumber(null)
    setIsSubmitted(false)
    setEstimatedResponseTime(null)
    setCurrentStep(1)
  }

  const validateCurrentStep = () => {
    if (currentStep === 1 && !selectedCategory) {
      alert("Please select a ticket category before continuing")
      return false
    }

    if (currentStep === 2 && !selectedPriority) {
      alert("Please select a priority level before continuing")
      return false
    }

    return true
  }

  const nextStep = () => {
    if (!validateCurrentStep()) return

    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ticketCategories.map((category) => (
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
            <div className="mb-3 flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                {category.icon}
                <span className="font-semibold text-gray-800">{category.name}</span>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{category.responseTime}</span>
            </div>
            <p className="text-sm text-gray-600">{category.description}</p>
          </button>
        ))}
      </div>
    </motion.div>
  )

  const renderPrioritySelection = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <MdOutlinePriorityHigh className="text-red-500" />
        Select Priority Level
      </h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {priorityLevels.map((priority) => (
          <button
            key={priority.id}
            type="button"
            onClick={() => setSelectedPriority(priority.id)}
            className={`flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all duration-200 ${
              selectedPriority === priority.id
                ? "border-[#004B23] bg-[#004B23]/5"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
            }`}
          >
            <div className="mb-2 flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${priority.color}`}>{priority.name}</span>
              </div>
              {priority.id === 4 && <MdOutlinePriorityHigh className="text-red-500" />}
            </div>
            <p className="mb-2 text-sm text-gray-600">{priority.description}</p>
            <p className="text-xs font-medium text-gray-700">
              Response Time: <span className="font-bold">{priority.responseTime}</span>
            </p>
          </button>
        ))}
      </div>
    </motion.div>
  )

  const renderTicketForm = () => (
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormInputModule
              label="Subject"
              name="subject"
              type="text"
              placeholder="Brief summary of your issue"
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <BsHeadset /> Preferred Contact Method
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setContactPreference("email")}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  contactPreference === "email"
                    ? "border-[#004B23] bg-[#004B23]/5 text-[#004B23]"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setContactPreference("phone")}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  contactPreference === "phone"
                    ? "border-[#004B23] bg-[#004B23]/5 text-[#004B23]"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => setContactPreference("both")}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  contactPreference === "both"
                    ? "border-[#004B23] bg-[#004B23]/5 text-[#004B23]"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Both
              </button>
            </div>
          </div>

          <div className="col-span-1 space-y-2 md:col-span-2">
            <FormTextAreaModule
              label="Description"
              name="description"
              placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or other relevant information..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              required
              rows={8}
            />
            <p className="text-xs text-gray-500">The more details you provide, the better we can assist you.</p>
          </div>

          <div className="col-span-1 space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MdOutlineAttachFile /> Attachments (Optional)
            </label>
            <div className="rounded-md border-2 border-dashed border-gray-300 p-4">
              <div className="text-center">
                <BsPaperclip className="mx-auto mb-2 size-8 text-gray-400" />
                <p className="mb-2 text-sm text-gray-600">Drag & drop files here or click to browse</p>
                <input type="file" id="file-upload" multiple onChange={handleFileUpload} className="hidden" />
                <label
                  htmlFor="file-upload"
                  className="inline-block cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Browse Files
                </label>
                <p className="mt-2 text-xs text-gray-500">Max 5 files, 10MB each. Supported: PDF, JPG, PNG, DOC</p>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                      <div className="flex items-center gap-2">
                        <BsPaperclip className="text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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

  const StepProgress = () => (
    <div className="mb-4 hidden sm:block">
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
                {step === 1 && "Category"}
                {step === 2 && "Priority"}
                {step === 3 && "Details"}
              </span>
            </div>
            {step < 3 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  const MobileStepNavigation = () => (
    <div className="mb-4 rounded-lg bg-white p-3 shadow-sm sm:hidden">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Step {currentStep} of 3</div>
        <div className="text-xs text-gray-500">
          {currentStep === 1 && "Select category"}
          {currentStep === 2 && "Select priority"}
          {currentStep === 3 && "Ticket details"}
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
          <span className="font-medium text-gray-700">Priority:</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {priorityLevels.find((p) => p.id === selectedPriority)?.name || "Medium"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Estimated Response:</span>
          <span className="font-semibold text-blue-700">{estimatedResponseTime}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Contact Method:</span>
          <span className="font-medium capitalize text-gray-800">{contactPreference}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            ✉️ You'll receive a confirmation email with your ticket details. Keep your ticket number for reference.
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
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <BsCalendar className="text-purple-500" />
          Your Recent Tickets
        </h2>
        <span className="text-sm text-gray-500">{recentTickets.length} tickets</span>
      </div>

      <div className="space-y-3">
        {recentTickets.map((ticket) => {
          const statusStyle = getStatusStyle(ticket.status)
          return (
            <div key={ticket.id} className="rounded-md border border-gray-200 p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusStyle.icon}
                  <div>
                    <p className="font-medium text-gray-800">{ticket.ticketNumber}</p>
                    <p className="text-sm text-gray-600">{ticket.subject}</p>
                  </div>
                </div>
                <span
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: statusStyle.backgroundColor, color: statusStyle.color }}
                >
                  {statusStyle.icon}
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{ticket.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">{ticket.createdAt}</span>
                </div>
              </div>

              {ticket.status === "in-progress" && (
                <div className="mt-2 rounded-md bg-blue-50 p-2">
                  <p className="text-xs text-blue-700">🔄 Your ticket is being reviewed by our support team.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )

  const renderSupportInfo = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <MdOutlineSupportAgent className="text-blue-500" />
        Support Information
      </h2>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 size-6 rounded-full bg-blue-100 p-1">
            <FaPhone className="size-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Call Support</p>
            <p className="text-sm text-gray-600">For urgent matters, call our support line:</p>
            <p className="font-bold text-[#004B23]">0700-POWER-NG (0700-76937-64)</p>
            <p className="text-xs text-gray-500">Available: Monday - Friday, 8 AM - 6 PM</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 size-6 rounded-full bg-green-100 p-1">
            <FaRegEnvelope className="size-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Email Support</p>
            <p className="text-sm text-gray-600">For non-urgent inquiries:</p>
            <p className="font-bold text-[#004B23]">support@powerutility.ng</p>
            <p className="text-xs text-gray-500">Response within 24 hours</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 size-6 rounded-full bg-purple-100 p-1">
            <BsHeadset className="size-4 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Live Chat</p>
            <p className="text-sm text-gray-600">Available on our website and mobile app</p>
            <p className="text-xs text-gray-500">Real-time support during business hours</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 size-6 rounded-full bg-amber-100 p-1">
            <FaLightbulb className="size-4 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Self-Service Options</p>
            <p className="text-sm text-gray-600">Check our knowledge base for common solutions</p>
            <p className="text-xs text-gray-500">FAQs, troubleshooting guides, and tutorials</p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <section className="size-full">
      <CustomerDashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
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

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
              {/* Left Column - Category, Priority & Form */}
              <div className="space-y-6 lg:col-span-2">
                <StepProgress />
                <MobileStepNavigation />

                <form onSubmit={handleSubmitTicket} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && renderCategorySelection()}
                    {currentStep === 2 && renderPrioritySelection()}
                    {currentStep === 3 && (isSubmitted ? renderSuccessMessage() : renderTicketForm())}
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
                            disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        >
                          Reset
                        </ButtonModule>
                      </div>

                      <div className="flex gap-3 sm:justify-end">
                        {currentStep < 3 ? (
                          <ButtonModule
                            type="button"
                            variant="primary"
                            className="w-full sm:w-auto"
                            onClick={nextStep}
                            disabled={isSubmitting}
                            icon={<ArrowRight />}
                            iconPosition="end"
                          >
                            Next
                          </ButtonModule>
                        ) : (
                          <ButtonModule
                            type="submit"
                            variant="primary"
                            className="w-full sm:w-auto"
                            disabled={
                              isSubmitting || !selectedCategory || !selectedPriority || !subject || !description
                            }
                          >
                            {isSubmitting ? "Creating Ticket..." : "Submit Support Ticket"}
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
                  <h3 className="mb-1 font-medium text-blue-800">Submit</h3>
                  <p className="text-xs text-blue-700">Fill out the support ticket form with details</p>
                </div>

                <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <span className="font-bold">2</span>
                  </div>
                  <h3 className="mb-1 font-medium text-amber-800">Review</h3>
                  <p className="text-xs text-amber-700">Our support team reviews and categorizes your ticket</p>
                </div>

                <div className="rounded-md border border-purple-100 bg-purple-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <span className="font-bold">3</span>
                  </div>
                  <h3 className="mb-1 font-medium text-purple-800">Investigate</h3>
                  <p className="text-xs text-purple-700">Team investigates and works on a solution</p>
                </div>

                <div className="rounded-md border border-green-100 bg-green-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <span className="font-bold">4</span>
                  </div>
                  <h3 className="mb-1 font-medium text-green-800">Resolve</h3>
                  <p className="text-xs text-green-700">Issue resolved and you're notified</p>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800">What to Expect After Submitting:</p>
                <ul className="ml-5 mt-2 list-disc space-y-1 text-sm text-gray-600">
                  <li>Immediate confirmation with your ticket number</li>
                  <li>Email/SMS updates at each stage of the process</li>
                  <li>Response within the estimated time based on priority</li>
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
