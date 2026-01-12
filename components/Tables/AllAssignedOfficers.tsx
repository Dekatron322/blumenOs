"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { Filter } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { Agent, AgentsRequestParams, clearAgents, clearError, fetchAgents, setPagination } from "lib/redux/agentSlice"

interface ActionDropdownProps {
  agent: Agent
  onViewDetails: (agent: Agent) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ agent, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
    onViewDetails(agent)
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
                  // You can add edit agent functionality here
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Agent
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LoadingSkeleton = () => {
  return (
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5">
      {/* Header Section Skeleton */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="mb-3 md:mb-0">
          <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-48 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(11)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(11)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section Skeleton */}
      <div className="flex items-center justify-between border-t py-3">
        <div className="h-6 w-48 rounded bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200"></div>
          ))}
          <div className="size-8 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}

interface AppliedFilters {
  search?: string
  status?: string
  areaOfficeId?: number
  serviceCenterId?: number
  canCollectCash?: boolean
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface AllAssignedOfficersProps {
  appliedFilters?: AppliedFilters
  showStatisticsOnly?: boolean
  showMobileFilters?: boolean
  setShowMobileFilters?: (show: boolean) => void
  showDesktopFilters?: boolean
  setShowDesktopFilters?: (show: boolean) => void
  getActiveFilterCount?: () => number
}

const AllAssignedOfficers: React.FC<AllAssignedOfficersProps> = ({
  appliedFilters = {} as AppliedFilters,
  showStatisticsOnly = false,
  showMobileFilters,
  setShowMobileFilters,
  showDesktopFilters,
  setShowDesktopFilters,
  getActiveFilterCount,
}) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { agents, loading, error, pagination } = useAppSelector((state) => state.agents)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")

  const handleViewAgentDetails = (agent: Agent) => {
    router.push(`/agents/agent-details/${agent.id}`)
  }

  // Get pagination values from Redux state
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize
  const totalRecords = pagination.totalCount
  const totalPages = pagination.totalPages

  // Fetch agents on component mount and when search/pagination/filters change
  useEffect(() => {
    const fetchParams: AgentsRequestParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(searchText && { search: searchText }),
      // Applied filters from parent component
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.serviceCenterId && { serviceCenterId: appliedFilters.serviceCenterId }),
      ...(appliedFilters.canCollectCash !== undefined && { canCollectCash: appliedFilters.canCollectCash }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    dispatch(fetchAgents(fetchParams))
  }, [
    dispatch,
    currentPage,
    pageSize,
    searchText,
    appliedFilters.status,
    appliedFilters.areaOfficeId,
    appliedFilters.serviceCenterId,
    appliedFilters.canCollectCash,
    appliedFilters.sortBy,
    appliedFilters.sortOrder,
  ])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearAgents())
    }
  }, [dispatch])

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          dotColor: "#589E67",
        }
      case "inactive":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          dotColor: "#AF4B4B",
        }
      case "suspended":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          dotColor: "#D97706",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          dotColor: "#6B7280",
        }
    }
  }

  const getCashCollectionStyle = (canCollectCash: boolean) => {
    return {
      backgroundColor: canCollectCash ? "#DCFCE7" : "#F7EDED",
      color: canCollectCash ? "#16A34A" : "#AF4B4B",
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    // Reset to first page when searching
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    // Reset to first page when clearing search
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const paginate = (pageNumber: number) => {
    dispatch(setPagination({ page: pageNumber, pageSize }))
  }

  // If only showing statistics, return just the statistics cards
  if (showStatisticsOnly) {
    return (
      <>
        {agents.length > 0 && (
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="rounded-lg border border-[#004B23]/20 bg-[#004B23]/5 p-4 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-[#004B23]/80">Total Agents</div>
              <div className="mt-1 text-xl font-semibold text-[#004B23]">{agents.length}</div>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">Active</div>
              <div className="mt-1 text-xl font-semibold text-emerald-900">
                {agents.filter((a) => a.status.toLowerCase() === "active").length}
              </div>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-amber-700">Can Collect Cash</div>
              <div className="mt-1 text-xl font-semibold text-amber-900">
                {agents.filter((a) => a.canCollectCash).length}
              </div>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50 p-4 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-red-700">Inactive</div>
              <div className="mt-1 text-xl font-semibold text-red-900">
                {agents.filter((a) => a.status.toLowerCase() === "inactive").length}
              </div>
            </div>
          </motion.div>
        )}
      </>
    )
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="w-full">
      {/* Header Section with Search and Filters */}
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          {setShowMobileFilters && (
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 2xl:hidden"
            >
              <Filter className="size-4" />
              Filters
              {getActiveFilterCount && getActiveFilterCount() > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          )}

          {/* Desktop Filter Toggle */}
          {setShowDesktopFilters && (
            <button
              onClick={() => setShowDesktopFilters(!showDesktopFilters)}
              className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 2xl:flex"
            >
              <Filter className="size-4" />
              {showDesktopFilters ? "Hide Filters" : "Show Filters"}
              {getActiveFilterCount && getActiveFilterCount() > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          )}
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search agents..."
            className="w-full max-w-[380px]"
            bgClassName="bg-white"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
          <p>Error loading agents: {error}</p>
        </div>
      )}

      {agents.length === 0 ? (
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
            {searchText ? "No matching agents found" : "No agents available"}
          </motion.p>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {searchText
              ? "Try adjusting your search term"
              : "Agents will appear here once they are added to the system"}
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
                      Agent Code
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("fullName")}
                  >
                    <div className="flex items-center gap-2">
                      Name <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("phoneNumber")}
                  >
                    <div className="flex items-center gap-2">
                      Phone <RxCaretSort />
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
                    onClick={() => toggleSort("canCollectCash")}
                  >
                    <div className="flex items-center gap-2">
                      Cash Collection <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("cashCollectionLimit")}
                  >
                    <div className="flex items-center gap-2">
                      Collection Limit <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("areaOfficeName")}
                  >
                    <div className="flex items-center gap-2">
                      Area Office <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("serviceCenterName")}
                  >
                    <div className="flex items-center gap-2">
                      Service Center <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("lastCashCollectionDate")}
                  >
                    <div className="flex items-center gap-2">
                      Last Collection <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {agents.map((agent, index) => (
                    <motion.tr
                      key={agent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                        {agent.agentCode || `AG-${agent.id}`}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{agent.user.fullName || "-"}</div>
                          <div className="text-xs text-gray-500">{agent.user.employeeId || ""}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{agent.user.email || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{agent.user.phoneNumber || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getStatusStyle(agent.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: getStatusStyle(agent.status).dotColor,
                            }}
                          ></span>
                          {agent.status}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getCashCollectionStyle(agent.canCollectCash)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {agent.canCollectCash ? "Yes" : "No"}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-semibold">
                        {agent.cashCollectionLimit ? formatCurrency(agent.cashCollectionLimit) : "-"}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{agent.areaOfficeName || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{agent.serviceCenterName || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {agent.lastCashCollectionDate ? formatDate(agent.lastCashCollectionDate) : "-"}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ActionDropdown agent={agent} onViewDetails={handleViewAgentDetails} />
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
              {totalRecords} agents
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
                        ? "bg-[#004B23] text-white"
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
                      ? "bg-[#004B23] text-white"
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
    </div>
  )
}

export default AllAssignedOfficers
