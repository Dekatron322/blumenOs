import React, { useState } from "react"

import TabNavigation from "./TabNavigation"
import BillingCycles from "./BillingCycles"
import TariffManagement from "./TariffManagement"
import RecentBills from "./RecentBills"
import Exceptions from "./Exceptions"

const MeteringInfo = () => {
  const [activeTab, setActiveTab] = useState("BillingCycles")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "BillingCycles":
        return <BillingCycles />
      case "TariffManagement":
        return <TariffManagement />
      case "Exceptions":
        return <Exceptions />
      case "RecentBills":
        return <RecentBills />
      default:
        return <BillingCycles />
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
