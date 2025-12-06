import React, { useState } from "react"
import MapViewTab from "./MapViewTab"
import TableViewTab from "./TableViewTab"
import TabNavigation from "./TabNavigation"
import OutageViewTabe from "./OutageViewTab"

const StatusMapInfo = () => {
  const [activeTab, setActiveTab] = useState("map-view")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "map-view":
        return <MapViewTab />
      case "outage-view":
        return <OutageViewTabe />
      default:
        return <MapViewTab />
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

export default StatusMapInfo
