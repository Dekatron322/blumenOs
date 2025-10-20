import React, { useState } from "react"
import MeterInventoryTab from "./MeterInventoryTab"
import MeterReadingsTab from "./MeterReadingsTab"
import SystemAlertsTab from "./SystemAlertsTab"
import InstallationQueueTab from "./InstallationQueueTab"
import TabNavigation from "./TabNavigation"

const MeteringInfo = () => {
  const [activeTab, setActiveTab] = useState("inventory")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "inventory":
        return <MeterInventoryTab />
      case "readings":
        return <MeterReadingsTab />
      case "alerts":
        return <SystemAlertsTab />
      case "queue":
        return <InstallationQueueTab />
      default:
        return <MeterInventoryTab />
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

export default MeteringInfo
