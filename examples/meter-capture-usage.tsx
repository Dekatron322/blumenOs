// Example usage component for Meter Capture
"use client"

import React, { useEffect, useState } from "react"
import { useMeterCapture } from "lib/hooks/useMeterCapture"

const MeterCaptureExample = () => {
  const {
    meterCaptures,
    loading,
    error,
    success,
    pagination,
    getMeterCaptures,
    clearError,
    resetState,
  } = useMeterCapture()

  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    vendorId: undefined as number | undefined,
    status: undefined as 1 | 2 | 3 | undefined,
    referenceId: undefined as string | undefined,
    source: undefined as string | undefined,
    fromUtc: undefined as string | undefined,
    toUtc: undefined as string | undefined,
  })

  useEffect(() => {
    // Fetch meter captures on component mount
    getMeterCaptures(filters)
  }, [])

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    getMeterCaptures(newFilters)
  }

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, pageNumber: newPage }
    setFilters(newFilters)
    getMeterCaptures(newFilters)
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Pending"
      case 2:
        return "Processing"
      case 3:
        return "Completed"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "text-yellow-600"
      case 2:
        return "text-blue-600"
      case 3:
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Meter Capture Enumerations</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor ID
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Vendor ID"
              value={filters.vendorId || ""}
              onChange={(e) =>
                handleFilterChange(
                  "vendorId",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange(
                  "status",
                  e.target.value ? (parseInt(e.target.value) as 1 | 2 | 3) : undefined
                )
              }
            >
              <option value="">All Status</option>
              <option value="1">Pending</option>
              <option value="2">Processing</option>
              <option value="3">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference ID
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Reference ID"
              value={filters.referenceId || ""}
              onChange={(e) =>
                handleFilterChange(
                  "referenceId",
                  e.target.value || undefined
                )
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Source"
              value={filters.source || ""}
              onChange={(e) =>
                handleFilterChange(
                  "source",
                  e.target.value || undefined
                )
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.fromUtc || ""}
              onChange={(e) =>
                handleFilterChange(
                  "fromUtc",
                  e.target.value || undefined
                )
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.toUtc || ""}
              onChange={(e) =>
                handleFilterChange(
                  "toUtc",
                  e.target.value || undefined
                )
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Size
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filters.pageSize}
              onChange={(e) =>
                handleFilterChange("pageSize", parseInt(e.target.value))
              }
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  pageNumber: 1,
                  pageSize: 10,
                  vendorId: undefined,
                  status: undefined,
                  referenceId: undefined,
                  source: undefined,
                  fromUtc: undefined,
                  toUtc: undefined,
                })
                getMeterCaptures({
                  pageNumber: 1,
                  pageSize: 10,
                })
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error handling */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading meter captures...</p>
        </div>
      )}

      {/* Data table */}
      {!loading && meterCaptures.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meterCaptures.map((capture) => (
                  <tr key={capture.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {capture.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{capture.vendorName}</div>
                        <div className="text-gray-500">ID: {capture.vendorId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getStatusColor(capture.status)}`}>
                        {getStatusText(capture.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {capture.referenceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {capture.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(capture.createdAtUtc).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {capture.processedAtUtc
                        ? new Date(capture.processedAtUtc).toLocaleString()
                        : "Not processed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.currentPage * pagination.pageSize,
                      pagination.totalCount
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.totalCount}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && meterCaptures.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No meter captures found</div>
          <p className="text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default MeterCaptureExample
