"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { BillsIcon, MapIcon, PhoneIcon, PlusIcon, UserIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { AgentsRequestParams, type Agent as BackendAgent, fetchAgents } from "lib/redux/agentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { formatCurrency } from "utils/formatCurrency"

// Dropdown Popover Component
const DropdownPopover = ({
  options,
  selectedValue,
  onSelect,
  children,
}: {
  options: { value: number; label: string }[]
  selectedValue: number
  onSelect: (value: number) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {children}
        <svg
          className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left ${
                  option.value === selectedValue ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface Agent {
  id: number
  name: string
  status: "active" | "inactive" | "low float"
  phone: string
  location: string
  dailyCollection: string
  vendsToday: number
  floatBalance: string
  commissionRate: string
  performance: "Excellent" | "Good" | "Average" | "Poor"
}

interface ActionDropdownProps {
  agent: Agent
  onViewDetails: (agent: Agent) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ agent, onViewDetails }) => {
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
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
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
              >
                View Details
              </button>
              <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Edit
              </button>
              <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAddAgentModalOpen && (
        <AddAgentModal
          isOpen={isAddAgentModalOpen}
          onRequestClose={() => setIsAddAgentModalOpen(false)}
          onSuccess={() => {
            setIsAddAgentModalOpen(false)
            // Refresh agents list
          }}
        />
      )}
    </div>
  )
}

const SupervisorsDirectory: React.FC = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { agents, loading, error, pagination } = useAppSelector((state) => state.agents)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)

  const [searchText, setSearchText] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Filter state
  const [localFilters, setLocalFilters] = useState<{
    status?: string
    canCollectCash?: boolean
    areaOfficeId?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({
    sortBy: "",
    sortOrder: "asc",
  })

  const [appliedFilters, setAppliedFilters] = useState<{
    status?: string
    canCollectCash?: boolean
    areaOfficeId?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({})

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch area offices for filter options
  useEffect(() => {
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )

    return () => {
      dispatch(clearAreaOffices())
    }
  }, [dispatch])

  // Filter options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "LowFloat", label: "Low Float" },
  ]

  const canCollectCashOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  const areaOfficeOptions = [
    { value: "", label: "All Area Offices" },
    ...areaOffices.map((office) => ({
      value: office.id,
      label: office.nameOfNewOAreaffice || `Area Office ${office.id}`,
    })),
  ]

  const sortOptions: SortOption[] = [
    { label: "Name (A-Z)", value: "name", order: "asc" },
    { label: "Name (Z-A)", value: "name", order: "desc" },
    { label: "Status (A-Z)", value: "status", order: "asc" },
    { label: "Status (Z-A)", value: "status", order: "desc" },
    { label: "Cash At Hand (Low to High)", value: "cashAtHand", order: "asc" },
    { label: "Cash At Hand (High to Low)", value: "cashAtHand", order: "desc" },
  ]

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  // Handle sort changes
  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({
      status: localFilters.status,
      canCollectCash: localFilters.canCollectCash,
      areaOfficeId: localFilters.areaOfficeId,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({})
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.status) count++
    if (appliedFilters.canCollectCash !== undefined) count++
    if (appliedFilters.areaOfficeId) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  // Fetch agents with filters
  useEffect(() => {
    const params: AgentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.canCollectCash !== undefined && { canCollectCash: appliedFilters.canCollectCash }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
      AgentType: "Supervisor",
    }

    dispatch(fetchAgents(params))

    return () => {
      // Don't clear agents on unmount to preserve data
    }
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  const getStatusConfig = (status: string, canCollectCash: boolean) => {
    const normalized = status.toLowerCase()
    if (normalized === "active") {
      return { label: "Active", bg: "bg-green-100", text: "text-green-800" }
    }
    if (normalized === "inactive") {
      return { label: "Inactive", bg: "bg-gray-100", text: "text-gray-800" }
    }
    return canCollectCash
      ? { label: "Active", bg: "bg-green-100", text: "text-green-800" }
      : { label: "Inactive", bg: "bg-gray-100", text: "text-gray-800" }
  }

  if (loading && agents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="rounded-lg border bg-white p-4 sm:p-6">
          <div className="mb-6">
            <div className="mb-2 h-7 w-40 rounded bg-gray-200 sm:h-8"></div>
            <div className="h-12 w-full rounded-lg bg-gray-200 sm:w-96"></div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4">
                <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <div className="size-5 rounded-full bg-gray-200"></div>
                      <div className="h-5 w-40 rounded bg-gray-200 sm:w-48"></div>
                      <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-32 rounded bg-gray-200"></div>
                      <div className="h-4 w-40 rounded bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
                    <div className="h-5 w-24 rounded bg-gray-200"></div>
                    <div className="h-3 w-16 rounded bg-gray-200"></div>
                    <div className="h-9 w-24 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 2xl:flex-row">
        {/* Main Content */}
        <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-lg border bg-white p-3 sm:p-4 md:p-6 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-lg border bg-white p-3 sm:p-4 md:p-6 2xl:flex-1"
          }
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 sm:mb-6">
            <div className="mb-4 flex w-full flex-col justify-between gap-4 max-md:flex-col md:flex-row md:items-center">
              <h3 className="text-lg font-semibold sm:text-xl">Supervisors Directory</h3>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 2xl:hidden"
                >
                  <Filter className="size-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* Active filters badge - Desktop only (2xl and above) */}
                {getActiveFilterCount() > 0 && (
                  <div className="hidden items-center gap-2 2xl:flex">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                <button
                  type="button"
                  onClick={() => setShowDesktopFilters((prev) => !prev)}
                  className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                >
                  {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                  {showDesktopFilters ? "Hide filters" : "Show filters"}
                </button>
              </div>
            </div>

            <div className="w-full sm:w-96">
              <SearchModule
                placeholder="Search supervisors..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                className="w-full"
              />
            </div>
            {error && (
              <div className="mt-2 rounded-lg bg-red-50 p-2 sm:p-3">
                <p className="text-xs text-red-600 sm:text-sm">Error loading supervisors: {error}</p>
              </div>
            )}
          </div>

          {/* Supervisors List */}
          <div className="space-y-3 sm:space-y-4">
            {agents.map((agent) => {
              const statusConfig = getStatusConfig(agent.status, agent.canCollectCash)
              const phone = agent.user.phoneNumber
              const location = agent.areaOfficeName || agent.serviceCenterName || "N/A"

              return (
                <div
                  key={agent.id}
                  className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 transition-shadow duration-200 hover:shadow-sm"
                >
                  <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <div className="text-gray-600">
                          <UserIcon />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{agent.user.fullName}</h4>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1">
                          <PhoneIcon />
                          <p className="text-sm text-gray-600">{phone}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapIcon />
                          <p className="text-sm text-gray-600">{location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
                      <p className="text-sm font-semibold text-gray-900 sm:text-base">
                        {formatCurrency(agent.cashAtHand)}
                      </p>
                      <p className="text-xs text-gray-500 sm:text-sm">Cash at hand</p>
                      <ButtonModule
                        variant="outline"
                        type="button"
                        size="sm"
                        onClick={() => router.push(`/agent-management/all-supervisors/supervisor-detail/${agent.id}`)}
                        className="mt-1 bg-white text-xs sm:text-sm"
                      >
                        View Details
                      </ButtonModule>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 text-xs sm:gap-4 sm:text-sm">
                    <div className="flex items-center gap-2">
                      <BillsIcon />
                      <div>
                        <p className="text-gray-500">Collection limit</p>
                        <p className="font-medium text-green-600">{formatCurrency(agent.cashCollectionLimit)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CyclesIcon />
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className="font-medium text-green-600">{agent.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon />
                      <div>
                        <p className="text-gray-500">Last collection</p>
                        <p className="font-medium text-green-600">
                          {agent.lastCashCollectionDate
                            ? new Date(agent.lastCashCollectionDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {agents.length === 0 && !loading && (
            <div className="py-8 text-center">
              <p className="text-gray-500">No supervisors found</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default SupervisorsDirectory
