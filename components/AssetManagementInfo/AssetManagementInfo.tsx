import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import TransformersTab from "./TransformersTab"
import FeedersTab from "./FeedersTab"
import SubstationsTab from "./SubstationsTab"

const AssetManagementInfo = () => {
  const [activeTab, setActiveTab] = useState("transformers")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "transformers":
        return <TransformersTab />
      case "feeders":
        return <FeedersTab />
      case "substations":
        return <SubstationsTab />
      default:
        return <TransformersTab />
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

export default AssetManagementInfo
