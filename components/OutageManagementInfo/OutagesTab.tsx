"use client"

import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { Outage as ApiOutage, fetchOutages, OutageRequestParams } from "lib/redux/outageSlice"
import SearchInput from "components/Search/SearchInput"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

// Types
interface Outage {
  id: string
  numericId: number
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
        <div className="h-8 w-40 overflow-hidden rounded bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </div>
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
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
                  <div className="h-4 w-24 overflow-hidden rounded bg-gray-200">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
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
                    <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: (rowIndex * 6 + cellIndex) * 0.05,
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
        <div className="h-6 w-48 overflow-hidden rounded bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="size-8 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8 + i * 0.1,
                }}
              />
            </div>
          ))}
          <div className="size-8 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Helper functions to map API data to local interface
const mapApiOutageToLocal = (apiOutage: ApiOutage): Outage => {
  // Map API status numbers to local status strings
  const statusMap: { [key: number]: Outage["status"] } = {
    1: "reported",
    2: "investigating",
    3: "repairing",
    4: "restored",
    5: "cancelled",
  }

  // Map API priority numbers to local priority strings
  const priorityMap: { [key: number]: Outage["priority"] } = {
    1: "low",
    2: "medium",
    3: "high",
    4: "critical",
  }

  // Calculate estimated duration in minutes (you might want to adjust this based on your API data)
  const reportedAt = new Date(apiOutage.reportedAt)
  const estimatedRestoration = new Date(reportedAt.getTime() + apiOutage.durationHours * 60 * 60 * 1000)

  return {
    id: apiOutage.referenceCode || `OUT-${apiOutage.id}`,
    numericId: apiOutage.id,
    title: apiOutage.title,
    description: `Outage affecting ${apiOutage.affectedCustomerCount} customers`,
    location: apiOutage.distributionSubstationName || apiOutage.feederName || "Unknown Location",
    affectedCustomers: apiOutage.affectedCustomerCount,
    startTime: apiOutage.reportedAt,
    estimatedRestoration: estimatedRestoration.toISOString(),
    status: statusMap[apiOutage.status] || "reported",
    priority: priorityMap[apiOutage.priority] || "medium",
    cause: "To be determined", // API doesn't provide cause, you might need to adjust this
    assignedTeam: "Field Team", // API doesn't provide assigned team, you might need to adjust this
    reportedBy: apiOutage.isCustomerGenerated ? "Customer" : "System",
    estimatedDuration: apiOutage.durationHours * 60, // Convert hours to minutes
  }
}

const OutagesTab: React.FC = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const {
    outages: apiOutages,
    loading,
    error,
    totalCount,
    currentPage: reduxCurrentPage,
    pageSize,
    hasNext,
    hasPrevious,
  } = useSelector((state: RootState) => state.outages)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOutage, setSelectedOutage] = useState<Outage | null>(null)
  const [filters, setFilters] = useState<Partial<OutageRequestParams>>({
    Status: undefined,
    Priority: undefined,
    Scope: undefined,
    CustomerGenerated: undefined,
  })

  // Map API outages to local format
  const outages: Outage[] = apiOutages.map(mapApiOutageToLocal)

  // Fetch outages on component mount and when filters/search change
  useEffect(() => {
    const params: OutageRequestParams = {
      PageNumber: currentPage,
      PageSize: pageSize || 10,
      ...filters,
    }

    if (searchText) {
      params.Search = searchText
    }

    dispatch(fetchOutages(params))
  }, [dispatch, currentPage, pageSize, filters, searchText])

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

  const handleFormSelectChange = (
    e: ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = e.target

    if (name === "Status") {
      const numeric = value === "" ? undefined : Number(value)
      handleFilterChange("Status", isNaN(numeric as number) ? undefined : numeric)
      return
    }

    if (name === "Priority") {
      const numeric = value === "" ? undefined : Number(value)
      handleFilterChange("Priority", isNaN(numeric as number) ? undefined : numeric)
      return
    }

    if (name === "CustomerGenerated") {
      if (value === "") {
        handleFilterChange("CustomerGenerated", undefined)
      } else {
        handleFilterChange("CustomerGenerated", value === "true")
      }
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const handleViewOutageDetails = (outage: Outage) => {
    // Use the numeric backend ID for the detail route
    router.push(`/outage-management/outage-detail/${outage.numericId}`)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleFilterChange = (filterType: keyof typeof filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      Status: undefined,
      Priority: undefined,
      Scope: undefined,
      CustomerGenerated: undefined,
    })
    setSearchText("")
    setCurrentPage(1)
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load outages data</p>
          <button
            className="mt-2 text-blue-600 hover:underline"
            onClick={() => {
              const params: OutageRequestParams = {
                PageNumber: currentPage,
                PageSize: pageSize || 10,
                ...filters,
              }
              if (searchText) params.Search = searchText
              dispatch(fetchOutages(params))
            }}
          >
            Try again
          </button>
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
          <button
            className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]"
            onClick={() => router.push("/outage-management/report-outage")}
          >
            Report Outage
          </button>
        </div>
      </motion.div>

      {/* Filter Controls */}
      <motion.div
        className="flex flex-wrap gap-4 py-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="min-w-[220px]">
          <FormSelectModule
            label="Status"
            name="Status"
            value={filters.Status ?? ""}
            onChange={handleFormSelectChange}
            options={[
              { value: "", label: "All Statuses" },
              { value: 1, label: "Reported" },
              { value: 2, label: "Investigating" },
              { value: 3, label: "Repairing" },
              { value: 4, label: "Restored" },
              { value: 5, label: "Cancelled" },
            ]}
          />
        </div>

        <div className="min-w-[220px]">
          <FormSelectModule
            label="Priority"
            name="Priority"
            value={filters.Priority ?? ""}
            onChange={handleFormSelectChange}
            options={[
              { value: "", label: "All Priorities" },
              { value: 1, label: "Low" },
              { value: 2, label: "Medium" },
              { value: 3, label: "High" },
              { value: 4, label: "Critical" },
            ]}
          />
        </div>

        <div className="min-w-[220px]">
          <FormSelectModule
            label="Source"
            name="CustomerGenerated"
            value={filters.CustomerGenerated === undefined ? "" : filters.CustomerGenerated ? "true" : "false"}
            onChange={handleFormSelectChange}
            options={[
              { value: "", label: "All Sources" },
              { value: "true", label: "Customer Reported" },
              { value: "false", label: "System Detected" },
            ]}
          />
        </div>

        {(filters.Status !== undefined ||
          filters.Priority !== undefined ||
          filters.CustomerGenerated !== undefined ||
          searchText) && (
          <button className="rounded-md bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </motion.div>

      {outages.length === 0 ? (
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
            {searchText || Object.values(filters).some((f) => f !== undefined)
              ? "No matching outages found"
              : "No outages reported"}
          </motion.p>
          {(searchText || Object.values(filters).some((f) => f !== undefined)) && (
            <button className="text-blue-600 hover:underline" onClick={clearFilters}>
              Clear filters
            </button>
          )}
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
                  {outages.map((outage, index) => (
                    <motion.tr
                      key={outage.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b p-4">
                        <div className="text-sm font-medium text-gray-900">{outage.title}</div>
                        <div className="text-sm text-gray-500">{outage.description}</div>
                        <div className="text-sm text-gray-500">ID: {outage.id}</div>
                      </td>
                      <td className="whitespace-nowrap border-b p-4">
                        <div className="text-sm text-gray-900">{outage.location}</div>
                        <div className="text-sm text-gray-500">{outage.affectedCustomers} customers affected</div>
                      </td>
                      <td className="whitespace-nowrap border-b p-4">
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
                      <td className="whitespace-nowrap border-b p-4">
                        <div className="text-sm text-gray-900">
                          Started: {new Date(outage.startTime).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Est. Duration: {formatDuration(outage.estimatedDuration)}
                        </div>
                        {outage.status === "restored" && outage.actualRestoration && (
                          <div className="text-sm text-green-600">
                            Restored: {new Date(outage.actualRestoration).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap border-b p-4">
                        <div className="text-sm text-gray-900">{outage.cause}</div>
                        <div className="text-sm text-gray-500">Team: {outage.assignedTeam}</div>
                        <div className="text-sm text-gray-500">Reported by: {outage.reportedBy}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ActionDropdown outage={outage} onViewDetails={handleViewOutageDetails} />
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
              Showing {(currentPage - 1) * (pageSize || 10) + 1} to{" "}
              {Math.min(currentPage * (pageSize || 10), totalCount)} of {totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={!hasPrevious}
                className={`flex items-center justify-center rounded-md p-2 ${
                  !hasPrevious ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: !hasPrevious ? 1 : 1.1 }}
                whileTap={{ scale: !hasPrevious ? 1 : 0.95 }}
              >
                <MdOutlineArrowBackIosNew />
              </motion.button>

              {Array.from({ length: Math.min(5, Math.ceil(totalCount / (pageSize || 10))) }).map((_, index) => {
                const totalPages = Math.ceil(totalCount / (pageSize || 10))
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

              {Math.ceil(totalCount / (pageSize || 10)) > 5 &&
                currentPage < Math.ceil(totalCount / (pageSize || 10)) - 2 && <span className="px-2">...</span>}

              {Math.ceil(totalCount / (pageSize || 10)) > 5 &&
                currentPage < Math.ceil(totalCount / (pageSize || 10)) - 1 && (
                  <motion.button
                    onClick={() => paginate(Math.ceil(totalCount / (pageSize || 10)))}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === Math.ceil(totalCount / (pageSize || 10))
                        ? "bg-[#0a0a0a] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {Math.ceil(totalCount / (pageSize || 10))}
                  </motion.button>
                )}

              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={!hasNext}
                className={`flex items-center justify-center rounded-md p-2 ${
                  !hasNext ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: !hasNext ? 1 : 1.1 }}
                whileTap={{ scale: !hasNext ? 1 : 0.95 }}
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
