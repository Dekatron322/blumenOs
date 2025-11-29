import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import PaymentDisputes from "./PaymentDisputes"
import BillingDisputes from "./BillingDisputes"

const BillingInfo = () => {
  const [activeTab, setActiveTab] = useState("PaymentDisputes")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "PaymentDisputes":
        return <PaymentDisputes />
      case "BillingDisputes":
        return <BillingDisputes />
      default:
        return <PaymentDisputes />
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

export default BillingInfo
