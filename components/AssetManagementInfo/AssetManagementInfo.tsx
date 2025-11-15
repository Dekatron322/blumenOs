import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import TransformersTab from "./TransformersTab"
import FeedersTab from "./FeedersTab"
import SubstationsTab from "./SubstationsTab"
import AreaOfficesTab from "./AreaOfficesTab"
import PolesTab from "./PolesTab"
import DistributionStaionTab from "./DistributionStationTab"

const AssetManagementInfo = () => {
  const [activeTab, setActiveTab] = useState("offices")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      // case "transformers":
      //   return <TransformersTab />
      case "offices":
        return <AreaOfficesTab />
      case "feeders":
        return <FeedersTab />
      case "poles":
        return <PolesTab />
      case "substations":
        return <SubstationsTab />
      case "distribution-stations":
        return <DistributionStaionTab />
      default:
        return <AreaOfficesTab />
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
