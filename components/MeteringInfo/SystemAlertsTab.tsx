"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import ManageAlertModal from "components/ui/Modal/manage-alert-modal"

// Alert Icon for System Alerts Tab
const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
      fill="currentColor"
    />
  </svg>
)

const SystemAlertsTab: React.FC = () => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  const handleManageClick = (alert: any) => {
    setSelectedAlert(alert)
    setIsManageModalOpen(true)
  }

  const handleModalClose = () => {
    setIsManageModalOpen(false)
    setSelectedAlert(null)
  }

  const alerts = [
    {
      id: "ALT001",
      type: "tamper",
      severity: "high",
      meter: "MTR001234569",
      customer: "Chinedu Okafor",
      title: "Tamper detection alert",
      time: "2024-01-15 08:30",
      color: "red",
    },
    {
      id: "ALT002",
      type: "battery",
      severity: "medium",
      meter: "MTR001234569",
      customer: "Chinedu Okafor",
      title: "Low battery warning (15%)",
      time: "2024-01-15 09:15",
      color: "yellow",
    },
    {
      id: "ALT003",
      type: "communication",
      severity: "high",
      meter: "MTR001234570",
      customer: "Alice Johnson",
      title: "Communication failure",
      time: "2024-01-14 16:45",
      color: "red",
    },
    {
      id: "ALT004",
      type: "reading",
      severity: "low",
      meter: "MTR001234571",
      customer: "Bob Williams",
      title: "Unusual consumption pattern",
      time: "2024-01-14 12:20",
      color: "blue",
    },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border bg-white p-6"
      >
        <h3 className="mb-4 text-lg font-semibold">System Alerts</h3>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`rounded-lg border border-${alert.color}-200 bg-${alert.color}-50 p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full bg-${alert.color}-100 p-2`}>
                    <AlertIcon />
                  </div>
                  <div>
                    <h4 className={`font-medium text-${alert.color}-800`}>{alert.title}</h4>
                    <p className={`text-sm text-${alert.color}-600`}>
                      Meter: {alert.meter} | Customer: {alert.customer}
                    </p>
                    <p className={`text-sm text-${alert.color}-600`}>
                      Type: {alert.type} | Time: {alert.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">active</span>
                  <button
                    className={`rounded-full bg-${alert.color}-100 px-3 py-1 text-${alert.color}-800 hover:bg-${alert.color}-200`}
                    onClick={() => handleManageClick(alert)}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Alert Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="font-medium text-gray-800">Alert Summary</h4>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">4</div>
                <div className="text-sm text-gray-600">Total Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">2</div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">1</div>
                <div className="text-sm text-gray-600">Info</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ManageAlertModal isOpen={isManageModalOpen} onRequestClose={handleModalClose} alertData={selectedAlert} />
    </>
  )
}

export default SystemAlertsTab
