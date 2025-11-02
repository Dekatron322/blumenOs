import React from "react"

// Tab Icons
const OutagesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill="currentColor"
    />
  </svg>
)

const MaintenanceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
      fill="currentColor"
    />
  </svg>
)

const ReportsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
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
    { id: "outages", label: "Outages", icon: <OutagesIcon /> },
    { id: "maintenance", label: "Maintenance", icon: <MaintenanceIcon /> },
    { id: "reports", label: "Reports", icon: <ReportsIcon /> },
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
