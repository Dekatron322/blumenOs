import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import AgentDirectory from "./AgentDirectory"
import Performance from "./Performance"
import RouteManagement from "./RouteManagement"
import Commissions from "./Commissions"

const MeteringInfo = () => {
  const [activeTab, setActiveTab] = useState("AgentDirectory")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "AgentDirectory":
        return <AgentDirectory />
      case "Performance":
        return <Performance />
      case "RouteManagement":
        return <RouteManagement />
      case "Commissions":
        return <Commissions />
      default:
        return <AgentDirectory />
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
