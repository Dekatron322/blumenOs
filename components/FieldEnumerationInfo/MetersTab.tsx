import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"

// Types
interface Meter {
  id: string
  serialNumber: string
  type: string
  manufacturer: string
  model: string
  installationDate: string
  location: string
  status: "active" | "inactive" | "maintenance" | "faulty"
  lastReading: number
  customerId: string
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
const mockMeters: Meter[] = [
  {
    id: "MTR-001",
    serialNumber: "SN123456789",
    type: "Prepaid",
    manufacturer: "Landis+Gyr",
    model: "E650",
    installationDate: "2023-01-15",
    location: "Kaduna Central",
    status: "active",
    lastReading: 1250,
    customerId: "CUST-001",
  },
  {
    id: "MTR-002",
    serialNumber: "SN987654321",
    type: "Postpaid",
    manufacturer: "Itron",
    model: "ACE6000",
    installationDate: "2023-02-20",
    location: "Barnawa",
    status: "active",
    lastReading: 890,
    customerId: "CUST-002",
  },
  {
    id: "MTR-003",
    serialNumber: "SN456789123",
    type: "Prepaid",
    manufacturer: "Elster",
    model: "A1700",
    installationDate: "2023-03-10",
    location: "Rigasa",
    status: "maintenance",
    lastReading: 2100,
    customerId: "CUST-003",
  },
]

const MetersTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedMeter, _setSelectedMeter] = useState<Meter | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const meters = mockMeters
  const totalRecords = meters.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Meter["status"]) => {
    switch (status) {
      case "active":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "inactive":
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      case "maintenance":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "faulty":
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

  const _toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const filteredMeters = meters.filter((meter) =>
    meter.serialNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    meter.type.toLowerCase().includes(searchText.toLowerCase()) ||
    meter.location.toLowerCase().includes(searchText.toLowerCase())
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load meters data</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Meters Management</h3>
          <p className="text-sm text-gray-500">Manage and monitor electricity meters</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search meters..."
            value={searchText}
            onChange={handleSearch}
            className="w-80"
          />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">
            Add Meter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Meter Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type & Manufacturer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Last Reading
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredMeters.map((meter) => (
              <tr key={meter.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-medium text-blue-600">
                          {meter.serialNumber.slice(-2)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {meter.serialNumber}
                      </div>
                      <div className="text-sm text-gray-500">ID: {meter.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{meter.type}</div>
                  <div className="text-sm text-gray-500">{meter.manufacturer} {meter.model}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{meter.location}</div>
                  <div className="text-sm text-gray-500">Installed: {meter.installationDate}</div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getStatusStyle(meter.status)}
                  >
                    {meter.status.charAt(0).toUpperCase() + meter.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{meter.lastReading.toLocaleString()} kWh</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
                      View
                    </button>
                    <button className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                      Edit
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

export default MetersTab
