"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import SearchInput from "components/Search/SearchInput"

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

interface ActionDropdownProps {
  outage: Outage
  onViewDetails: (outage: Outage) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ outage, onViewDetails }) => {
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
    onViewDetails(outage)
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
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Update outage:", outage.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Status
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Assign team:", outage.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Assign Team
              </motion.button>
              {outage.status === "restored" && (
                <motion.button
                  className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                  onClick={() => {
                    console.log("Close outage:", outage.id)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: "#f0f9f4" }}
                  transition={{ duration: 0.1 }}
                >
                  Close Outage
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
  {
    id: "OUT-004",
    title: "Scheduled Maintenance - Sabo",
    description: "Planned maintenance for system upgrades",
    location: "Sabo Area",
    affectedCustomers: 80,
    startTime: "2024-01-16T09:00:00Z",
    estimatedRestoration: "2024-01-16T14:00:00Z",
    status: "reported",
    priority: "low",
    cause: "Planned maintenance",
    assignedTeam: "Team Delta",
    reportedBy: "Operations",
    estimatedDuration: 300,
  },
  {
    id: "OUT-005",
    title: "Emergency Repair - Ungwan Rimi",
    description: "Emergency repair due to pole damage",
    location: "Ungwan Rimi",
    affectedCustomers: 35,
    startTime: "2024-01-15T16:45:00Z",
    estimatedRestoration: "2024-01-15T20:00:00Z",
    status: "repairing",
    priority: "high",
    cause: "Damaged pole",
    assignedTeam: "Team Epsilon",
    reportedBy: "Field Report",
    estimatedDuration: 195,
  },
]

const OutagesTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOutage, setSelectedOutage] = useState<Outage | null>(null)
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

  const filteredOutages = outages.filter(
    (outage) =>
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
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Outage Management</p>
          <p className="text-sm text-gray-500">Track and manage power outages</p>
        </div>
        <div className="flex gap-4">
          <SearchInput placeholder="Search outages..." value={searchText} onChange={handleSearch} className="w-80" />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">Report Outage</button>
        </div>
      </motion.div>

      {filteredOutages.length === 0 ? (
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
            {searchText ? "No matching outages found" : "No outages reported"}
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
                      Outage Details
                    </div>
                  </th>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("location")}
                  >
                    <div className="flex items-center gap-2">
                      Location & Impact <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status & Priority <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("startTime")}
                  >
                    <div className="flex items-center gap-2">
                      Timeline <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("cause")}
                  >
                    <div className="flex items-center gap-2">
                      Cause & Team <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredOutages.map((outage, index) => (
                    <motion.tr
                      key={outage.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{outage.title}</div>
                        <div className="text-sm text-gray-500">{outage.description}</div>
                        <div className="text-sm text-gray-500">ID: {outage.id}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <div className="text-sm text-gray-900">{outage.location}</div>
                        <div className="text-sm text-gray-500">{outage.affectedCustomers} customers affected</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <motion.div
                            style={getStatusStyle(outage.status)}
                            className="inline-flex w-fit items-center justify-center gap-1 rounded-full px-2 py-1 text-sm"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor:
                                  outage.status === "reported"
                                    ? "#D97706"
                                    : outage.status === "investigating"
                                    ? "#2563EB"
                                    : outage.status === "repairing"
                                    ? "#AF4B4B"
                                    : outage.status === "restored"
                                    ? "#589E67"
                                    : "#6B7280",
                              }}
                            ></span>
                            {outage.status.charAt(0).toUpperCase() + outage.status.slice(1)}
                          </motion.div>
                          <motion.div
                            style={getPriorityStyle(outage.priority)}
                            className="inline-flex w-fit items-center justify-center gap-1 rounded-full px-2 py-1 text-sm"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor:
                                  outage.priority === "critical"
                                    ? "#AF4B4B"
                                    : outage.priority === "high"
                                    ? "#D97706"
                                    : outage.priority === "medium"
                                    ? "#2563EB"
                                    : "#589E67",
                              }}
                            ></span>
                            {outage.priority.charAt(0).toUpperCase() + outage.priority.slice(1)}
                          </motion.div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-4">
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
                      <td className="whitespace-nowrap border-b px-4 py-4">
                        <div className="text-sm text-gray-900">{outage.cause}</div>
                        <div className="text-sm text-gray-500">Team: {outage.assignedTeam}</div>
                        <div className="text-sm text-gray-500">Reported by: {outage.reportedBy}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ActionDropdown outage={outage} onViewDetails={setSelectedOutage} />
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

export default OutagesTab
