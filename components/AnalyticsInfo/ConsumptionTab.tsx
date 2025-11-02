import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"

// Types
interface ConsumptionData {
  id: string
  period: string
  totalConsumption: number
  residentialConsumption: number
  commercialConsumption: number
  industrialConsumption: number
  peakDemand: number
  averageDemand: number
  loadFactor: number
  customerCount: number
  averageConsumption: number
}

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
                <div className="mt-1 h-3 w-24 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 rounded bg-gray-200"></div>
              <div className="h-8 w-16 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Mock data
const mockConsumptionData: ConsumptionData[] = [
  {
    id: "CONS-001",
    period: "January 2024",
    totalConsumption: 1500000,
    residentialConsumption: 900000,
    commercialConsumption: 450000,
    industrialConsumption: 150000,
    peakDemand: 2500,
    averageDemand: 2000,
    loadFactor: 80.0,
    customerCount: 1500,
    averageConsumption: 1000,
  },
  {
    id: "CONS-002",
    period: "February 2024",
    totalConsumption: 1650000,
    residentialConsumption: 990000,
    commercialConsumption: 495000,
    industrialConsumption: 165000,
    peakDemand: 2750,
    averageDemand: 2200,
    loadFactor: 80.0,
    customerCount: 1520,
    averageConsumption: 1086,
  },
  {
    id: "CONS-003",
    period: "March 2024",
    totalConsumption: 1800000,
    residentialConsumption: 1080000,
    commercialConsumption: 540000,
    industrialConsumption: 180000,
    peakDemand: 3000,
    averageDemand: 2400,
    loadFactor: 80.0,
    customerCount: 1550,
    averageConsumption: 1161,
  },
]

const ConsumptionTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedPeriod, _setSelectedPeriod] = useState<ConsumptionData | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const consumptionData = mockConsumptionData
  const totalRecords = consumptionData.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getLoadFactorStyle = (factor: number) => {
    if (factor >= 80) {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    } else if (factor >= 70) {
      return {
        backgroundColor: "#FEF6E6",
        color: "#D97706",
      }
    } else {
      return {
        backgroundColor: "#F7EDED",
        color: "#AF4B4B",
      }
    }
  }

  const _toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const filteredConsumptionData = consumptionData.filter((data) =>
    data.period.toLowerCase().includes(searchText.toLowerCase())
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load consumption data</p>
          <button className="mt-2 text-blue-600 hover:underline">Try again</button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border bg-white p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Consumption Analytics</h3>
          <p className="text-sm text-gray-500">Energy consumption patterns and analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search periods..."
            value={searchText}
            onChange={handleSearch}
            className="w-80"
          />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">
            Export Report
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Consumption
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Residential
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Commercial
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Industrial
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Load Factor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredConsumptionData.map((data) => (
              <tr key={data.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{data.period}</div>
                  <div className="text-sm text-gray-500">{data.customerCount} customers</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {data.totalConsumption.toLocaleString()} kWh
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg: {data.averageConsumption.toLocaleString()} kWh
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {data.residentialConsumption.toLocaleString()} kWh
                  </div>
                  <div className="text-sm text-gray-500">
                    {((data.residentialConsumption / data.totalConsumption) * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {data.commercialConsumption.toLocaleString()} kWh
                  </div>
                  <div className="text-sm text-gray-500">
                    {((data.commercialConsumption / data.totalConsumption) * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {data.industrialConsumption.toLocaleString()} kWh
                  </div>
                  <div className="text-sm text-gray-500">
                    {((data.industrialConsumption / data.totalConsumption) * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getLoadFactorStyle(data.loadFactor)}
                  >
                    {data.loadFactor.toFixed(1)}%
                  </span>
                  <div className="text-sm text-gray-500">
                    Peak: {data.peakDemand}kW | Avg: {data.averageDemand}kW
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
                      View Details
                    </button>
                    <button className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                      Export
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRecords={totalRecords}
          pageSize={pageSize}
        />
      </div>
    </motion.div>
  )
}

export default ConsumptionTab
