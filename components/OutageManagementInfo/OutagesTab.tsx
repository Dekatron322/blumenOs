import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"

// Types
interface Outage {
  id: string
  title: string
  description: string
  location: string
  affectedCustomers: number
  startTime: string
  estimatedRestoration: string
  actualRestoration?: string
  status: "reported" | "investigating" | "repairing" | "restored" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  cause: string
  assignedTeam: string
  reportedBy: string
  estimatedDuration: number
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
const mockOutages: Outage[] = [
  {
    id: "OUT-001",
    title: "Power Outage - Kaduna Central",
    description: "Complete power outage affecting the entire Kaduna Central area",
    location: "Kaduna Central",
    affectedCustomers: 150,
    startTime: "2024-01-15T08:30:00Z",
    estimatedRestoration: "2024-01-15T12:00:00Z",
    status: "repairing",
    priority: "critical",
    cause: "Transformer failure",
    assignedTeam: "Team Alpha",
    reportedBy: "Customer Service",
    estimatedDuration: 240,
  },
  {
    id: "OUT-002",
    title: "Partial Outage - Barnawa",
    description: "Partial power outage affecting residential areas in Barnawa",
    location: "Barnawa District",
    affectedCustomers: 45,
    startTime: "2024-01-15T14:20:00Z",
    estimatedRestoration: "2024-01-15T18:00:00Z",
    status: "investigating",
    priority: "high",
    cause: "Cable fault",
    assignedTeam: "Team Beta",
    reportedBy: "Field Engineer",
    estimatedDuration: 180,
  },
  {
    id: "OUT-003",
    title: "Voltage Fluctuation - Rigasa",
    description: "Voltage fluctuation causing equipment damage",
    location: "Rigasa Area",
    affectedCustomers: 25,
    startTime: "2024-01-15T10:15:00Z",
    estimatedRestoration: "2024-01-15T16:00:00Z",
    actualRestoration: "2024-01-15T15:30:00Z",
    status: "restored",
    priority: "medium",
    cause: "Load imbalance",
    assignedTeam: "Team Gamma",
    reportedBy: "Customer Complaint",
    estimatedDuration: 300,
  },
]

const OutagesTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedOutage, _setSelectedOutage] = useState<Outage | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const outages = mockOutages
  const totalRecords = outages.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Outage["status"]) => {
    switch (status) {
      case "reported":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case "investigating":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "repairing":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "restored":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "cancelled":
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

  const getPriorityStyle = (priority: Outage["priority"]) => {
    switch (priority) {
      case "critical":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "high":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "medium":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "low":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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

  const filteredOutages = outages.filter((outage) =>
    outage.title.toLowerCase().includes(searchText.toLowerCase()) ||
    outage.location.toLowerCase().includes(searchText.toLowerCase()) ||
    outage.cause.toLowerCase().includes(searchText.toLowerCase())
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load outages data</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Outage Management</h3>
          <p className="text-sm text-gray-500">Track and manage power outages</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search outages..."
            value={searchText}
            onChange={handleSearch}
            className="w-80"
          />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">
            Report Outage
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Outage Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Location & Impact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status & Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Timeline
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cause & Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredOutages.map((outage) => (
              <tr key={outage.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{outage.title}</div>
                  <div className="text-sm text-gray-500">{outage.description}</div>
                  <div className="text-sm text-gray-500">ID: {outage.id}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{outage.location}</div>
                  <div className="text-sm text-gray-500">{outage.affectedCustomers} customers affected</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className="inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium"
                      style={getStatusStyle(outage.status)}
                    >
                      {outage.status.charAt(0).toUpperCase() + outage.status.slice(1)}
                    </span>
                    <span
                      className="inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium"
                      style={getPriorityStyle(outage.priority)}
                    >
                      {outage.priority.charAt(0).toUpperCase() + outage.priority.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    Started: {new Date(outage.startTime).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Est. Duration: {formatDuration(outage.estimatedDuration)}
                  </div>
                  {outage.actualRestoration && (
                    <div className="text-sm text-green-600">
                      Restored: {new Date(outage.actualRestoration).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{outage.cause}</div>
                  <div className="text-sm text-gray-500">Team: {outage.assignedTeam}</div>
                  <div className="text-sm text-gray-500">Reported by: {outage.reportedBy}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
                      View
                    </button>
                    <button className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                      Update
                    </button>
                    {outage.status === "restored" && (
                      <button className="rounded-md bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200">
                        Close
                      </button>
                    )}
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

export default OutagesTab
