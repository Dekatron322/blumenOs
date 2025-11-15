import React, { useState } from "react"
import TabNavigation from "./TabNavigation"
import ComplianceCheckTab from "./ComplianceCheckTab"
import AuditTrailTab from "./AuditTrailTab"
import NercReportsTab from "./NercReportsTab"

const ComplainceInfo = () => {
  const [activeTab, setActiveTab] = useState("audit-trail")

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "audit-trail":
        return <AuditTrailTab />
      case "compliance-check":
        return <ComplianceCheckTab />
      case "nerc-reports":
        return <NercReportsTab />
      default:
        return <AuditTrailTab />
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

export default ComplainceInfo
