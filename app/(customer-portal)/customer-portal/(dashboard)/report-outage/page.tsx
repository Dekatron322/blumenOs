"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { BsExclamationTriangle, BsLightning, BsClock, BsCalendar, BsPhone, BsGeoAlt } from "react-icons/bs"
import { FaCheckCircle, FaRegClock, FaMapMarkerAlt, FaWifi, FaTools } from "react-icons/fa"
import { MdReport, MdElectricalServices, MdOutlineSupportAgent } from "react-icons/md"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"

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
  area: string
  reportedAt: string
  status: "reported" | "investigating" | "restored"
  estimatedRestoration: string
}

const outageTypes: OutageType[] = [
  {
    id: 1,
    name: "Complete Power Loss",
    description: "No electricity at all in your premises",
    icon: <BsLightning className="text-red-500" />,
    severity: "high",
  },
  {
    id: 2,
    name: "Partial Outage",
    description: "Some areas have power, others don't",
    icon: <MdElectricalServices className="text-amber-500" />,
    severity: "medium",
  },
  {
    id: 3,
    name: "Intermittent Power",
    description: "Power keeps going on and off",
    icon: <FaWifi className="text-blue-500" />,
    severity: "medium",
  },
  {
    id: 4,
    name: "Low Voltage",
    description: "Power is very weak, appliances not working properly",
    icon: <BsExclamationTriangle className="text-orange-500" />,
    severity: "low",
  },
  {
    id: 5,
    name: "Flickering Lights",
    description: "Lights are dimming or flickering",
    icon: <FaRegClock className="text-purple-500" />,
    severity: "low",
  },
  {
    id: 6,
    name: "Equipment Damage",
    description: "Damaged transformer, pole, or power lines",
    icon: <FaTools className="text-red-700" />,
    severity: "high",
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

const recentOutages: RecentOutage[] = [
  {
    id: 1,
    area: "Barnawa",
    reportedAt: "2024-01-15 14:30",
    status: "restored",
    estimatedRestoration: "2024-01-15 16:45",
  },
  {
    id: 2,
    area: "Kawo",
    reportedAt: "2024-01-14 10:15",
    status: "investigating",
    estimatedRestoration: "2024-01-15 18:00",
  },
  {
    id: 3,
    area: "Kaduna South",
    reportedAt: "2024-01-13 19:45",
    status: "restored",
    estimatedRestoration: "2024-01-14 02:30",
  },
]

const getStatusStyle = (status: string) => {
  switch (status) {
    case "reported":
      return { backgroundColor: "#FEF3C7", color: "#92400E", icon: <MdReport className="size-4" /> }
    case "investigating":
      return { backgroundColor: "#E0F2FE", color: "#0C4A6E", icon: <MdOutlineSupportAgent className="size-4" /> }
    case "restored":
      return { backgroundColor: "#D1FAE5", color: "#065F46", icon: <FaCheckCircle className="size-4" /> }
    default:
      return { backgroundColor: "#F3F4F6", color: "#374151", icon: <MdReport className="size-4" /> }
  }
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
      alert("Please select an outage type")
      return
    }

    if (!selectedArea) {
      alert("Please select an affected area")
      return
    }

    if (!address.trim()) {
      alert("Please enter your address")
      return
    }

    if (!description.trim()) {
      alert("Please describe the outage")
      return
    }

    setIsSubmitting(true)

    // Simulate API delay
    setTimeout(() => {
      const newReportNumber = generateReportNumber()
      const newEstimatedTime = generateEstimatedRestoration()

      setReportNumber(newReportNumber)
      setEstimatedRestorationTime(newEstimatedTime)
      setIsSubmitted(true)
      setIsSubmitting(false)
    }, 2000)
  }

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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormSelectModule
              label="Affected Area"
              name="affectedArea"
              value={selectedArea || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedArea(e.target.value ? Number(e.target.value) : null)
              }
              options={[
                { value: "", label: "Select area" },
                ...affectedAreas.map((area) => ({
                  value: area.id,
                  label: `${area.name} (${area.code})`,
                })),
              ]}
              required
            />
          </div>

          <div className="space-y-2">
            <FormInputModule
              label="Outage Start Time"
              name="startTime"
              type="datetime-local"
              placeholder="Select when the outage started"
              value={startTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <FormInputModule
              label="Landmark (Optional)"
              name="landmark"
              type="text"
              placeholder="e.g., near bank, opposite school"
              value={landmark}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLandmark(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <FormInputModule
              label="Contact Phone"
              name="phone"
              type="tel"
              placeholder="Alternative phone number"
              value={phoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <FormInputModule
            label="Address"
            name="address"
            type="text"
            placeholder="Enter your current address"
            value={address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
            required
          />
        </div>
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
            disabled={isSubmitting}
          >
            Reset
          </ButtonModule>

          <ButtonModule
            type="submit"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={isSubmitting || !selectedOutageType || !selectedArea || !address || !description}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
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
          Keep your report number for tracking. You'll receive updates via SMS and email.
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
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <BsCalendar className="text-purple-500" />
        Recent Outages in Your Area
      </h2>

      <div className="space-y-3">
        {recentOutages.map((outage) => {
          const statusStyle = getStatusStyle(outage.status)
          return (
            <div key={outage.id} className="rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusStyle.icon}
                  <span className="font-medium text-gray-800">{outage.area}</span>
                </div>
                <span
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: statusStyle.backgroundColor, color: statusStyle.color }}
                >
                  {statusStyle.icon}
                  {outage.status.charAt(0).toUpperCase() + outage.status.slice(1)}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <div>
                  <span className="text-gray-600">Reported:</span>
                  <span className="ml-2 font-medium">{outage.reportedAt}</span>
                </div>
                <div>
                  <span className="text-gray-600">Restored:</span>
                  <span className="ml-2 font-medium">{outage.estimatedRestoration}</span>
                </div>
              </div>

              {outage.status === "restored" && (
                <div className="mt-2 rounded-md bg-green-50 p-2">
                  <p className="text-xs text-green-700">
                    ✓ Power restored in this area. If you're still experiencing issues, please report.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
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
    <section className="size-full">
      <CustomerDashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 py-4 lg:container sm:px-4 md:px-6 xl:px-16">
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
            <div className="mt-8 rounded-md border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Outage Reporting Process</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <span className="font-bold">1</span>
                  </div>
                  <h3 className="mb-1 font-medium text-blue-800">Report</h3>
                  <p className="text-xs text-blue-700">Fill out the outage report form with details</p>
                </div>

                <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <span className="font-bold">2</span>
                  </div>
                  <h3 className="mb-1 font-medium text-amber-800">Acknowledge</h3>
                  <p className="text-xs text-amber-700">Receive confirmation and report number</p>
                </div>

                <div className="rounded-md border border-purple-100 bg-purple-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <span className="font-bold">3</span>
                  </div>
                  <h3 className="mb-1 font-medium text-purple-800">Investigate</h3>
                  <p className="text-xs text-purple-700">Our team investigates the reported issue</p>
                </div>

                <div className="rounded-md border border-green-100 bg-green-50 p-4 text-center">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <span className="font-bold">4</span>
                  </div>
                  <h3 className="mb-1 font-medium text-green-800">Restore</h3>
                  <p className="text-xs text-green-700">Power is restored and you're notified</p>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800">What Happens After You Report:</p>
                <ul className="ml-5 mt-2 list-disc space-y-1 text-sm text-gray-600">
                  <li>You'll receive an SMS confirmation with your report number</li>
                  <li>Our team will investigate within 30 minutes of receiving your report</li>
                  <li>You'll receive updates via SMS at key stages of the restoration process</li>
                  <li>Once resolved, you'll get a confirmation message when power is restored</li>
                  <li>You can track your report status using the report number</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OutageReport
