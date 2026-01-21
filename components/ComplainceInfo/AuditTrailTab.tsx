"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxDotsVertical } from "react-icons/rx"
import {
  MdCalendarToday,
  MdCheck,
  MdClose,
  MdCode,
  MdContentCopy,
  MdDevices,
  MdExpandMore,
  MdFilterList,
  MdInfo,
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
  MdPerson,
  MdRefresh,
} from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchAuditLogs, AuditLog } from "lib/redux/auditLogSlice"
import { fetchAgentById } from "lib/redux/agentSlice"
import { fetchEmployeeById } from "lib/redux/employeeSlice"
import { fetchVendorById } from "lib/redux/vendorSlice"
import { format } from "date-fns"

interface ActorNames {
  userId?: string
  agentId?: string
  vendorId?: string
  customerId?: string
}

interface ActorNamesCache {
  users: Record<number, string>
  agents: Record<number, string>
  vendors: Record<number, string>
}

interface ActionDropdownProps {
  entry: AuditLog
  onViewDetails: (entry: AuditLog) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ entry, onViewDetails }) => {
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

  const handleButtonClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(entry)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="focus::bg-gray-100 flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open actions"
        role="button"
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
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 6
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 6
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -6 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -6 : 6 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            <div className="py-1">
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
              >
                View Details
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Flag entry:", entry.id)
                  setIsOpen(false)
                }}
              >
                Flag Entry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LoadingSkeleton = () => {
  return (
    <motion.div
      className="mt-5 flex flex-1 flex-col rounded-md border bg-white p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 rounded bg-gray-200" />
          <div className="h-10 w-24 rounded bg-gray-200" />
        </div>
      </div>

      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t py-3">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const AuditTrailTab: React.FC = () => {
  const dispatch = useAppDispatch()
  const { auditLogs, auditLogsLoading, auditLogsError, auditLogsPagination } = useAppSelector(
    (state) => state.auditLogs
  )

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<AuditLog | null>(null)
  const [actionFilter, setActionFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [modalTab, setModalTab] = useState<"overview" | "technical" | "data">("overview")
  const [expandedSections, setExpandedSections] = useState<string[]>(["basic"])
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [actorNames, setActorNames] = useState<ActorNames>({})
  const [actorNamesCache, setActorNamesCache] = useState<ActorNamesCache>({ users: {}, agents: {}, vendors: {} })
  const [loadingActors, setLoadingActors] = useState(false)
  const [loadingListActors, setLoadingListActors] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const pageSize = 10

  // Fetch actor names for all entries in the list
  useEffect(() => {
    const fetchAllActorNames = async () => {
      if (!auditLogs || auditLogs.length === 0) return

      const userIds = Array.from(new Set(auditLogs.filter((e) => e.userId).map((e) => e.userId!)))
      const agentIds = Array.from(new Set(auditLogs.filter((e) => e.agentId).map((e) => e.agentId!)))
      const vendorIds = Array.from(
        new Set(auditLogs.filter((e) => e.vendorId && e.vendorId > 0).map((e) => e.vendorId!))
      )

      // Filter out already cached IDs
      const uncachedUserIds = userIds.filter((id) => !actorNamesCache.users[id])
      const uncachedAgentIds = agentIds.filter((id) => !actorNamesCache.agents[id])
      const uncachedVendorIds = vendorIds.filter((id) => !actorNamesCache.vendors[id])

      if (uncachedUserIds.length === 0 && uncachedAgentIds.length === 0 && uncachedVendorIds.length === 0) return

      setLoadingListActors(true)
      const newUsers: Record<number, string> = {}
      const newAgents: Record<number, string> = {}
      const newVendors: Record<number, string> = {}

      // Fetch user names (limit concurrent requests)
      await Promise.all(
        uncachedUserIds.slice(0, 10).map(async (userId) => {
          try {
            const result = await dispatch(fetchEmployeeById(userId)).unwrap()
            newUsers[userId] = result.fullName || ""
          } catch {
            newUsers[userId] = ""
          }
        })
      )

      // Fetch agent names (limit concurrent requests)
      await Promise.all(
        uncachedAgentIds.slice(0, 10).map(async (agentId) => {
          try {
            const result = await dispatch(fetchAgentById(agentId)).unwrap()
            newAgents[agentId] = result.data?.user?.fullName || ""
          } catch {
            newAgents[agentId] = ""
          }
        })
      )

      // Fetch vendor names (limit concurrent requests)
      await Promise.all(
        uncachedVendorIds.slice(0, 10).map(async (vendorId) => {
          try {
            const result = await dispatch(fetchVendorById(vendorId)).unwrap()
            newVendors[vendorId] = result.data?.name || ""
          } catch {
            newVendors[vendorId] = ""
          }
        })
      )

      setActorNamesCache((prev) => ({
        users: { ...prev.users, ...newUsers },
        agents: { ...prev.agents, ...newAgents },
        vendors: { ...prev.vendors, ...newVendors },
      }))
      setLoadingListActors(false)
    }

    fetchAllActorNames()
  }, [auditLogs, dispatch])

  // Fetch actor names when modal opens (uses cache if available)
  useEffect(() => {
    const fetchActorNames = async () => {
      if (!selectedEntry) {
        setActorNames({})
        return
      }

      setLoadingActors(true)
      const names: ActorNames = {}

      try {
        // Check cache first for userId
        if (selectedEntry.userId) {
          if (actorNamesCache.users[selectedEntry.userId]) {
            names.userId = actorNamesCache.users[selectedEntry.userId]
          } else {
            try {
              const result = await dispatch(fetchEmployeeById(selectedEntry.userId)).unwrap()
              names.userId = result.fullName || ""
            } catch {
              names.userId = ""
            }
          }
        }

        // Check cache first for agentId
        if (selectedEntry.agentId) {
          if (actorNamesCache.agents[selectedEntry.agentId]) {
            names.agentId = actorNamesCache.agents[selectedEntry.agentId]
          } else {
            try {
              const result = await dispatch(fetchAgentById(selectedEntry.agentId)).unwrap()
              names.agentId = result.data?.user?.fullName || ""
            } catch {
              names.agentId = ""
            }
          }
        }

        if (selectedEntry.vendorId && selectedEntry.vendorId > 0) {
          if (actorNamesCache.vendors[selectedEntry.vendorId]) {
            names.vendorId = actorNamesCache.vendors[selectedEntry.vendorId]
          } else {
            try {
              const result = await dispatch(fetchVendorById(selectedEntry.vendorId)).unwrap()
              names.vendorId = result.data?.name || ""
            } catch {
              names.vendorId = ""
            }
          }
        }
        if (selectedEntry.customerId) {
          names.customerId = ""
        }
      } catch (err) {
        console.error("Error fetching actor names:", err)
      } finally {
        setLoadingActors(false)
        setActorNames(names)
      }
    }

    fetchActorNames()
  }, [selectedEntry, dispatch, actorNamesCache])

  // Helper to get actor name from cache
  const getActorName = (type: "user" | "agent" | "vendor", id: number | undefined): string | null => {
    if (!id) return null
    if (type === "user") return actorNamesCache.users[id] || null
    if (type === "agent") return actorNamesCache.agents[id] || null
    if (type === "vendor") return actorNamesCache.vendors[id] || null
    return null
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const statusOptions = ["Success", "Failed", "Pending", "Error", "Completed"]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchData = useCallback(() => {
    dispatch(
      fetchAuditLogs({
        PageNumber: currentPage,
        PageSize: pageSize,
        Action: actionFilter || undefined,
        Status: statusFilter || undefined,
        From: dateFrom || undefined,
        To: dateTo || undefined,
      })
    )
  }, [dispatch, currentPage, pageSize, actionFilter, statusFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const isLoading = auditLogsLoading
  const isError = !!auditLogsError
  const entries = auditLogs
  const totalRecords = auditLogsPagination.totalCount
  const totalPages = Math.max(1, auditLogsPagination.totalPages)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleManualSearch = () => {
    const trimmed = searchText.trim()
    if (trimmed.length === 0 || trimmed.length >= 3) {
      setActionFilter(trimmed)
      setCurrentPage(1)
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setActionFilter("")
    setCurrentPage(1)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleClearFilters = () => {
    setActionFilter("")
    setStatusFilter("")
    setDateFrom("")
    setDateTo("")
    setSearchText("")
    setCurrentPage(1)
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    setIsFilterOpen(false)
  }

  const activeFiltersCount = [statusFilter, dateFrom, dateTo, actionFilter].filter(Boolean).length

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1
    if (pageNumber > totalPages) pageNumber = totalPages
    setCurrentPage(pageNumber)
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss")
    } catch {
      return dateString
    }
  }

  const getStatusStyle = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower === "success" || statusLower === "approved" || statusLower === "completed") {
      return { backgroundColor: "#EEFDF4", color: "#15803D" }
    } else if (statusLower === "failed" || statusLower === "flagged" || statusLower === "error") {
      return { backgroundColor: "#FEF2F2", color: "#B91C1C" }
    } else {
      return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    if (statusLower === "success" || statusLower === "approved" || statusLower === "completed") {
      return "#15803D"
    } else if (statusLower === "failed" || statusLower === "flagged" || statusLower === "error") {
      return "#B91C1C"
    } else {
      return "#6B7280"
    }
  }

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div className="p-4 text-red-600">Error loading audit trail: {auditLogsError}</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      {/* Header Section */}
      <motion.div
        className="items-center justify-between py-2 md:flex"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Audit Trails</p>
          <p className="text-sm text-gray-600">Complete record of all system activities and user actions</p>
        </div>
        <div className="mt-3 flex items-center gap-3 md:mt-0">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            onSearch={handleManualSearch}
            placeholder="Search audit trails..."
            className="w-[280px]"
            bgClassName="bg-white"
          />

          {/* Filter Button */}
          <div className="relative" ref={filterRef}>
            <motion.button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                activeFiltersCount > 0
                  ? "border-[#004B23] bg-[#004B23]/10 text-[#004B23]"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MdFilterList className="text-lg" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-[#004B23] text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </motion.button>

            {/* Filter Dropdown Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Filter Audit Logs</h3>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <MdClose className="text-lg" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Status Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                      >
                        <option value="">All Statuses</option>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-600">
                        <MdCalendarToday className="text-sm" />
                        Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">From</label>
                          <input
                            type="datetime-local"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">To</label>
                          <input
                            type="datetime-local"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="mt-4 flex gap-2 border-t pt-4">
                    <button
                      onClick={handleClearFilters}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 rounded-lg bg-[#004B23] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003318]"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Refresh Button */}
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 0.5, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            >
              <MdRefresh className="text-lg" />
            </motion.span>
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            className="mb-4 flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span className="text-sm text-gray-500">Active filters:</span>
            {statusFilter && (
              <motion.span
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("")} className="ml-1 hover:text-blue-600">
                  <MdClose className="text-sm" />
                </button>
              </motion.span>
            )}
            {dateFrom && (
              <motion.span
                className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                From: {format(new Date(dateFrom), "MMM dd, yyyy HH:mm")}
                <button onClick={() => setDateFrom("")} className="ml-1 hover:text-purple-600">
                  <MdClose className="text-sm" />
                </button>
              </motion.span>
            )}
            {dateTo && (
              <motion.span
                className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                To: {format(new Date(dateTo), "MMM dd, yyyy HH:mm")}
                <button onClick={() => setDateTo("")} className="ml-1 hover:text-purple-600">
                  <MdClose className="text-sm" />
                </button>
              </motion.span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline / Activity Feed */}
      <motion.div
        className="mt-4"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16">
            <div className="rounded-full bg-gray-200 p-4">
              <MdFilterList className="text-3xl text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No audit logs found</p>
            <p className="text-xs text-gray-400">Try adjusting your filters or search criteria</p>
            {activeFiltersCount > 0 && (
              <button onClick={handleClearFilters} className="mt-2 text-sm font-medium text-[#004B23] hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-[#004B23] via-gray-200 to-gray-100" />

            <div className="space-y-4">
              <AnimatePresence>
                {entries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="relative pl-14"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-6 z-10">
                      <motion.div
                        className="flex size-5 items-center justify-center rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: getStatusColor(entry.status) }}
                        whileHover={{ scale: 1.2 }}
                      >
                        <motion.div
                          className="size-2 rounded-full bg-white"
                          animate={{ scale: [1, 0.8, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>

                    {/* Log Card */}
                    <motion.div
                      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#004B23]/30 hover:shadow-md"
                      onClick={() => setSelectedEntry(entry)}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="rounded-md bg-[#004B23]/10 px-2 py-1 font-mono text-xs font-semibold text-[#004B23]">
                              AUD-{entry.id}
                            </span>
                            <motion.span
                              style={getStatusStyle(entry.status)}
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                            >
                              <span
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: getStatusColor(entry.status) }}
                              />
                              {entry.status || "Unknown"}
                            </motion.span>
                          </div>
                          <h4 className="mt-2 text-sm font-semibold text-gray-900">{entry.action}</h4>
                          {entry.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{entry.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-500">{formatDateTime(entry.performedAt)}</p>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
                        {entry.entityName && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">Entity:</span>
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                              {entry.entityName}
                            </span>
                            {entry.entityId && (
                              <span className="font-mono text-xs text-gray-400">#{entry.entityId}</span>
                            )}
                          </div>
                        )}
                        {getActorName("user", entry.userId) && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-white">
                              <MdPerson className="text-xs" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {getActorName("user", entry.userId)}
                            </span>
                          </div>
                        )}
                        {getActorName("agent", entry.agentId) && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex size-5 items-center justify-center rounded-full bg-green-500 text-white">
                              <MdPerson className="text-xs" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {getActorName("agent", entry.agentId)}
                            </span>
                          </div>
                        )}
                        {entry.ipAddress && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">IP:</span>
                            <span className="font-mono text-xs text-gray-600">{entry.ipAddress}</span>
                          </div>
                        )}
                        {getActorName("vendor", entry.vendorId) && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex size-5 items-center justify-center rounded-full bg-purple-500 text-white">
                              <MdPerson className="text-xs" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {getActorName("vendor", entry.vendorId)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Expand indicator */}
                      <div className="mt-2 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-xs text-[#004B23]">Click to view details →</span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        className="mt-3 flex items-center justify-between border-t py-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-sm text-gray-700">
          Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center rounded-md p-2 ${
              currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
            }`}
            whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
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
                  currentPage === pageNum ? "bg-[#004B23] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18, delay: index * 0.03 }}
              >
                {pageNum}
              </motion.button>
            )
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

          {totalPages > 5 && currentPage < totalPages - 1 && (
            <motion.button
              onClick={() => paginate(totalPages)}
              className="flex size-8 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              whileHover={{ scale: 1.05 }}
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
            whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
          >
            <MdOutlineArrowForwardIos />
          </motion.button>
        </div>
      </motion.div>

      {/* Modal / details view */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setSelectedEntry(null)
                setModalTab("overview")
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="border-b border-gray-100 bg-gradient-to-r from-[#004B23] to-[#006B33] px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold text-white">
                        AUD-{selectedEntry.id}
                      </span>
                      <motion.span
                        style={getStatusStyle(selectedEntry.status)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: getStatusColor(selectedEntry.status) }}
                        />
                        {selectedEntry.status || "Unknown"}
                      </motion.span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-white">{selectedEntry.action}</h3>
                    <p className="mt-1 text-sm text-white/70">{formatDateTime(selectedEntry.performedAt)}</p>
                  </div>
                  <motion.button
                    onClick={() => {
                      setSelectedEntry(null)
                      setModalTab("overview")
                    }}
                    className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MdClose className="text-xl" />
                  </motion.button>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex gap-1">
                  {[
                    { id: "overview", label: "Overview", icon: MdInfo },
                    { id: "technical", label: "Technical", icon: MdDevices },
                    { id: "data", label: "Request/Response", icon: MdCode },
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setModalTab(tab.id as typeof modalTab)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        modalTab === tab.id ? "bg-white text-[#004B23]" : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className="text-lg" />
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {modalTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Action Details */}
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <MdInfo className="text-[#004B23]" />
                          Action Details
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium uppercase text-gray-400">Entity</p>
                            <p className="mt-1 font-medium text-gray-900">
                              {selectedEntry.entityName || "-"}
                              {selectedEntry.entityId && (
                                <span className="ml-2 font-mono text-sm text-gray-500">#{selectedEntry.entityId}</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase text-gray-400">Status</p>
                            <div className="mt-1">
                              <span
                                style={getStatusStyle(selectedEntry.status)}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                              >
                                <span
                                  className="size-2 rounded-full"
                                  style={{ backgroundColor: getStatusColor(selectedEntry.status) }}
                                />
                                {selectedEntry.status || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedEntry.description && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <p className="text-xs font-medium uppercase text-gray-400">Description</p>
                            <p className="mt-1 text-gray-700">{selectedEntry.description}</p>
                          </div>
                        )}
                        {selectedEntry.message && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <p className="text-xs font-medium uppercase text-gray-400">Message</p>
                            <p className="mt-1 text-gray-700">{selectedEntry.message}</p>
                          </div>
                        )}
                      </div>

                      {/* User/Actor Details */}
                      <div className="rounded-xl border border-gray-200 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <MdPerson className="text-[#004B23]" />
                          Actor Information
                          {loadingActors && <span className="ml-2 text-xs font-normal text-gray-400">Loading...</span>}
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {selectedEntry.userId && (actorNames.userId || loadingActors) && (
                            <motion.div
                              className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4"
                              whileHover={{ scale: 1.02 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-white">
                                  <MdPerson className="text-lg" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-blue-600">User</p>
                                  <p className="font-semibold text-gray-900">
                                    {loadingActors ? (
                                      <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" />
                                    ) : (
                                      actorNames.userId
                                    )}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {selectedEntry.agentId && (actorNames.agentId || loadingActors) && (
                            <motion.div
                              className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4"
                              whileHover={{ scale: 1.02 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-green-500 text-white">
                                  <MdPerson className="text-lg" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-green-600">Agent</p>
                                  <p className="font-semibold text-gray-900">
                                    {loadingActors ? (
                                      <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" />
                                    ) : (
                                      actorNames.agentId
                                    )}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {selectedEntry.vendorId && selectedEntry.vendorId > 0 && actorNames.vendorId && (
                            <motion.div
                              className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4"
                              whileHover={{ scale: 1.02 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-purple-500 text-white">
                                  <MdPerson className="text-lg" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-purple-600">Vendor</p>
                                  <p className="font-semibold text-gray-900">{actorNames.vendorId}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {selectedEntry.customerId && selectedEntry.customerId > 0 && actorNames.customerId && (
                            <motion.div
                              className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4"
                              whileHover={{ scale: 1.02 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-full bg-orange-500 text-white">
                                  <MdPerson className="text-lg" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-orange-600">Customer</p>
                                  <p className="font-semibold text-gray-900">{actorNames.customerId}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {!selectedEntry.userId &&
                            !selectedEntry.agentId &&
                            (!selectedEntry.vendorId || selectedEntry.vendorId === 0) &&
                            (!selectedEntry.customerId || selectedEntry.customerId === 0) && (
                              <p className="col-span-2 py-4 text-center text-sm text-gray-400">
                                No actor information available
                              </p>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {modalTab === "technical" && (
                    <motion.div
                      key="technical"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Network Info */}
                      <div className="rounded-xl border border-gray-200 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                          <MdDevices className="text-[#004B23]" />
                          Network & Device
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                            <div>
                              <p className="text-xs font-medium text-gray-400">IP Address</p>
                              <p className="mt-1 font-mono text-sm font-semibold text-gray-900">
                                {selectedEntry.ipAddress || "-"}
                              </p>
                            </div>
                            {selectedEntry.ipAddress && (
                              <motion.button
                                onClick={() => copyToClipboard(selectedEntry.ipAddress, "ip")}
                                className="rounded-lg bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {copiedField === "ip" ? <MdCheck className="text-green-600" /> : <MdContentCopy />}
                              </motion.button>
                            )}
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-400">User Agent</p>
                            <p className="mt-1 break-all text-xs text-gray-700">{selectedEntry.userAgent || "-"}</p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg bg-gray-50 p-3">
                              <p className="text-xs font-medium text-gray-400">Device</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedEntry.deviceInfo || "-"}</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-3">
                              <p className="text-xs font-medium text-gray-400">Browser</p>
                              <p className="mt-1 text-sm text-gray-900">{selectedEntry.browserInfo || "-"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {modalTab === "data" && (
                    <motion.div
                      key="data"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Request JSON */}
                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <button
                          onClick={() => toggleSection("request")}
                          className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <MdCode className="text-[#004B23]" />
                            <span className="font-semibold text-gray-900">Request Payload</span>
                            {selectedEntry.requestJson && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Has Data
                              </span>
                            )}
                          </div>
                          <motion.div
                            animate={{ rotate: expandedSections.includes("request") ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <MdExpandMore className="text-xl text-gray-400" />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {expandedSections.includes("request") && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="border-t border-gray-200 p-4">
                                {selectedEntry.requestJson ? (
                                  <div className="relative">
                                    <motion.button
                                      onClick={() => copyToClipboard(selectedEntry.requestJson, "request")}
                                      className="absolute right-2 top-2 rounded-lg bg-gray-700 p-2 text-white transition-colors hover:bg-gray-600"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      {copiedField === "request" ? (
                                        <MdCheck className="text-green-400" />
                                      ) : (
                                        <MdContentCopy />
                                      )}
                                    </motion.button>
                                    <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                                      {(() => {
                                        try {
                                          return JSON.stringify(JSON.parse(selectedEntry.requestJson), null, 2)
                                        } catch {
                                          return selectedEntry.requestJson
                                        }
                                      })()}
                                    </pre>
                                  </div>
                                ) : (
                                  <p className="py-4 text-center text-sm text-gray-400">No request data available</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Response JSON */}
                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <button
                          onClick={() => toggleSection("response")}
                          className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <MdCode className="text-[#004B23]" />
                            <span className="font-semibold text-gray-900">Response Payload</span>
                            {selectedEntry.responseJson && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                Has Data
                              </span>
                            )}
                          </div>
                          <motion.div
                            animate={{ rotate: expandedSections.includes("response") ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <MdExpandMore className="text-xl text-gray-400" />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {expandedSections.includes("response") && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="border-t border-gray-200 p-4">
                                {selectedEntry.responseJson ? (
                                  <div className="relative">
                                    <motion.button
                                      onClick={() => copyToClipboard(selectedEntry.responseJson, "response")}
                                      className="absolute right-2 top-2 rounded-lg bg-gray-700 p-2 text-white transition-colors hover:bg-gray-600"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      {copiedField === "response" ? (
                                        <MdCheck className="text-green-400" />
                                      ) : (
                                        <MdContentCopy />
                                      )}
                                    </motion.button>
                                    <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                                      {(() => {
                                        try {
                                          return JSON.stringify(JSON.parse(selectedEntry.responseJson), null, 2)
                                        } catch {
                                          return selectedEntry.responseJson
                                        }
                                      })()}
                                    </pre>
                                  </div>
                                ) : (
                                  <p className="py-4 text-center text-sm text-gray-400">No response data available</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Metadata */}
                      {selectedEntry.metadata && (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                          <button
                            onClick={() => toggleSection("metadata")}
                            className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-2">
                              <MdInfo className="text-[#004B23]" />
                              <span className="font-semibold text-gray-900">Metadata</span>
                              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                Has Data
                              </span>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedSections.includes("metadata") ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <MdExpandMore className="text-xl text-gray-400" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {expandedSections.includes("metadata") && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="border-t border-gray-200 p-4">
                                  <div className="relative">
                                    <motion.button
                                      onClick={() => copyToClipboard(selectedEntry.metadata, "metadata")}
                                      className="absolute right-2 top-2 rounded-lg bg-gray-700 p-2 text-white transition-colors hover:bg-gray-600"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      {copiedField === "metadata" ? (
                                        <MdCheck className="text-green-400" />
                                      ) : (
                                        <MdContentCopy />
                                      )}
                                    </motion.button>
                                    <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">
                                      {(() => {
                                        try {
                                          return JSON.stringify(JSON.parse(selectedEntry.metadata), null, 2)
                                        } catch {
                                          return selectedEntry.metadata
                                        }
                                      })()}
                                    </pre>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Performed at {formatDateTime(selectedEntry.performedAt)}</p>
                  <motion.button
                    onClick={() => {
                      setSelectedEntry(null)
                      setModalTab("overview")
                    }}
                    className="rounded-lg bg-[#004B23] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003318]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AuditTrailTab
