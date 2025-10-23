import React, { useState } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import {
  CustomeraIcon,
  DateIcon,
  MapIcon,
  PerformanceIcon,
  RouteIcon,
  StatusIcon,
  UserIcon,
} from "components/Icons/Icons"

interface Route {
  id: number
  name: string
  assignedTo: string
  status: "active" | "needs attention"
  customers: number
  coverage: string
  lastVisit: string
}

interface RouteManagementProps {
  onStartNewCycle?: () => void
}

const RouteManagement: React.FC<RouteManagementProps> = ({ onStartNewCycle }) => {
  const [searchText, setSearchText] = useState("")

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const routes: Route[] = [
    {
      id: 1,
      name: "Victoria Island Commercial",
      assignedTo: "Tunde Bakare",
      status: "active",
      customers: 142,
      coverage: "95.8%",
      lastVisit: "2024-01-15",
    },
    {
      id: 2,
      name: "Ikeja Residential Block A",
      assignedTo: "Amina Abdullahi",
      status: "active",
      customers: 198,
      coverage: "88.4%",
      lastVisit: "2024-01-14",
    },
    {
      id: 3,
      name: "Surulere Mixed Zone",
      assignedTo: "Emeka Okonkwo",
      status: "needs attention",
      customers: 176,
      coverage: "72.1%",
      lastVisit: "2024-01-13",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Route Management */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Route Management</h3>
            <SearchModule
              placeholder="Search routes..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
            />
          </div>

          {/* Routes List */}
          <div className="space-y-4">
            {/* Route 1 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <RouteIcon />
                      <h4 className="font-semibold text-gray-900">Victoria Island Commercial</h4>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      active
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <UserIcon />
                      <p className="mt-1 text-sm text-gray-600">Assigned to: Tunde Bakare</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div>
                  <div className="flex  gap-2">
                    <CustomeraIcon />
                    <div>
                      <p className="text-gray-500">Customers:</p>
                      <p className="font-medium text-green-600">146</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2">
                    <PerformanceIcon />
                    <div>
                      <p className="text-gray-500">Coverage:</p>
                      <p className="font-medium text-green-600">95.8%</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <DateIcon />
                  <div>
                    <p className="text-gray-500">Last Visit:</p>
                    <p className="font-medium text-green-600">2024-01-15</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Route 2 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <RouteIcon />
                      <h4 className="font-semibold text-gray-900">Ikeja Residential Block A</h4>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      active
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <UserIcon />
                      <p className="mt-1 text-sm text-gray-600">Assigned to: Amina Abdullahi</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div>
                  <div className="flex  gap-2">
                    <CustomeraIcon />
                    <div>
                      <p className="text-gray-500">Customers:</p>
                      <p className="font-medium text-green-600">196</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2">
                    <PerformanceIcon />
                    <div>
                      <p className="text-gray-500">Coverage:</p>
                      <p className="font-medium text-green-600">88.4%</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <DateIcon />
                  <div>
                    <p className="text-gray-500">Last Visit:</p>
                    <p className="font-medium text-green-600">2024-01-14</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Route 3 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <RouteIcon />
                      <h4 className="font-semibold text-gray-900">Surulere Mixed Zone</h4>
                    </div>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      needs attention
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <UserIcon />
                      <p className="mt-1 text-sm text-gray-600">Assigned to: Emeka Okonkwo</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div>
                  <div className="flex  gap-2">
                    <CustomeraIcon />
                    <div>
                      <p className="text-gray-500">Customers:</p>
                      <p className="font-medium text-green-600">176</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2">
                    <PerformanceIcon />
                    <div>
                      <p className="text-gray-500">Coverage:</p>
                      <p className="font-medium text-red-600">72.1%</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <DateIcon />
                  <div>
                    <p className="text-gray-500">Last Visit:</p>
                    <p className="font-medium text-green-600">2024-01-13</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RouteManagement
