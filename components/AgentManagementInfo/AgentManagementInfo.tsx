import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import AgentDirectory from "./AgentDirectory"
import CashierDirectory from "./CashierDirectory"
import ClearingCashierDirectory from "./ClearingCashierDirectory"
import SupervisorsDirectory from "./SupervisorsDirectory"

const AgentManagementInfo = () => {
  const [activeTab, setActiveTab] = useState("AgentDirectory")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "AgentDirectory":
        return <AgentDirectory />
      case "CashierDirectory":
        return <CashierDirectory />
      case "ClearingCashierDirectory":
        return <ClearingCashierDirectory />
      case "SupervisorsDirectory":
        return <SupervisorsDirectory />
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

export default AgentManagementInfo
