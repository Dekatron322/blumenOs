import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"

// Types
interface PerformanceData {
  id: string
  metric: string
  currentValue: number
  previousValue: number
  targetValue: number
  unit: string
  status: "excellent" | "good" | "average" | "poor"
  trend: "up" | "down" | "stable"
  changePercentage: number
  description: string
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
const mockPerformanceData: PerformanceData[] = [
  {
    id: "PERF-001",
    metric: "System Availability",
    currentValue: 99.2,
    previousValue: 98.8,
    targetValue: 99.0,
    unit: "%",
    status: "excellent",
    trend: "up",
    changePercentage: 0.4,
    description: "Overall system uptime and reliability",
  },
  {
    id: "PERF-002",
    metric: "Customer Satisfaction",
    currentValue: 4.6,
    previousValue: 4.4,
    targetValue: 4.5,
    unit: "/5",
    status: "excellent",
    trend: "up",
    changePercentage: 4.5,
    description: "Customer satisfaction rating based on surveys",
  },
  {
    id: "PERF-003",
    metric: "Revenue Collection Rate",
    currentValue: 96.5,
    previousValue: 95.2,
    targetValue: 95.0,
    unit: "%",
    status: "excellent",
    trend: "up",
    changePercentage: 1.4,
    description: "Percentage of billed revenue collected",
  },
  {
    id: "PERF-004",
    metric: "Average Response Time",
    currentValue: 2.3,
    previousValue: 2.8,
    targetValue: 3.0,
    unit: "hours",
    status: "good",
    trend: "up",
    changePercentage: -17.9,
    description: "Average time to respond to customer complaints",
  },
  {
    id: "PERF-005",
    metric: "Energy Loss Rate",
    currentValue: 8.2,
    previousValue: 8.5,
    targetValue: 8.0,
    unit: "%",
    status: "average",
    trend: "up",
    changePercentage: -3.5,
    description: "Technical and commercial energy losses",
  },
]

const PerformanceTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedMetric, _setSelectedMetric] = useState<PerformanceData | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const performanceData = mockPerformanceData
  const totalRecords = performanceData.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: PerformanceData["status"]) => {
    switch (status) {
      case "excellent":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "good":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "average":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "poor":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getTrendStyle = (trend: PerformanceData["trend"]) => {
    switch (trend) {
      case "up":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "down":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "stable":
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
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

  const filteredPerformanceData = performanceData.filter((data) =>
    data.metric.toLowerCase().includes(searchText.toLowerCase()) ||
    data.description.toLowerCase().includes(searchText.toLowerCase())
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load performance data</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
          <p className="text-sm text-gray-500">Key performance indicators and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search metrics..."
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
                Metric
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Current Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Target Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Trend
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredPerformanceData.map((data) => (
              <tr key={data.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{data.metric}</div>
                  <div className="text-sm text-gray-500">{data.description}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {data.currentValue}{data.unit}
                  </div>
                  <div className="text-sm text-gray-500">
                    Previous: {data.previousValue}{data.unit}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {data.targetValue}{data.unit}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getStatusStyle(data.status)}
                  >
                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getTrendStyle(data.trend)}
                  >
                    {data.trend.charAt(0).toUpperCase() + data.trend.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className={`text-sm font-medium ${
                    data.changePercentage > 0 ? 'text-green-600' : 
                    data.changePercentage < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {data.changePercentage > 0 ? '+' : ''}{data.changePercentage.toFixed(1)}%
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

export default PerformanceTab
