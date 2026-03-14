// Example usage component for Meter Capture
"use client"

import React, { useEffect, useState } from "react"
import { useMeterCapture } from "lib/hooks/useMeterCapture"

const MeterCaptureExample = () => {
  const { meterCaptures, loading, error, success, pagination, getMeterCaptures, clearError, resetState } =
    useMeterCapture()

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
      <h1 className="mb-6 text-2xl font-bold">Meter Capture Enumerations</h1>

      {/* Filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Vendor ID</label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter Vendor ID"
              value={filters.vendorId || ""}
              onChange={(e) => handleFilterChange("vendorId", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value ? (parseInt(e.target.value) as 1 | 2 | 3) : undefined)
              }
            >
              <option value="">All Status</option>
              <option value="1">Pending</option>
              <option value="2">Processing</option>
              <option value="3">Completed</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Reference ID</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter Reference ID"
              value={filters.referenceId || ""}
              onChange={(e) => handleFilterChange("referenceId", e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Source</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter Source"
              value={filters.source || ""}
              onChange={(e) => handleFilterChange("source", e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={filters.fromUtc || ""}
              onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={filters.toUtc || ""}
              onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Page Size</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={filters.pageSize}
              onChange={(e) => handleFilterChange("pageSize", parseInt(e.target.value))}
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
              className="w-full rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error handling */}
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-8 text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading meter captures...</p>
        </div>
      )}

      {/* Data table */}
      {!loading && meterCaptures.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Reference ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Processed At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {meterCaptures.map((capture) => (
                  <tr key={capture.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{capture.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{capture.vendorName}</div>
                        <div className="text-gray-500">ID: {capture.vendorId}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`font-medium ${getStatusColor(capture.status)}`}>
                        {getStatusText(capture.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{capture.referenceId}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{capture.source}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(capture.createdAtUtc).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {capture.processedAtUtc ? new Date(capture.processedAtUtc).toLocaleString() : "Not processed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="py-8 text-center">
          <div className="text-lg text-gray-500">No meter captures found</div>
          <p className="mt-2 text-gray-400">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default MeterCaptureExample
