"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import SearchInput from "components/Search/SearchInput"

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

interface ActionDropdownProps {
  report: Report
  onViewDetails: (report: Report) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ report, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return

    const buttonRect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    const dropdownHeight = 120

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("top")
    } else {
      setDropdownDirection("bottom")
    }
  }

  const handleButtonClick = () => {
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(report)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="focus::bg-gray-100 flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RxDotsVertical />
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={
              dropdownDirection === "bottom"
                ? {
                    top: dropdownRef.current
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="py-1">
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Details
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                onClick={() => {
                  console.log("Download report:", report.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f0f9f4" }}
                transition={{ duration: 0.1 }}
              >
                Download
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Share report:", report.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Share
              </motion.button>
              {report.status === "draft" && (
                <motion.button
                  className="block w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    console.log("Edit report:", report.id)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: "#eff6ff" }}
                  transition={{ duration: 0.1 }}
                >
                  Edit
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <motion.div
      className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="h-8 w-40 rounded bg-gray-200">
          <motion.div
            className="size-full rounded bg-gray-300"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        </div>
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                },
              }}
            />
          </div>
          <div className="h-10 w-24 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(6)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200">
                    <motion.div
                      className="size-full rounded bg-gray-300"
                      initial={{ opacity: 0.3 }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        transition: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.1,
                        },
                      }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(6)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200">
                      <motion.div
                        className="size-full rounded bg-gray-300"
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          transition: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (rowIndex * 6 + cellIndex) * 0.05,
                          },
                        }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t py-3">
        <div className="size-48 rounded bg-gray-200">
          <motion.div
            className="size-full rounded bg-gray-300"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              },
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                },
              }}
            />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200">
              <motion.div
                className="size-full rounded bg-gray-300"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8 + i * 0.1,
                  },
                }}
              />
            </div>
          ))}
          <div className="size-8 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.3,
                },
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
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
  {
    id: "RPT-005",
    title: "Financial Performance Q1 2024",
    type: "financial",
    period: "Q1 2024",
    generatedDate: "2024-04-01T14:00:00Z",
    generatedBy: "Finance Department",
    status: "pending",
    fileSize: "2.8 MB",
    format: "excel",
    description: "Quarterly financial performance and revenue analysis",
    tags: ["financial", "revenue", "quarterly"],
    downloadCount: 3,
    lastDownloaded: "2024-04-05T09:20:00Z",
  },
  {
    id: "RPT-006",
    title: "Customer Satisfaction Survey Results",
    type: "performance",
    period: "March 2024",
    generatedDate: "2024-04-10T11:00:00Z",
    generatedBy: "Customer Service",
    status: "published",
    fileSize: "0.9 MB",
    format: "csv",
    description: "Monthly customer satisfaction survey results and feedback",
    tags: ["customer", "satisfaction", "survey"],
    downloadCount: 12,
    lastDownloaded: "2024-04-15T13:45:00Z",
  },
]

const ReportsTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
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

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchText.toLowerCase()) ||
      report.description.toLowerCase().includes(searchText.toLowerCase()) ||
      report.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()))
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
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Reports Management</p>
          <p className="text-sm text-gray-500">Generate and manage system reports</p>
        </div>
        <div className="flex gap-4">
          <SearchInput placeholder="Search reports..." value={searchText} onChange={handleSearch} className="w-80" />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">Generate Report</button>
        </div>
      </motion.div>

      {filteredReports.length === 0 ? (
        <motion.div
          className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F6F6F9]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.p
            className="text-base font-bold text-[#202B3C]"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {searchText ? "No matching reports found" : "No reports available"}
          </motion.p>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="w-full overflow-x-auto border-x bg-[#FFFFFF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      Report Details
                    </div>
                  </th>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("type")}
                  >
                    <div className="flex items-center gap-2">
                      Type & Period <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("format")}
                  >
                    <div className="flex items-center gap-2">
                      File Info <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("downloadCount")}
                  >
                    <div className="flex items-center gap-2">
                      Usage Stats <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredReports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                        <div className="text-sm text-gray-500">ID: {report.id}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {report.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <motion.div
                            style={getTypeStyle(report.type)}
                            className="inline-flex w-fit items-center justify-center gap-1 rounded-full px-2 py-1"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor:
                                  report.type === "outage"
                                    ? "#AF4B4B"
                                    : report.type === "maintenance"
                                    ? "#D97706"
                                    : report.type === "performance"
                                    ? "#2563EB"
                                    : report.type === "compliance"
                                    ? "#7C3AED"
                                    : "#589E67",
                              }}
                            ></span>
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                          </motion.div>
                          <div className="text-sm text-gray-500">{report.period}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <motion.div
                          style={getStatusStyle(report.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor:
                                report.status === "draft"
                                  ? "#D97706"
                                  : report.status === "pending"
                                  ? "#2563EB"
                                  : report.status === "approved"
                                  ? "#589E67"
                                  : "#16A34A",
                            }}
                          ></span>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFormatIcon(report.format)}</span>
                          <div>
                            <div className="text-sm text-gray-900">{report.format.toUpperCase()}</div>
                            <div className="text-sm text-gray-500">{report.fileSize}</div>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Generated: {new Date(report.generatedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <div className="text-sm text-gray-900">{report.downloadCount} downloads</div>
                        {report.lastDownloaded && (
                          <div className="text-sm text-gray-500">
                            Last: {new Date(report.lastDownloaded).toLocaleDateString()}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">By: {report.generatedBy}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ActionDropdown report={report} onViewDetails={setSelectedReport} />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          <motion.div
            className="flex items-center justify-between border-t py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of{" "}
              {totalRecords} entries
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                <MdOutlineArrowBackIosNew />
              </motion.button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = index + 1
                } else if (currentPage <= 3) {
                  pageNum = index + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index
                } else {
                  pageNum = currentPage - 2 + index
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => paginate(pageNum)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-[#0a0a0a] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

              {totalPages > 5 && currentPage < totalPages - 1 && (
                <motion.button
                  onClick={() => paginate(totalPages)}
                  className={`flex size-8 items-center justify-center rounded-md text-sm ${
                    currentPage === totalPages
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {totalPages}
                </motion.button>
              )}

              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                <MdOutlineArrowForwardIos />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

export default ReportsTab
