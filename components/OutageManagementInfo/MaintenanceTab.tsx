import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"

// Types
interface Maintenance {
  id: string
  title: string
  description: string
  equipment: string
  location: string
  type: "preventive" | "corrective" | "emergency" | "scheduled"
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  scheduledDate: string
  startTime?: string
  endTime?: string
  assignedTeam: string
  estimatedDuration: number
  actualDuration?: number
  cost: number
  notes?: string
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
const mockMaintenance: Maintenance[] = [
  {
    id: "MAINT-001",
    title: "Transformer Maintenance - Kaduna Central",
    description: "Routine maintenance and inspection of main transformer",
    equipment: "Transformer T-001",
    location: "Kaduna Central Substation",
    type: "preventive",
    status: "scheduled",
    priority: "medium",
    scheduledDate: "2024-01-20T08:00:00Z",
    assignedTeam: "Maintenance Team A",
    estimatedDuration: 480,
    cost: 150000,
  },
  {
    id: "MAINT-002",
    title: "Cable Replacement - Barnawa",
    description: "Replace faulty underground cable causing intermittent outages",
    equipment: "Underground Cable UC-002",
    location: "Barnawa District",
    type: "corrective",
    status: "in_progress",
    priority: "high",
    scheduledDate: "2024-01-15T06:00:00Z",
    startTime: "2024-01-15T06:30:00Z",
    assignedTeam: "Maintenance Team B",
    estimatedDuration: 360,
    cost: 250000,
  },
  {
    id: "MAINT-003",
    title: "Switchgear Inspection",
    description: "Annual inspection and testing of switchgear equipment",
    equipment: "Switchgear SG-003",
    location: "Rigasa Substation",
    type: "scheduled",
    status: "completed",
    priority: "low",
    scheduledDate: "2024-01-10T09:00:00Z",
    startTime: "2024-01-10T09:15:00Z",
    endTime: "2024-01-10T15:45:00Z",
    assignedTeam: "Maintenance Team C",
    estimatedDuration: 360,
    actualDuration: 390,
    cost: 75000,
    notes: "All tests passed. Equipment in good condition.",
  },
]

const MaintenanceTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedMaintenance, _setSelectedMaintenance] = useState<Maintenance | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const maintenance = mockMaintenance
  const totalRecords = maintenance.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Maintenance["status"]) => {
    switch (status) {
      case "scheduled":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "in_progress":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "completed":
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

  const getTypeStyle = (type: Maintenance["type"]) => {
    switch (type) {
      case "preventive":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "corrective":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "emergency":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "scheduled":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getPriorityStyle = (priority: Maintenance["priority"]) => {
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

  const filteredMaintenance = maintenance.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.equipment.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase())
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load maintenance data</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Maintenance Management</h3>
          <p className="text-sm text-gray-500">Schedule and track equipment maintenance</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search maintenance..."
            value={searchText}
            onChange={handleSearch}
            className="w-80"
          />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">
            Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Maintenance Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Equipment & Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type & Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Schedule & Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredMaintenance.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                  <div className="text-sm text-gray-500">ID: {item.id}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{item.equipment}</div>
                  <div className="text-sm text-gray-500">{item.location}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className="inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium"
                      style={getTypeStyle(item.type)}
                    >
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    <span
                      className="inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium"
                      style={getPriorityStyle(item.priority)}
                    >
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getStatusStyle(item.status)}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    Scheduled: {new Date(item.scheduledDate).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Est. Duration: {formatDuration(item.estimatedDuration)}
                  </div>
                  {item.actualDuration && (
                    <div className="text-sm text-gray-500">
                      Actual: {formatDuration(item.actualDuration)}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">Team: {item.assignedTeam}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
                      View
                    </button>
                    <button className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                      Update
                    </button>
                    {item.status === "completed" && (
                      <button className="rounded-md bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200">
                        Report
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

export default MaintenanceTab
