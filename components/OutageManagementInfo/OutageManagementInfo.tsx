import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import OutagesTab from "./OutagesTab"
import MaintenanceTab from "./MaintenanceTab"
import ReportsTab from "./ReportsTab"

const OutageManagementInfo = () => {
  const [activeTab, setActiveTab] = useState("outages")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "outages":
        return <OutagesTab />
      case "maintenance":
        return <MaintenanceTab />
      case "reports":
        return <ReportsTab />
      default:
        return <OutagesTab />
    }
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  )
}

export default OutageManagementInfo
