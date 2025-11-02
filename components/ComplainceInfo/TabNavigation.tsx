import React from "react"

// Tab Icons
const AuditTrailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
      fill="currentColor"
    />
  </svg>
)

const ComplianceCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill="currentColor"
    />
  </svg>
)

const NercReportsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
      fill="currentColor"
    />
  </svg>
)

interface TabNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "audit-trails", label: "Audit Trails", icon: <AuditTrailIcon /> },
    { id: "compliance-check", label: "Compliance Check", icon: <ComplianceCheckIcon /> },
    { id: "nerc-reports", label: "NERC Reports", icon: <NercReportsIcon /> },
  ]

  return (
    <div className="w-fit rounded-md bg-white px-2 py-2">
      <nav className="-mb-px flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
              activeTab === tab.id
                ? " bg-[#0a0a0a]  text-[#FFFFFF]"
                : " border-transparent  text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700 "
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default TabNavigation