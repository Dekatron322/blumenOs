import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import RevenueTab from "./RevenueTab"
import ConsumptionTab from "./ConsumptionTab"
import PerformanceTab from "./PerformanceTab"

const AnalyticsInfo = () => {
  const [activeTab, setActiveTab] = useState("revenue")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "revenue":
        return <RevenueTab />
      case "consumption":
        return <ConsumptionTab />
      case "performance":
        return <PerformanceTab />
      default:
        return <RevenueTab />
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

export default AnalyticsInfo
