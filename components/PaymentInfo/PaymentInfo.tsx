import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import RecentPayments from "./RecentPayments"
import BankReconciliation from "./BankReconciliation"
import DunningManagement from "./DunningManagement"
import RecentDisputes from "./RecentDisputes"

const PaymentInfo = () => {
  const [activeTab, setActiveTab] = useState("RecentPayments")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "RecentPayments":
        return <RecentPayments />
      case "RecentDisputes":
        return <RecentDisputes />
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
