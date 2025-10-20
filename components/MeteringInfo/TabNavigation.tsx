import React from "react"

// Tab Icons
const InventoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 1H1V3C1 4.1 1.9 5 3 5H5V1H3Z" fill="currentColor" />
    <path d="M7 1H13V5H7V1Z" fill="currentColor" />
    <path d="M17 1H15V5H17C18.1 5 19 4.1 19 3V1H17Z" fill="currentColor" />
    <path d="M1 7H5V13H1V7Z" fill="currentColor" />
    <path d="M19 7H15V13H19V7Z" fill="currentColor" />
    <path d="M3 15H5V19H3C1.9 19 1 18.1 1 17V15H3Z" fill="currentColor" />
    <path d="M7 15H13V19H7V15Z" fill="currentColor" />
    <path d="M17 15H19V17C19 18.1 18.1 19 17 19H15V15H17Z" fill="currentColor" />
  </svg>
)

const ReadingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H19V19H1V1ZM3 3V17H17V3H3Z" fill="currentColor" />
    <path d="M5 5H7V15H5V5Z" fill="currentColor" />
    <path d="M9 8H11V15H9V8Z" fill="currentColor" />
    <path d="M13 11H15V15H13V11Z" fill="currentColor" />
  </svg>
)

const AlertsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
      fill="currentColor"
    />
  </svg>
)

const QueueIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H18V18H2V2ZM4 4V16H16V4H4Z" fill="currentColor" />
    <path d="M6 6H8V8H6V6Z" fill="currentColor" />
    <path d="M10 6H14V8H10V6Z" fill="currentColor" />
    <path d="M6 10H8V12H6V10Z" fill="currentColor" />
    <path d="M10 10H14V12H10V10Z" fill="currentColor" />
    <path d="M6 14H8V16H6V14Z" fill="currentColor" />
    <path d="M10 14H14V16H10V14Z" fill="currentColor" />
  </svg>
)

interface TabNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "inventory", label: "Meter Inventory", icon: <InventoryIcon /> },
    { id: "readings", label: "Meter Readings", icon: <ReadingsIcon /> },
    { id: "alerts", label: "System Alerts", icon: <AlertsIcon /> },
    { id: "queue", label: "Installation Queue", icon: <QueueIcon /> },
  ]

  return (
    <div className="w-fit rounded-md bg-white px-2 py-2">
      <nav className="-mb-px flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap px-1 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "rounded-md bg-[#0a0a0a] px-2 text-[#FFFFFF]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
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
