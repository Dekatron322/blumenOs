import React from "react"

// Tab Icons
const MapViewIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.0582 11.8216L20.8982 11.6016C20.6182 11.2616 20.2882 10.9916 19.9082 10.7916C19.3982 10.5016 18.8182 10.3516 18.2182 10.3516H5.76824C5.16824 10.3516 4.59824 10.5016 4.07824 10.7916C3.68824 11.0016 3.33824 11.2916 3.04824 11.6516C2.47824 12.3816 2.20824 13.2816 2.29824 14.1816L2.66824 18.8516C2.79824 20.2616 2.96824 22.0016 6.13824 22.0016H17.8582C21.0282 22.0016 21.1882 20.2616 21.3282 18.8416L21.6982 14.1916C21.7882 13.3516 21.5682 12.5116 21.0582 11.8216ZM14.3882 17.3416H9.59824C9.20824 17.3416 8.89824 17.0216 8.89824 16.6416C8.89824 16.2616 9.20824 15.9416 9.59824 15.9416H14.3882C14.7782 15.9416 15.0882 16.2616 15.0882 16.6416C15.0882 17.0316 14.7782 17.3416 14.3882 17.3416Z"
      fill="currentColor"
    />
    <path
      d="M20.56 8.59643C20.5976 8.97928 20.1823 9.23561 19.8175 9.11348C19.3127 8.94449 18.7814 8.86 18.2289 8.86H5.76891C5.21206 8.86 4.66381 8.95012 4.15225 9.12194C3.79185 9.24298 3.37891 8.99507 3.37891 8.61489V6.66C3.37891 3.09 4.46891 2 8.03891 2H9.21891C10.6489 2 11.0989 2.46 11.6789 3.21L12.8789 4.81C13.1289 5.15 13.1389 5.17 13.5789 5.17H15.9589C19.0846 5.17 20.3059 6.00724 20.56 8.59643Z"
      fill="currentColor"
    />
  </svg>
)

const TableViewIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 2H7C4 2 3 3.79 3 6V22H21V6C21 3.79 20 2 17 2ZM10 17.25H7C6.59 17.25 6.25 16.91 6.25 16.5C6.25 16.09 6.59 15.75 7 15.75H10C10.41 15.75 10.75 16.09 10.75 16.5C10.75 16.91 10.41 17.25 10 17.25ZM10 12.75H7C6.59 12.75 6.25 12.41 6.25 12C6.25 11.59 6.59 11.25 7 11.25H10C10.41 11.25 10.75 11.59 10.75 12C10.75 12.41 10.41 12.75 10 12.75ZM10 8.25H7C6.59 8.25 6.25 7.91 6.25 7.5C6.25 7.09 6.59 6.75 7 6.75H10C10.41 6.75 10.75 7.09 10.75 7.5C10.75 7.91 10.41 8.25 10 8.25ZM17 17.25H14C13.59 17.25 13.25 16.91 13.25 16.5C13.25 16.09 13.59 15.75 14 15.75H17C17.41 15.75 17.75 16.09 17.75 16.5C17.75 16.91 17.41 17.25 17 17.25ZM17 12.75H14C13.59 12.75 13.25 12.41 13.25 12C13.25 11.59 13.59 11.25 14 11.25H17C17.41 11.25 17.75 11.59 17.75 12C17.75 12.41 17.41 12.75 17 12.75ZM17 8.25H14C13.59 8.25 13.25 7.91 13.25 7.5C13.25 7.09 13.59 6.75 14 6.75H17C17.41 6.75 17.75 7.09 17.75 7.5C17.75 7.91 17.41 8.25 17 8.25Z"
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
    { id: "map-view", label: "Map View", icon: <MapViewIcon /> },
    { id: "table-view", label: "Table View", icon: <TableViewIcon /> },
  ]

  return (
    <div className="w-fit rounded-md bg-white p-2">
      <nav className="-mb-px flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
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
