"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import { useAppDispatch } from "lib/hooks/useRedux"
import { ButtonModule } from "components/ui/Button/Button"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { BsCalendar, BsClock, BsExclamationTriangle, BsLightning, BsPhone } from "react-icons/bs"
import { FaCheckCircle, FaRegClock, FaTools } from "react-icons/fa"
import { MdElectricalServices, MdOutlineSupportAgent, MdReport } from "react-icons/md"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"
import { notify } from "components/ui/Notification/Notification"
import {
  clearReportOutageStatus,
  getRecentOutages,
  reportOutage,
  selectRecentOutagesError,
  selectRecentOutagesList,
  selectRecentOutagesLoading,
  selectRecentOutagesPagination,
  selectReportOutageError,
  selectReportOutageLoading,
  selectReportOutageResponseData,
  selectReportOutageSuccess,
} from "lib/redux/customersDashboardSlice"

// Customer Outage Reason Enum
enum CustomerOutageReason {
  Unknown = 0,
  TransformerBlowing = 1,
  Vandalization = 2,
  CableFault = 3,
  LoadShedding = 4,
  PlannedMaintenance = 5,
  MeterFault = 6,
  Other = 50,
}

// Outage Status Enum
enum OutageStatus {
  Reported = 1,
  Investigating = 2,
  Resolved = 3,
  Closed = 4,
}

// Outage Scope Enum
enum OutageScope {
  SingleBuilding = 1,
  Street = 2,
  Neighborhood = 3,
  Area = 4,
  District = 5,
}

// Mock data for outage types and areas
interface OutageType {
  id: number
  name: string
  description: string
  icon: React.ReactNode
  severity: "low" | "medium" | "high"
}

interface AreaAffected {
  id: number
  name: string
  code: string
}

interface RecentOutage {
  id: number
  referenceCode: string
  title: string
  priority: number
  status: number
  scope: number
  distributionSubstationId: number
  feederId: number
  distributionSubstationName: string
  feederName: string
  isCustomerGenerated: boolean
  affectedCustomerCount: number
  customerReportCount: number
  reportedAt: string
  durationHours: number
}

const outageTypes: OutageType[] = [
  {
    id: CustomerOutageReason.Unknown,
    name: "Unknown Issue",
    description: "Not sure what's causing the outage",
    icon: <BsExclamationTriangle className="text-gray-500" />,
    severity: "medium",
  },
  {
    id: CustomerOutageReason.TransformerBlowing,
    name: "Transformer Issue",
    description: "Transformer problems or complete power loss",
    icon: <BsLightning className="text-red-500" />,
    severity: "high",
  },
  {
    id: CustomerOutageReason.Vandalization,
    name: "Vandalism",
    description: "Damage to power equipment or infrastructure",
    icon: <FaTools className="text-red-700" />,
    severity: "high",
  },
  {
    id: CustomerOutageReason.CableFault,
    name: "Cable Fault",
    description: "Power cable issues or partial outages",
    icon: <MdElectricalServices className="text-amber-500" />,
    severity: "medium",
  },
  {
    id: CustomerOutageReason.LoadShedding,
    name: "Load Shedding",
    description: "Planned power reduction due to high demand",
    icon: <FaRegClock className="text-orange-500" />,
    severity: "low",
  },
  {
    id: CustomerOutageReason.PlannedMaintenance,
    name: "Planned Maintenance",
    description: "Scheduled power maintenance work",
    icon: <FaRegClock className="text-blue-500" />,
    severity: "low",
  },
  {
    id: CustomerOutageReason.MeterFault,
    name: "Meter Fault",
    description: "Issues with electricity meter or low voltage",
    icon: <BsExclamationTriangle className="text-orange-500" />,
    severity: "medium",
  },
  {
    id: CustomerOutageReason.Other,
    name: "Other Issue",
    description: "Any other type of power outage",
    icon: <BsExclamationTriangle className="text-purple-500" />,
    severity: "medium",
  },
]

const affectedAreas: AreaAffected[] = [
  { id: 1, name: "Barnawa", code: "BNW-KD" },
  { id: 2, name: "Kawo", code: "KWO-KD" },
  { id: 3, name: "Kaduna North", code: "KDN-N" },
  { id: 4, name: "Kaduna South", code: "KDN-S" },
  { id: 5, name: "Ungwan Rimi", code: "UGR-KD" },
  { id: 6, name: "Narayi", code: "NRY-KD" },
  { id: 7, name: "Sabon Tasha", code: "SBT-KD" },
  { id: 8, name: "Kakuri", code: "KKR-KD" },
]

const getStatusStyle = (status: number) => {
  switch (status) {
    case OutageStatus.Reported:
      return { backgroundColor: "#FEF3C7", color: "#92400E", icon: <MdReport className="size-4" /> }
    case OutageStatus.Investigating:
      return { backgroundColor: "#E0F2FE", color: "#0C4A6E", icon: <MdOutlineSupportAgent className="size-4" /> }
    case OutageStatus.Resolved:
      return { backgroundColor: "#D1FAE5", color: "#065F46", icon: <FaCheckCircle className="size-4" /> }
    case OutageStatus.Closed:
      return { backgroundColor: "#F3F4F6", color: "#374151", icon: <FaCheckCircle className="size-4" /> }
    default:
      return { backgroundColor: "#F3F4F6", color: "#374151", icon: <MdReport className="size-4" /> }
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case OutageStatus.Reported:
      return "Reported"
    case OutageStatus.Investigating:
      return "Investigating"
    case OutageStatus.Resolved:
      return "Resolved"
    case OutageStatus.Closed:
      return "Closed"
    default:
      return "Unknown"
  }
}

const getPriorityText = (priority: number) => {
  switch (priority) {
    case 1:
      return "Low"
    case 2:
      return "Medium"
    case 3:
      return "High"
    case 4:
      return "Critical"
    default:
      return "Unknown"
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case "high":
      return { backgroundColor: "#FEE2E2", color: "#991B1B" }
    case "medium":
      return { backgroundColor: "#FEF3C7", color: "#92400E" }
    case "low":
      return { backgroundColor: "#D1FAE5", color: "#065F46" }
    default:
      return { backgroundColor: "#F3F4F6", color: "#374151" }
  }
}

const OutageReport: React.FC = () => {
  const dispatch = useAppDispatch()

  // Redux state for recent outages
  const recentOutages = useSelector(selectRecentOutagesList) || []
  const isLoadingOutages = useSelector(selectRecentOutagesLoading)
  const outagesError = useSelector(selectRecentOutagesError)
  const outagesPagination = useSelector(selectRecentOutagesPagination)

  // Redux state for report outage
  const reportOutageResponseData = useSelector(selectReportOutageResponseData)
  const isReportingOutage = useSelector(selectReportOutageLoading)
  const reportOutageError = useSelector(selectReportOutageError)
  const reportOutageSuccess = useSelector(selectReportOutageSuccess)

  // Form state
  const [selectedOutageType, setSelectedOutageType] = useState<number | null>(null)
  const [selectedArea, setSelectedArea] = useState<number | null>(null)
  const [address, setAddress] = useState("")
  const [landmark, setLandmark] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("")
  const [reportNumber, setReportNumber] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [estimatedRestorationTime, setEstimatedRestorationTime] = useState<string | null>(null)

  // Logged in customer info
  const customerInfo = {
    name: "John Smith",
    accountNumber: "ACC00123456",
    meterNumber: "04123456789",
    address: "123 Main Street, Ikeja, Lagos",
    phoneNumber: "+2348012345678",
  }

  // Fetch recent outages on component mount
  useEffect(() => {
    dispatch(getRecentOutages({ pageNumber: 1, pageSize: 10, days: 7 }))
  }, [dispatch])

  const generateReportNumber = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `OUT-${timestamp}-${random}`
  }

  const generateEstimatedRestoration = () => {
    const now = new Date()
    // Add 2-6 hours randomly
    const hoursToAdd = 2 + Math.floor(Math.random() * 5)
    now.setHours(now.getHours() + hoursToAdd)
    return now.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
    })
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOutageType) {
      notify("warning", "Please select an outage type")
      return
    }

    if (!description.trim()) {
      notify("warning", "Please describe the outage")
      return
    }

    // Clear any previous report outage status
    dispatch(clearReportOutageStatus())

    // Set submitting state
    setIsSubmitting(true)

    // Dispatch the report outage action
    dispatch(
      reportOutage({
        reason: selectedOutageType,
        additionalNotes: description,
      })
    )
  }

  // Handle report outage response
  useEffect(() => {
    if (reportOutageSuccess && reportOutageResponseData) {
      setReportNumber(reportOutageResponseData.referenceCode)
      setEstimatedRestorationTime(generateEstimatedRestoration())
      setIsSubmitted(true)
      setIsSubmitting(false)
      notify("success", "Outage reported successfully! We'll investigate and restore power as soon as possible.")
    }
  }, [reportOutageSuccess, reportOutageResponseData])

  // Handle report outage error
  useEffect(() => {
    if (reportOutageError) {
      setIsSubmitting(false)
      notify("error", reportOutageError)
    }
  }, [reportOutageError])

  const resetForm = () => {
    setSelectedOutageType(null)
    setSelectedArea(null)
    setAddress("")
    setLandmark("")
    setPhoneNumber("")
    setDescription("")
    setStartTime("")
    setReportNumber(null)
    setIsSubmitted(false)
    setEstimatedRestorationTime(null)
    dispatch(clearReportOutageStatus())
  }

  const renderOutageTypes = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <BsExclamationTriangle className="text-red-500" />
        Select Outage Type
      </h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {outageTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedOutageType(type.id)}
            className={`flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all duration-200 ${
              selectedOutageType === type.id
                ? "border-[#004B23] bg-[#004B23]/5"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
            }`}
          >
            <div className="mb-3 flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                {type.icon}
                <span className="font-semibold text-gray-800">{type.name}</span>
              </div>
              <span className="rounded-full px-2 py-1 text-xs font-medium" style={getSeverityStyle(type.severity)}>
                {type.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{type.description}</p>
          </button>
        ))}
      </div>
    </motion.div>
  )

  const renderForm = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <MdReport className="text-blue-500" />
        Report Details
      </h2>

      <form onSubmit={handleSubmitReport} className="space-y-5">
        <div className="space-y-2">
          <FormTextAreaModule
            label="Description"
            name="description"
            placeholder="Describe the outage in detail..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            required
            rows={5}
          />
          <p className="text-xs text-gray-500">
            Include details like affected appliances, noises heard, visible damage, etc.
          </p>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            ⚠️ Please ensure your information is accurate. False reports may affect service priority.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <ButtonModule
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={resetForm}
            disabled={isReportingOutage}
          >
            Reset
          </ButtonModule>

          <ButtonModule
            type="submit"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={isReportingOutage || !selectedOutageType || !description}
          >
            {isReportingOutage ? "Submitting..." : "Submit Report"}
          </ButtonModule>
        </div>
      </form>
    </motion.div>
  )

  const renderSuccessMessage = () => (
    <motion.div
      className="rounded-md border border-green-200 bg-green-50 p-6 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-green-100">
        <FaCheckCircle className="size-8 text-green-600" />
      </div>

      <h3 className="mb-2 text-xl font-bold text-green-800">Report Submitted Successfully!</h3>
      <p className="mb-4 text-sm text-green-700">
        Thank you for reporting the outage. Our team has been notified and will investigate promptly.
      </p>

      <div className="mx-auto w-full space-y-3 rounded-md bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Report Number:</span>
          <span className="font-mono font-bold text-[#004B23]">{reportNumber}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Status:</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Reported - Under Review
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Estimated Restoration:</span>
          <span className="font-semibold text-amber-700">{estimatedRestorationTime}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-sm text-gray-600">
          Keep your report number for tracking. You&apos;ll receive updates via SMS and email.
        </p>
        <div className="flex gap-3">
          <ButtonModule type="button" variant="secondary" className="w-full" onClick={resetForm}>
            Report Another Outage
          </ButtonModule>
          <ButtonModule
            type="button"
            variant="primary"
            className="w-full"
            onClick={() => alert("Tracking feature would open here")}
          >
            Track This Report
          </ButtonModule>
        </div>
      </div>
    </motion.div>
  )

  const renderRecentOutages = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 max-sm:text-base">
          <BsCalendar className="text-purple-500" />
          Recent Outages in Your Area
        </h2>
        {outagesPagination && <span className="text-xs text-gray-500">{outagesPagination.totalCount} total</span>}
      </div>

      {isLoadingOutages ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading recent outages...</span>
        </div>
      ) : outagesError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">Failed to load recent outages. Please try again later.</p>
          <button
            onClick={() => dispatch(getRecentOutages({ pageNumber: 1, pageSize: 10, days: 7 }))}
            className="mt-2 text-sm text-red-700 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      ) : recentOutages.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">No recent outages reported in your area.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOutages.map((outage) => {
            const statusStyle = getStatusStyle(outage.status)
            const statusText = getStatusText(outage.status)

            return (
              <div key={outage.id} className="rounded-md border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusStyle.icon}
                    <span className="text-sm font-medium text-gray-800">{outage.distributionSubstationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                      style={{ backgroundColor: statusStyle.backgroundColor, color: statusStyle.color }}
                    >
                      {statusStyle.icon}
                      {statusText}
                    </span>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{formatDate(outage.reportedAt)}</span>
                  <button
                    onClick={() => {
                      const detailsElement = document.getElementById(`details-${outage.id}`)
                      detailsElement?.classList.toggle("hidden")
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Show Details
                  </button>
                </div>

                <div id={`details-${outage.id}`} className="mt-3 hidden border-t pt-3">
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-mono">{outage.referenceCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span>{outage.distributionSubstationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>{outage.durationHours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Affected:</span>
                      <span>{outage.affectedCustomerCount} customers</span>
                    </div>
                  </div>

                  {outage.status === OutageStatus.Resolved && (
                    <div className="mt-2 rounded-md bg-green-50 p-2">
                      <p className="text-xs text-green-700">
                        ✓ Power restored in this area. If you&apos;re still experiencing issues, please report.
                      </p>
                    </div>
                  )}

                  {outage.isCustomerGenerated && (
                    <div className="mt-2 rounded-md bg-blue-50 p-2">
                      <p className="text-xs text-blue-700">ℹ️ This outage was reported by customers like you.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )

  const renderTips = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <MdOutlineSupportAgent className="text-blue-500" />
        Safety Tips During Outages
      </h2>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 size-6 rounded-full bg-blue-100 p-1">
            <BsExclamationTriangle className="size-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Check Your Circuit Breaker</p>
            <p className="text-sm text-gray-600">
              Verify if the outage is only in your premises by checking your main switch.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 size-6 rounded-full bg-amber-100 p-1">
            <BsLightning className="size-4 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Unplug Sensitive Appliances</p>
            <p className="text-sm text-gray-600">
              Protect electronics from potential power surges when electricity returns.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 size-6 rounded-full bg-red-100 p-1">
            <FaTools className="size-4 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Stay Away from Power Lines</p>
            <p className="text-sm text-gray-600">
              If you see fallen power lines, stay at least 10 meters away and report immediately.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 size-6 rounded-full bg-green-100 p-1">
            <BsPhone className="size-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Emergency Contacts</p>
            <p className="text-sm text-gray-600">
              For life-threatening emergencies, call: 112 or our emergency line: 0700-POWER-NG
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <CustomerDashboardNav />
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Report Power Outage</h1>
                <p className="text-sm text-gray-600">
                  Report electricity outages in your area. Our team will respond as quickly as possible.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2">
                <BsClock className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Average Response Time: <span className="font-bold">45 minutes</span>
                </span>
              </div>
            </div>

            {/* Customer Information */}

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
              {/* Left Column - Outage Types & Recent Outages */}
              <div className="space-y-6 lg:col-span-2">
                {/* Outage Type Selection */}
                {renderOutageTypes()}

                {/* Report Form or Success Message */}
                {isSubmitted ? renderSuccessMessage() : renderForm()}
              </div>

              {/* Right Column - Recent Outages & Tips */}
              <div className="space-y-6">
                {renderRecentOutages()}
                {renderTips()}
              </div>
            </div>

            {/* Information Section */}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OutageReport
