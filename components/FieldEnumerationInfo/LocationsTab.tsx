import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"

// Types
interface Location {
  id: string
  name: string
  address: string
  coordinates: {
    latitude: number
    longitude: number
  }
  region: string
  district: string
  type: "substation" | "feeder" | "transformer" | "customer"
  status: "operational" | "maintenance" | "faulty"
  metersCount: number
  customersCount: number
  lastInspection: string
  nextInspection: string
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
const mockLocations: Location[] = [
  {
    id: "LOC-001",
    name: "Kaduna Central Substation",
    address: "123 Central Area, Kaduna",
    coordinates: {
      latitude: 10.5200,
      longitude: 7.4382,
    },
    region: "North Central",
    district: "Kaduna Central",
    type: "substation",
    status: "operational",
    metersCount: 150,
    customersCount: 120,
    lastInspection: "2024-01-10",
    nextInspection: "2024-04-10",
  },
  {
    id: "LOC-002",
    name: "Barnawa Feeder",
    address: "456 Barnawa District, Kaduna",
    coordinates: {
      latitude: 10.4800,
      longitude: 7.4200,
    },
    region: "North Central",
    district: "Barnawa",
    type: "feeder",
    status: "operational",
    metersCount: 75,
    customersCount: 65,
    lastInspection: "2024-01-15",
    nextInspection: "2024-04-15",
  },
  {
    id: "LOC-003",
    name: "Rigasa Transformer Station",
    address: "789 Rigasa Area, Kaduna",
    coordinates: {
      latitude: 10.5500,
      longitude: 7.4500,
    },
    region: "North Central",
    district: "Rigasa",
    type: "transformer",
    status: "maintenance",
    metersCount: 45,
    customersCount: 40,
    lastInspection: "2024-01-05",
    nextInspection: "2024-02-05",
  },
]

const LocationsTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedLocation, _setSelectedLocation] = useState<Location | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const locations = mockLocations
  const totalRecords = locations.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Location["status"]) => {
    switch (status) {
      case "operational":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
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

  const getTypeStyle = (type: Location["type"]) => {
    switch (type) {
      case "substation":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "feeder":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "transformer":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case "customer":
        return {
          backgroundColor: "#F3E8FF",
          color: "#7C3AED",
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

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchText.toLowerCase()) ||
    location.address.toLowerCase().includes(searchText.toLowerCase()) ||
    location.region.toLowerCase().includes(searchText.toLowerCase()) ||
    location.district.toLowerCase().includes(searchText.toLowerCase())
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load locations data</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Location Management</h3>
          <p className="text-sm text-gray-500">Manage geographical locations and infrastructure</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search locations..."
            value={searchText}
            onChange={handleSearch}
            className="w-80"
          />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">
            Add Location
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Location Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Address & Coordinates
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type & Region
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Statistics
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredLocations.map((location) => (
              <tr key={location.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <span className="text-sm font-medium text-green-600">
                          {location.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {location.name}
                      </div>
                      <div className="text-sm text-gray-500">ID: {location.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{location.address}</div>
                  <div className="text-sm text-gray-500">
                    {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className="inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium"
                      style={getTypeStyle(location.type)}
                    >
                      {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                    </span>
                    <div className="text-sm text-gray-500">{location.region}</div>
                    <div className="text-sm text-gray-500">{location.district}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getStatusStyle(location.status)}
                  >
                    {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {location.metersCount} meters
                  </div>
                  <div className="text-sm text-gray-500">
                    {location.customersCount} customers
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
                      View
                    </button>
                    <button className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                      Edit
                    </button>
                    <button className="rounded-md bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200">
                      Map
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

export default LocationsTab
