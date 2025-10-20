"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import ManageAlertModal from "components/ui/Modal/manage-alert-modal"

// Exceptions Icon for Billing Exceptions Tab
const ExceptionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
      fill="currentColor"
    />
  </svg>
)

const BillingExceptionsTab: React.FC = () => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedException, setSelectedException] = useState<any>(null)

  const handleManageClick = (exception: any) => {
    setSelectedException(exception)
    setIsManageModalOpen(true)
  }

  const handleModalClose = () => {
    setIsManageModalOpen(false)
    setSelectedException(null)
  }

  const exceptions = [
    {
      id: "EXC001",
      type: "Zero Consumption Reading",
      severity: "high",
      customer: "John Doe",
      account: "2301567893",
      description: "Requires manual review - possible meter fault or tampering",
      time: "2024-01-15 08:30",
      status: "Pending",
      color: "red",
    },
    {
      id: "EXC002",
      type: "High Consumption Anomaly",
      severity: "high",
      customer: "Maria Santos",
      account: "2301567894",
      description: "Usage 300% above average - requires investigation",
      time: "2024-01-15 09:15",
      status: "Under Review",
      color: "orange",
    },
    {
      id: "EXC003",
      type: "Missing Meter Reading",
      severity: "medium",
      customer: "Ahmed Ali",
      account: "2301567895",
      description: "Manual reading required - AMI communication failed",
      time: "2024-01-14 16:45",
      status: "Pending",
      color: "yellow",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800"
      case "Under Review":
        return "bg-blue-100 text-blue-800"
      case "Pending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border bg-white p-6"
      >
        <h3 className="mb-4 text-lg font-semibold">Billing Exceptions</h3>
        <div className="space-y-4">
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className={`rounded-lg border border-${exception.color}-200 bg-${exception.color}-50 p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full bg-${exception.color}-100 p-2`}>
                    <ExceptionsIcon />
                  </div>
                  <div>
                    <h4 className={`font-medium text-${exception.color}-800`}>{exception.type}</h4>
                    <p className={`text-sm text-${exception.color}-600`}>
                      Customer: {exception.customer} | Account: {exception.account}
                    </p>
                    <p className={`text-sm text-${exception.color}-600`}>{exception.description}</p>
                    <p className={`text-sm text-${exception.color}-600`}>Time: {exception.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(exception.status)}`}>
                    {exception.status}
                  </span>
                  <button
                    className={`rounded-full bg-${exception.color}-100 px-3 py-1 text-${exception.color}-800 hover:bg-${exception.color}-200`}
                    onClick={() => handleManageClick(exception)}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Exception Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="font-medium text-gray-800">Exception Summary</h4>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">3</div>
                <div className="text-sm text-gray-600">Total Exceptions</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">2</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-gray-600">Medium Priority</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">2</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ManageAlertModal isOpen={isManageModalOpen} onRequestClose={handleModalClose} alertData={selectedException} />
    </>
  )
}

export default BillingExceptionsTab
