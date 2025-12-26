import React, { useState } from "react"

import CashHolders from "./CashHolders"
import TabNavigation from "./TabNavigation"
import CashRemittance from "./CashRemittance"

const CashManagmentInfo = () => {
  const [activeTab, setActiveTab] = useState("CashRemittance")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "CashRemittance":
        return <CashRemittance />
      case "CashHolders":
        return <CashHolders />

      default:
        return <CashRemittance />
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

export default CashManagmentInfo
