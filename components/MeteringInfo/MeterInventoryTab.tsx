import React, { useState } from "react"
import { motion } from "framer-motion"
import { BatteryIcon, TamperIcon, WifiIcon } from "components/Icons/Icons"
import { SearchModule } from "components/ui/Search/search-module"

const MeterInventoryTab: React.FC = () => {
  const [searchText, setSearchText] = useState("")

  const handleCancelSearch = () => {
    setSearchText("")
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Meter Directory */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Meter Directory</h3>
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
            />
          </div>

          {/* Meter List */}
          <div className="space-y-4">
            {/* Meter Card 1 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">MTR001234567</h4>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      online
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Prepaid Smart
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-gray-900">John Adebayo</p>
                  <p className="text-sm text-gray-600">15 Victoria Street, Lagos Island</p>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">1850.5 kWh</p>
                    <p className="text-gray-500">2024-01-15 14:30</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm ">
                <div>
                  <p className="text-gray-500">Signal</p>
                  <p className="font-medium text-green-600">strong</p>
                </div>
                <div>
                  <div className="flex  gap-2">
                    <BatteryIcon />
                    <div>
                      <p className="text-gray-500">Battery</p>
                      <p className="font-medium text-green-600">85%</p>
                    </div>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <WifiIcon />
                  <div>
                    <p className="text-gray-500">Comm</p>
                    <p className="font-medium text-green-600">good</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <TamperIcon />
                  <div>
                    <p className="text-gray-500">Tamper</p>
                    <p className="font-medium text-green-600">normal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meter Card 2 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">MTR001234568</h4>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      online
                    </span>
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      Postpaid Smart
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-gray-900">Fatima Hassan</p>
                  <p className="text-sm text-gray-600">22 Allen Avenue, Ikeja</p>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">2245.8 kWh</p>
                    <p className="text-gray-500">2024-01-15 15:45</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm ">
                <div>
                  <p className="text-gray-500">Signal</p>
                  <p className="font-medium text-green-600">strong</p>
                </div>
                <div className="flex  gap-2">
                  <BatteryIcon />

                  <div>
                    <p className="text-gray-500">Battery</p>
                    <p className="font-medium text-green-600">92%</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <WifiIcon />

                  <div>
                    <p className="text-gray-500">Comm</p>
                    <p className="font-medium text-yellow-600">fair</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <TamperIcon />
                  <div>
                    <p className="text-gray-500">Tamper</p>
                    <p className="font-medium text-green-600">normal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meter Card 3 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">MTR001234569</h4>
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">offline</span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Prepaid Basic
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-gray-900">Chinedu Okafor</p>
                  <p className="text-sm text-gray-600">45 Ikotun Road, Alimosho</p>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">1420.2 kWh</p>
                    <p className="text-gray-500">2024-01-14 09:15</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm ">
                <div>
                  <p className="text-gray-500">Signal</p>
                  <p className="font-medium text-red-600">weak</p>
                </div>

                <div className="flex  gap-2">
                  <BatteryIcon />
                  <div>
                    <p className="text-gray-500">Battery</p>
                    <p className="font-medium text-red-600">15%</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <WifiIcon />
                  <div>
                    <p className="text-gray-500">Comm</p>
                    <p className="font-medium text-red-600">poor</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <TamperIcon />
                  <div>
                    <p className="text-gray-500">Tamper</p>
                    <p className="font-medium text-red-600">alert</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meter Card 4 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">MTR001234570</h4>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      online
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Conventional
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-gray-900">Aisha Bello</p>
                  <p className="text-sm text-gray-600">78 Surulere Way, Surulere</p>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">3120.7 kWh</p>
                    <p className="text-gray-500">2024-01-15 16:20</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm ">
                <div>
                  <p className="text-gray-500">Signal</p>
                  <p className="font-medium text-yellow-600">medium</p>
                </div>
                <div className="flex  gap-2">
                  <BatteryIcon />
                  <div>
                    <p className="text-gray-500">Battery</p>
                    <p className="font-medium text-green-600">78%</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <WifiIcon />
                  <div>
                    <p className="text-gray-500">Comm</p>
                    <p className="font-medium text-yellow-600">fair</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <TamperIcon />
                  <div>
                    <p className="text-gray-500">Tamper</p>
                    <p className="font-medium text-green-600">normal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meter Card 5 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">MTR001234571</h4>
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      maintenance
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Prepaid Smart
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-gray-900">Emeka Nwosu</p>
                  <p className="text-sm text-gray-600">33 Agege Motor Road, Agege</p>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">890.3 kWh</p>
                    <p className="text-gray-500">2024-01-13 11:45</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm ">
                <div>
                  <p className="text-gray-500">Signal</p>
                  <p className="font-medium text-red-600">weak</p>
                </div>
                <div className="flex  gap-2">
                  <BatteryIcon />
                  <div>
                    <p className="text-gray-500">Battery</p>
                    <p className="font-medium text-yellow-600">42%</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <WifiIcon />
                  <div>
                    <p className="text-gray-500">Comm</p>
                    <p className="font-medium text-red-600">poor</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <TamperIcon />
                  <div>
                    <p className="text-gray-500">Tamper</p>
                    <p className="font-medium text-green-600">normal</p>
                  </div>
                </div>
                <div className="flex  gap-2">
                  <TamperIcon />
                  <div>
                    <p className="text-gray-500">Tamper</p>
                    <p className="font-medium text-green-600">normal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Summary Cards */}
      </div>

      {/* Right Column - System Overview */}
      <div className="w-80">
        <div className="space-y-6">
          {/* Communication Health */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Communication Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Good (80%+)</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">65,420 meters</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700">Fair (50-80%)</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">18,230 meters</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700">Poor (Less than 50%)</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">5,770 meters</span>
              </div>
            </div>
          </div>

          {/* Today's Readings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Today&apos;s Readings</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">84,230</div>
              <p className="mt-2 text-sm text-gray-600">of 89,420 smart meters</p>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${(84230 / 89420) * 100}%` }}></div>
                </div>
                <p className="mt-2 text-sm font-medium text-green-600">
                  {((84230 / 89420) * 100).toFixed(1)}% Success Rate
                </p>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Online Meters</span>
                <span className="font-semibold text-green-600">116,135</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Offline Meters</span>
                <span className="font-semibold text-red-600">2,799</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Response Time</span>
                <span className="font-semibold text-blue-600">2.3s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data Completeness</span>
                <span className="font-semibold text-green-600">98.7%</span>
              </div>
            </div>
          </div>

          {/* Meter Health Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Meter Health Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Optimal Performance</span>
                  <span className="font-semibold text-green-600">112,458</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-gray-200">
                  <div className="h-1 rounded-full bg-green-500" style={{ width: "94.5%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Needs Maintenance</span>
                  <span className="font-semibold text-yellow-600">4,892</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-gray-200">
                  <div className="h-1 rounded-full bg-yellow-500" style={{ width: "4.1%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requires Replacement</span>
                  <span className="font-semibold text-red-600">1,584</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-gray-200">
                  <div className="h-1 rounded-full bg-red-500" style={{ width: "1.4%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MeterInventoryTab
