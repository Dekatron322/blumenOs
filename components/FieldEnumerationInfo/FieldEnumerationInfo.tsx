import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import MetersTab from "./MetersTab"
import CustomersTab from "./CustomersTab"
import LocationsTab from "./LocationsTab"

const FieldEnumerationInfo = () => {
  const [activeTab, setActiveTab] = useState("meters")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "meters":
        return <MetersTab />
      case "customers":
        return <CustomersTab />
      case "locations":
        return <LocationsTab />
      default:
        return <MetersTab />
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

export default FieldEnumerationInfo
