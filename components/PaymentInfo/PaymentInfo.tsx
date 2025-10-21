import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import RecentPayments from "./RecentPayments"
import ReceiveableAging from "./ReceiveableAging"
import BankReconciliation from "./BankReconciliation"
import DunningManagement from "./DunningManagement"

const PaymentInfo = () => {
  const [activeTab, setActiveTab] = useState("RecentPayments")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "RecentPayments":
        return <RecentPayments />
      case "ReceiveableAging":
        return <ReceiveableAging />
      case "BankReconciliation":
        return <BankReconciliation />
      case "DunningManagement":
        return <DunningManagement />
      default:
        return <RecentPayments />
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

export default PaymentInfo
