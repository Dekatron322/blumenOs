import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"

// Types
interface Report {
  id: string
  title: string
  type: "outage" | "maintenance" | "performance" | "compliance" | "financial"
  period: string
  generatedDate: string
  generatedBy: string
  status: "draft" | "pending" | "approved" | "published"
  fileSize: string
  format: "pdf" | "excel" | "csv"
  description: string
  tags: string[]
  downloadCount: number
  lastDownloaded?: string
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
const mockReports: Report[] = [
  {
    id: "RPT-001",
    title: "Monthly Outage Report - January 2024",
    type: "outage",
    period: "January 2024",
    generatedDate: "2024-02-01T10:00:00Z",
    generatedBy: "System Administrator",
    status: "published",
    fileSize: "2.4 MB",
    format: "pdf",
    description: "Comprehensive report on all outages and incidents for January 2024",
    tags: ["outage", "monthly", "incidents"],
    downloadCount: 15,
    lastDownloaded: "2024-02-05T14:30:00Z",
  },
  {
    id: "RPT-002",
    title: "Maintenance Performance Analysis",
    type: "maintenance",
    period: "Q4 2023",
    generatedDate: "2024-01-15T09:30:00Z",
    generatedBy: "Maintenance Manager",
    status: "approved",
    fileSize: "1.8 MB",
    format: "excel",
    description: "Analysis of maintenance activities and performance metrics",
    tags: ["maintenance", "performance", "quarterly"],
    downloadCount: 8,
    lastDownloaded: "2024-01-20T11:15:00Z",
  },
  {
    id: "RPT-003",
    title: "System Availability Report",
    type: "performance",
    period: "December 2023",
    generatedDate: "2024-01-01T08:00:00Z",
    generatedBy: "Operations Team",
    status: "published",
    fileSize: "1.2 MB",
    format: "pdf",
    description: "Monthly system availability and uptime statistics",
    tags: ["availability", "uptime", "performance"],
    downloadCount: 22,
    lastDownloaded: "2024-01-10T16:45:00Z",
  },
  {
    id: "RPT-004",
    title: "Compliance Audit Report",
    type: "compliance",
    period: "Annual 2023",
    generatedDate: "2024-01-05T12:00:00Z",
    generatedBy: "Compliance Officer",
    status: "draft",
    fileSize: "3.1 MB",
    format: "pdf",
    description: "Annual compliance audit findings and recommendations",
    tags: ["compliance", "audit", "annual"],
    downloadCount: 0,
  },
]

const ReportsTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedReport, _setSelectedReport] = useState<Report | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const reports = mockReports
  const totalRecords = reports.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Report["status"]) => {
    switch (status) {
      case "draft":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case "pending":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "approved":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "published":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getTypeStyle = (type: Report["type"]) => {
    switch (type) {
      case "outage":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "maintenance":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "performance":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "compliance":
        return {
          backgroundColor: "#F3E8FF",
          color: "#7C3AED",
        }
      case "financial":
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

  const getFormatIcon = (format: Report["format"]) => {
    switch (format) {
      case "pdf":
        return "📄"
      case "excel":
        return "📊"
      case "csv":
        return "📋"
      default:
        return "📄"
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

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchText.toLowerCase()) ||
    report.description.toLowerCase().includes(searchText.toLowerCase()) ||
    report.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load reports data</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Reports Management</h3>
          <p className="text-sm text-gray-500">Generate and manage system reports</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search reports..."
            value={searchText}
            onChange={handleSearch}
            className="w-80"
          />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">
            Generate Report
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Report Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type & Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                File Info
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Usage Stats
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{report.title}</div>
                  <div className="text-sm text-gray-500">{report.description}</div>
                  <div className="text-sm text-gray-500">ID: {report.id}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className="inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium"
                      style={getTypeStyle(report.type)}
                    >
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </span>
                    <div className="text-sm text-gray-500">{report.period}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getStatusStyle(report.status)}
                  >
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getFormatIcon(report.format)}</span>
                    <div>
                      <div className="text-sm text-gray-900">{report.format.toUpperCase()}</div>
                      <div className="text-sm text-gray-500">{report.fileSize}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {report.downloadCount} downloads
                  </div>
                  {report.lastDownloaded && (
                    <div className="text-sm text-gray-500">
                      Last: {new Date(report.lastDownloaded).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
                      View
                    </button>
                    <button className="rounded-md bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200">
                      Download
                    </button>
                    <button className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                      Share
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

export default ReportsTab
