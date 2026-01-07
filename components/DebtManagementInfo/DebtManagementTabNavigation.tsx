import { ChevronDown } from "lucide-react"
import React, { useState } from "react"

// Tab Icons
const DebtSummaryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CustomersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const DebtEntriesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 14h6m-6-4h6m2 8h.01M9 18h.01M12 2v4m0 12v4M4.93 4.93l2.83 2.83m11.32 11.32l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m11.32-11.32l2.83-2.83"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

interface DebtManagementTabNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const DebtManagementTabNavigation: React.FC<DebtManagementTabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "Customers",
      label: "Debt Management Customers",
      icon: <CustomersIcon />,
    },
    {
      id: "DebtEntries",
      label: "All Debt Entries",
      icon: <DebtEntriesIcon />,
    },
  ]

  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]

  if (!activeTabConfig) {
    return null
  }

  return (
    <div className="relative w-full md:w-fit">
      {/* Mobile: dropdown trigger */}
      <div className="flex w-full items-center justify-between rounded-md bg-white p-2 md:hidden">
        <button
          type="button"
          className="flex flex-1 items-center justify-between gap-2 rounded-md px-2 py-1 text-sm font-medium text-gray-800"
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <span className="flex items-center gap-2">
            {activeTabConfig.icon}
            <span>{activeTabConfig.label}</span>
          </span>
          <span
            className={`inline-block transform text-xs text-gray-500 transition-transform duration-200 ${
              isMobileOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <ChevronDown />
          </span>
        </button>
      </div>

      {/* Mobile: popover list */}
      {isMobileOpen && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-white p-1 shadow-md md:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setIsMobileOpen(false)
              }}
              className={`flex w-full items-center gap-2 whitespace-nowrap rounded-md p-2 text-left text-sm font-medium transition-all duration-150 ${
                activeTab === tab.id ? "bg-[#004B23] text-white" : "text-gray-600 hover:bg-[#F6F6F9]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Desktop: horizontal tab list */}
      <div className="hidden rounded-md bg-white p-2 md:block">
        <nav className="-mb-px flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                activeTab === tab.id
                  ? " bg-[#004B23]  text-[#FFFFFF]"
                  : " border-transparent  text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700 "
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default DebtManagementTabNavigation
