import React, { useState } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import {
  AddAgentIcon,
  BillsIcon,
  CycleIcon,
  DateIcon,
  FloatIcon,
  MapIcon,
  PerformanceIcon,
  PhoneIcon,
  RateIcon,
  RevenueGeneratedIcon,
  RouteIcon,
  StatusIcon,
  TargetIcon,
  UserIcon,
} from "components/Icons/Icons"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface Agent {
  id: number
  name: string
  status: "active" | "inactive" | "low float"
  phone: string
  location: string
  dailyCollection: string
  vendsToday: number
  floatBalance: string
  commissionRate: string
  performance: "Excellent" | "Good" | "Average" | "Poor"
}

interface AgentDirectoryProps {
  onStartNewCycle?: () => void
}

const AgentDirectory: React.FC<AgentDirectoryProps> = ({ onStartNewCycle }) => {
  const [searchText, setSearchText] = useState("")

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const agents: Agent[] = [
    {
      id: 1,
      name: "Tunde Bakare",
      status: "active",
      phone: "+234801234567",
      location: "Lagos Island",
      dailyCollection: "₦12,500",
      vendsToday: 45,
      floatBalance: "₦850",
      commissionRate: "2.5%",
      performance: "Good",
    },
    {
      id: 2,
      name: "Amina Abdullahi",
      status: "active",
      phone: "+234802345678",
      location: "Ikeja",
      dailyCollection: "₦9,800",
      vendsToday: 38,
      floatBalance: "₦1,200",
      commissionRate: "2.5%",
      performance: "Good",
    },
    {
      id: 3,
      name: "Emeka Okonkwo",
      status: "low float",
      phone: "+234803456789",
      location: "Surulere",
      dailyCollection: "₦7,500",
      vendsToday: 28,
      floatBalance: "₦450",
      commissionRate: "2%",
      performance: "Good",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Agent Directory */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Agent Directory</h3>
            <SearchModule
              placeholder="Search agents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
            />
          </div>

          {/* Agents List */}
          <div className="space-y-4">
            {/* Agent 1 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <UserIcon />
                      <h4 className="font-semibold text-gray-900">Tunde Bakare</h4>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      active
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <PhoneIcon />
                      <p className="mt-1 text-sm text-gray-600">+234801234567</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {" "}
                      <MapIcon />
                      <p className="text-sm text-gray-600">Lagos Island</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">₦12,500</p>
                    <p className="text-gray-500">45 vends today</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <BillsIcon />
                    <p className="text-gray-500">Float Balance:</p>
                  </div>
                  <p className="font-medium text-green-600">₦850</p>
                </div>
                <div>
                  <div className="flex gap-2">
                    <RateIcon />
                    <div>
                      <p className="text-gray-500">Commission Rate:</p>
                      <p className="font-medium text-green-600">2.5%</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <PerformanceIcon />
                  <div>
                    <p className="text-gray-500">Performance:</p>
                    <p className="font-medium text-green-600">Good</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent 2 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <UserIcon />
                      <h4 className="font-semibold text-gray-900">Amina Abdullahi</h4>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      active
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <PhoneIcon />
                      <p className="mt-1 text-sm text-gray-600">+234801234567</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {" "}
                      <MapIcon />
                      <p className="text-sm text-gray-600">Lagos Island</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">₦9,800</p>
                    <p className="text-gray-500">38 vends today</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <BillsIcon />
                    <p className="text-gray-500">Float Balance:</p>
                  </div>
                  <p className="font-medium text-green-600">₦1,200</p>
                </div>
                <div>
                  <div className="flex gap-2">
                    <RateIcon />
                    <div>
                      <p className="text-gray-500">Commission Rate:</p>
                      <p className="font-medium text-green-600">2.5%</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <PerformanceIcon />
                  <div>
                    <p className="text-gray-500">Performance:</p>
                    <p className="font-medium text-green-600">Good</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent 3 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <UserIcon />
                      <h4 className="font-semibold text-gray-900">Emeka Okonkwo</h4>
                    </div>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      low float
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <PhoneIcon />
                      <p className="mt-1 text-sm text-gray-600">+234803456789</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapIcon />
                      <p className="text-sm text-gray-600">Surulere</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">₦7,500</p>
                    <p className="text-gray-500">28 vends today</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <BillsIcon />
                    <p className="text-gray-500">Float Balance:</p>
                  </div>
                  <p className="font-medium text-red-600">₦450</p>
                </div>
                <div>
                  <div className="flex gap-2">
                    <RateIcon />
                    <div>
                      <p className="text-gray-500">Commission Rate:</p>
                      <p className="font-medium text-green-600">2%</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <PerformanceIcon />
                  <div>
                    <p className="text-gray-500">Performance:</p>
                    <p className="font-medium text-green-600">Good</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Quick Actions */}
      <div className="w-80">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <AddAgentIcon />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Register New Agent</h4>
                    <p className="text-sm text-gray-600">Add a new field agent</p>
                  </div>
                </div>
              </button>

              <button className="w-full rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <RouteIcon />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Assign Routes</h4>
                    <p className="text-sm text-gray-600">Manage agent territories</p>
                  </div>
                </div>
              </button>

              <button className="w-full rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm ">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <FloatIcon />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Float Management</h4>
                    <p className="text-sm text-gray-600">Manage agent floats</p>
                  </div>
                </div>
              </button>

              <button className="w-full rounded-lg border border-gray-200 bg-[#f9f9f9]  p-4 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2">
                    <TargetIcon />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Set Targets</h4>
                    <p className="text-sm text-gray-600">Define performance goals</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AgentDirectory
