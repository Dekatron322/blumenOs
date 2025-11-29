"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { MapIcon } from "components/Icons/Icons"
import { clearFilters, fetchMaintenances, setFilters, setPagination } from "lib/redux/maintenanceSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { ButtonModule } from "components/ui/Button/Button"

const MaintenanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path
      d="M15.66 6.34L10 0.68V4H8V0.68L2.34 6.34L3.76 7.76L8 3.52V6H10V3.52L14.24 7.76L15.66 6.34Z"
      fill="currentColor"
    />
  </svg>
)

interface Maintenance {
  id: number
  referenceCode: string
  title: string
  type: number
  priority: number
  status: number
  scope: number
  distributionSubstationId: number
  feederId: number
  distributionSubstationName: string
  feederName: string
  affectedCustomerCount: number
  scheduledStartAt: string
  scheduledEndAt: string
  actualStartAt: string
  completedAt: string
  durationHours: number
}

interface MaintenanceTabProps {
  onViewMaintenanceDetails?: (maintenance: Maintenance) => void
}

const MaintenanceTab: React.FC<MaintenanceTabProps> = ({ onViewMaintenanceDetails }) => {
  const [searchText, setSearchText] = useState("")
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Get state from Redux store
  const { maintenances, loading, error, pagination, filters } = useAppSelector((state) => state.maintenances)

  console.log("MaintenanceTab Redux State:", {
    maintenancesCount: maintenances?.length,
    loading,
    error,
    pagination,
    filters,
  })

  // Fetch maintenances on component mount and when filters/pagination change
  useEffect(() => {
    console.log("MaintenanceTab useEffect triggered - fetching maintenances...")

    const fetchMaintenanceData = async () => {
      const requestParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...filters,
        ...(searchText && { search: searchText }),
      }

      console.log("MaintenanceTab Dispatching fetchMaintenances with params:", requestParams)

      const result = await dispatch(fetchMaintenances(requestParams))

      console.log("MaintenanceTab Fetch result:", result)

      if (fetchMaintenances.fulfilled.match(result)) {
        console.log("MaintenanceTab fetched successfully:", result.payload.data?.length)
      } else if (fetchMaintenances.rejected.match(result)) {
        console.error("MaintenanceTab failed to fetch maintenances:", result.error)
      }
    }

    fetchMaintenanceData()
  }, [dispatch, pagination.currentPage, pagination.pageSize, filters, searchText])

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text)
    if (text.trim()) {
      dispatch(setFilters({ search: text.trim() }))
    } else {
      dispatch(clearFilters())
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(clearFilters())
  }

  // Helper functions for mapping API values to display values
  const getStatusText = (status: number): string => {
    const statusMap: { [key: number]: string } = {
      1: "Scheduled",
      2: "In Progress",
      3: "Completed",
      4: "Cancelled",
      5: "Cancelled",
    }
    return statusMap[status] || "Scheduled"
  }

  const getTypeText = (type: number): string => {
    const typeMap: { [key: number]: string } = {
      1: "Preventive",
      2: "Corrective",
      3: "Emergency",
    }
    return typeMap[type] || "Scheduled"
  }

  const getPriorityText = (priority: number): string => {
    const priorityMap: { [key: number]: string } = {
      1: "Low",
      2: "Medium",
      3: "High",
      4: "Critical",
    }
    return priorityMap[priority] || "Medium"
  }

  const getScopeText = (scope: number): string => {
    const scopeMap: { [key: number]: string } = {
      1: "Local",
      2: "Regional",
    }
    return scopeMap[scope] || "Local"
  }

  const getStatusStyle = (status: number) => {
    const statusMap: { [key: number]: string } = {
      1: "bg-blue-100 text-blue-800", // Scheduled
      2: "bg-yellow-100 text-yellow-800", // In Progress
      3: "bg-green-100 text-green-800", // Completed
      4: "bg-gray-100 text-gray-800", // Cancelled
      5: "bg-gray-100 text-gray-800", // Cancelled
    }
    return statusMap[status] || statusMap[1]
  }

  const getTypeStyle = (type: number) => {
    const typeMap: { [key: number]: string } = {
      1: "bg-green-100 text-green-800", // Preventive
      2: "bg-red-100 text-red-800", // Corrective
      3: "bg-orange-100 text-orange-800", // Emergency
    }
    return typeMap[type] || "bg-blue-100 text-blue-800"
  }

  const getPriorityStyle = (priority: number) => {
    const priorityMap: { [key: number]: string } = {
      1: "bg-green-100 text-green-800", // Low
      2: "bg-blue-100 text-blue-800", // Medium
      3: "bg-yellow-100 text-yellow-800", // High
      4: "bg-red-100 text-red-800", // Critical
    }
    return priorityMap[priority] || priorityMap[2]
  }

  const getScopeStyle = (scope: number) => {
    const scopeMap: { [key: number]: string } = {
      1: "bg-gray-100 text-gray-800", // Local
      2: "bg-purple-100 text-purple-800", // Regional
    }
    return scopeMap[scope] || scopeMap[1]
  }

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return `${minutes}m`
    } else if (hours === Math.floor(hours)) {
      return `${hours}h`
    } else {
      const wholeHours = Math.floor(hours)
      const minutes = Math.round((hours - wholeHours) * 60)
      return `${wholeHours}h ${minutes}m`
    }
  }

  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getCountdown = (endAt: string) => {
    if (!endAt) return "-"

    const end = new Date(endAt)
    const current = now || new Date()
    const diffMs = end.getTime() - current.getTime()

    if (Number.isNaN(diffMs)) return "-"
    if (diffMs <= 0) return "0s"

    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const handleViewDetails = (maintenance: Maintenance) => {
    // Navigate to the maintenance details page
    router.push(`/outage-management/maintenance-detail/${maintenance.id}`)

    // Still allow parent components to react if they provided a callback
    if (onViewMaintenanceDetails) {
      onViewMaintenanceDetails(maintenance)
    }
  }
  // No fallback/sample data; only API/Redux data is used

  // Loading state
  if (loading && maintenances.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-6"
      >
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">Maintenance Management</h3>
              <div className="h-12 animate-pulse rounded-lg bg-gray-200"></div>
            </div>

            {/* Loading skeleton for table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full  border-separate border-spacing-0 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {[...Array(8)].map((_, i) => (
                        <th key={i} className="whitespace-nowrap border-y p-4">
                          <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {[...Array(6)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(8)].map((_, colIndex) => (
                          <td key={colIndex} className="whitespace-nowrap border-b px-4 py-3">
                            <div className="h-3 animate-pulse rounded bg-gray-200"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-black bg-opacity-80 p-4 text-xs text-white">
          <div>API Maintenances: {maintenances?.length || 0}</div>
          <div>Loading: {loading ? "Yes" : "No"}</div>
          <div>Error: {error || "None"}</div>
        </div>
      )}

      {/* Main Content - Maintenance Table */}
      <div className="container mx-auto">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Maintenance Management</h3>
              <SearchModule
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search maintenance by title, reference code, or location..."
              />
            </div>
            <ButtonModule
              onClick={() => router.push("/outage-management/schedule-maintenance")}
              variant="primary"
              size="sm"
              className="mt-2"
            >
              Schedule Maintenance
            </ButtonModule>
          </div>

          {error && (
            <div className="mt-2 rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-600">Error loading maintenance data: {error}</p>
            </div>
          )}
          {!loading && !error && maintenances.length === 0 && (
            <div className="mb-4 mt-2 rounded-lg bg-yellow-50 p-3">
              <p className="text-center text-sm text-yellow-600">No maintenance records found.</p>
            </div>
          )}

          {/* Maintenance Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Maintenance Details
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Location & Equipment
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Type & Priority
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Status & Scope
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Schedule</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Duration</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Affected Customers
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {maintenances.map((maintenance, index) => (
                    <motion.tr
                      key={maintenance.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-gray-900">{maintenance.title}</div>
                            <div className="text-xs text-gray-500">Ref: {maintenance.referenceCode}</div>
                            {/* <div className="text-xs text-gray-500">ID: {maintenance.id}</div> */}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapIcon />
                          <div>
                            <div className="font-medium">{maintenance.distributionSubstationName || "N/A"}</div>
                            <div className="text-xs text-gray-500">{maintenance.feederName || "No feeder"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex max-w-max rounded-full px-2 py-1 text-xs font-medium ${getTypeStyle(
                              maintenance.type
                            )}`}
                          >
                            {getTypeText(maintenance.type)}
                          </span>
                          <span
                            className={`inline-flex max-w-max rounded-full px-2 py-1 text-xs font-medium ${getPriorityStyle(
                              maintenance.priority
                            )}`}
                          >
                            {getPriorityText(maintenance.priority)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex max-w-max rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                              maintenance.status
                            )}`}
                          >
                            {getStatusText(maintenance.status)}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getScopeStyle(
                              maintenance.scope
                            )}`}
                          >
                            {getScopeText(maintenance.scope)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">Start: {formatDate(maintenance.scheduledStartAt)}</div>
                          <div className="text-xs">End: {formatDate(maintenance.scheduledEndAt)}</div>
                          {maintenance.actualStartAt && (
                            <div className="text-xs text-green-600">
                              Actual: {formatDate(maintenance.actualStartAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div className="font-medium">{getCountdown(maintenance.scheduledEndAt)}</div>
                        {maintenance.completedAt && <div className="text-xs text-green-600">Completed</div>}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div className="font-medium">{maintenance.affectedCustomerCount}</div>
                        <div className="text-xs">customers affected</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <button
                          onClick={() => handleViewDetails(maintenance)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  dispatch(setPagination({ page: pagination.currentPage - 1, pageSize: pagination.pageSize }))
                }
                disabled={!pagination.hasPrevious}
                className={`rounded-md border px-3 py-1 text-sm ${
                  pagination.hasPrevious
                    ? "border-gray-300 hover:bg-gray-50"
                    : "cursor-not-allowed border-gray-200 text-gray-400"
                }`}
              >
                Previous
              </button>
              <span className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white">{pagination.currentPage}</span>
              <button
                onClick={() =>
                  dispatch(setPagination({ page: pagination.currentPage + 1, pageSize: pagination.pageSize }))
                }
                disabled={!pagination.hasNext}
                className={`rounded-md border px-3 py-1 text-sm ${
                  pagination.hasNext
                    ? "border-gray-300 hover:bg-gray-50"
                    : "cursor-not-allowed border-gray-200 text-gray-400"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MaintenanceTab
