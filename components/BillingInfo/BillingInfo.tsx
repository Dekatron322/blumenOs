import React, { useState } from "react"

import TabNavigation from "./TabNavigation"
import BillingCycles from "./BillingCycles"
import TariffManagement from "./TariffManagement"
import RecentBills from "./RecentBills"
import Exceptions from "./Exceptions"
import MeterReadings from "./MeterReadings"
import FeederEnergyCaps from "./FeederEnergyCaps"

const MeteringInfo = () => {
  const [activeTab, setActiveTab] = useState("BillingCycles")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "BillingCycles":
        return <BillingCycles />
      // case "MeterReadings":
      //   return <MeterReadings />
      case "FeederEnergyCaps":
        return <FeederEnergyCaps />
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
