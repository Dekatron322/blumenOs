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
                  console.log("Edit agent:", agent.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Edit Agent
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Manage float:", agent.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Manage Float
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
    <motion.div
      className="mt-5 flex flex-1 flex-col rounded-md border bg-white p-5"
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
              {[...Array(9)].map((_, i) => (
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
                {[...Array(9)].map((_, cellIndex) => (
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
                            delay: (rowIndex * 9 + cellIndex) * 0.05,
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

// Mobile Filter Sidebar Component
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  statusOptions,
  canCollectCashOptions,
  areaOfficeOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | boolean | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  statusOptions: Array<{ value: string; label: string }>
  canCollectCashOptions: Array<{ value: string; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
}) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-filter-sidebar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            key="mobile-filter-content"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex h-full w-full max-w-sm flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-shrink-0 border-b bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold">Filters & Sorting</h2>
                    {getActiveFilterCount() > 0 && (
                      <p className="text-xs text-gray-500">{getActiveFilterCount()} active filter(s)</p>
                    )}
                  </div>
                </div>
                <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
                  Clear All
                </button>
              </div>
            </div>

            {/* Filter Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "status",
                              localFilters.status === option.value ? undefined : option.value
                            )
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.status === option.value
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Can Collect Cash Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Can Collect Cash</label>
                  <div className="grid grid-cols-2 gap-2">
                    {canCollectCashOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "canCollectCash",
                              localFilters.canCollectCash === (option.value === "true")
                                ? undefined
                                : option.value === "true"
                            )
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.canCollectCash === (option.value === "true")
                              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Area Office Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                  <FormSelectModule
                    name="areaOfficeId"
                    value={localFilters.areaOfficeId || ""}
                    onChange={(e) =>
                      handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={areaOfficeOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Cash At Hand Range */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Min Cash At Hand</label>
                  <input
                    type="number"
                    value={localFilters.minCashAtHand || ""}
                    onChange={(e) =>
                      handleFilterChange("minCashAtHand", e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Enter minimum amount"
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Max Cash At Hand</label>
                  <input
                    type="number"
                    value={localFilters.maxCashAtHand || ""}
                    onChange={(e) =>
                      handleFilterChange("maxCashAtHand", e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Enter maximum amount"
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                    Last Collection From
                  </label>
                  <input
                    type="date"
                    value={localFilters.lastCashCollectionDateFrom || ""}
                    onChange={(e) => handleFilterChange("lastCashCollectionDateFrom", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                    Last Collection To
                  </label>
                  <input
                    type="date"
                    value={localFilters.lastCashCollectionDateTo || ""}
                    onChange={(e) => handleFilterChange("lastCashCollectionDateTo", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSortExpanded((prev) => !prev)}
                    className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                    aria-expanded={isSortExpanded}
                  >
                    <span>Sort By</span>
                    {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isSortExpanded && (
                    <div className="space-y-2">
                      {sortOptions.map((option) => (
                        <button
                          key={`${option.value}-${option.order}`}
                          onClick={() => handleSortChange(option)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{option.label}</span>
                          {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                            <span className="text-purple-600">
                              {option.order === "asc" ? (
                                <SortAsc className="size-4" />
                              ) : (
                                <SortDesc className="size-4" />
                              )}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons - Fixed */}
            <div className="flex-shrink-0 border-t bg-white p-4 2xl:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="button-filled flex-1"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="button-oulined flex-1"
                >
                  Reset All
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const generateAgentData = () => {
  return {
    activeAgents: 48,
    collectionsToday: 7200000, // ₦7.2M in kobo
    targetAchievement: 85.2,
    lowFloatAlerts: 3,
  }
}

const AllAgents: React.FC = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { agents: backendAgents, loading, error, pagination } = useAppSelector((state) => state.agents)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)

  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // Default 8 minutes (480,000 ms)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agentData, setAgentData] = useState(generateAgentData())
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(false)
  const pageSize = 10

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    status: undefined as string | undefined,
    canCollectCash: undefined as boolean | undefined,
    areaOfficeId: undefined as number | undefined,
    serviceCenterId: undefined as number | undefined,
    minCashAtHand: undefined as number | undefined,
    maxCashAtHand: undefined as number | undefined,
    lastCashCollectionDateFrom: undefined as string | undefined,
    lastCashCollectionDateTo: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    status: undefined as string | undefined,
    canCollectCash: undefined as boolean | undefined,
    areaOfficeId: undefined as number | undefined,
    serviceCenterId: undefined as number | undefined,
    minCashAtHand: undefined as number | undefined,
    maxCashAtHand: undefined as number | undefined,
    lastCashCollectionDateFrom: undefined as string | undefined,
    lastCashCollectionDateTo: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  // Map backend agents into table display shape
  const agents: Agent[] = backendAgents.map((agent: BackendAgent) => ({
    id: agent.id,
    name: agent.user.fullName,
    status:
      agent.status.toLowerCase() === "active"
        ? "active"
        : agent.status.toLowerCase() === "inactive"
        ? "inactive"
        : "low float",
    phone: agent.user.phoneNumber,
    location: agent.areaOfficeName || agent.serviceCenterName || "N/A",
    // Using cashAtHand as daily collection placeholder for now
    dailyCollection: formatCurrency(agent.cashAtHand, "₦"),
    // Placeholder since backend does not expose vends count here
    vendsToday: 0,
    // Use cashCollectionLimit as a proxy for float balance
    floatBalance: formatCurrency(agent.cashCollectionLimit, "₦"),
    commissionRate: "-",
    performance: "Good",
  }))

  const isLoading = loading
  const isError = !!error
  const totalRecords = pagination.totalCount || agents.length
  const totalPages = pagination.totalPages || Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "inactive":
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      case "low float":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getPerformanceStyle = (performance: Agent["performance"]) => {
    switch (performance) {
      case "Excellent":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "Good":
        return {
          backgroundColor: "#F0F7FF",
          color: "#003F9F",
        }
      case "Average":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "Poor":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const handleAddAgentSuccess = async () => {
    setIsAddAgentModalOpen(false)
    // Refresh data after adding agent
    setAgentData(generateAgentData())
  }

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

  // Filter handlers
  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  const applyFilters = () => {
    setAppliedFilters({
      status: localFilters.status,
      canCollectCash: localFilters.canCollectCash,
      areaOfficeId: localFilters.areaOfficeId,
      serviceCenterId: localFilters.serviceCenterId,
      minCashAtHand: localFilters.minCashAtHand,
      maxCashAtHand: localFilters.maxCashAtHand,
      lastCashCollectionDateFrom: localFilters.lastCashCollectionDateFrom,
      lastCashCollectionDateTo: localFilters.lastCashCollectionDateTo,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortBy ? localFilters.sortOrder : undefined,
    })
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setLocalFilters({
      status: undefined,
      canCollectCash: undefined,
      areaOfficeId: undefined,
      serviceCenterId: undefined,
      minCashAtHand: undefined,
      maxCashAtHand: undefined,
      lastCashCollectionDateFrom: undefined,
      lastCashCollectionDateTo: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      status: undefined,
      canCollectCash: undefined,
      areaOfficeId: undefined,
      serviceCenterId: undefined,
      minCashAtHand: undefined,
      maxCashAtHand: undefined,
      lastCashCollectionDateFrom: undefined,
      lastCashCollectionDateTo: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setCurrentPage(1)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.status) count++
    if (appliedFilters.canCollectCash !== undefined) count++
    if (appliedFilters.areaOfficeId) count++
    if (appliedFilters.serviceCenterId) count++
    if (appliedFilters.minCashAtHand) count++
    if (appliedFilters.maxCashAtHand) count++
    if (appliedFilters.lastCashCollectionDateFrom) count++
    if (appliedFilters.lastCashCollectionDateTo) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleRefreshData = () => {
    const params: AgentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      search: searchText || undefined,
      status: appliedFilters.status,
      canCollectCash: appliedFilters.canCollectCash,
      areaOfficeId: appliedFilters.areaOfficeId,
      serviceCenterId: appliedFilters.serviceCenterId,
      minCashAtHand: appliedFilters.minCashAtHand,
      maxCashAtHand: appliedFilters.maxCashAtHand,
      lastCashCollectionDateFrom: appliedFilters.lastCashCollectionDateFrom,
      lastCashCollectionDateTo: appliedFilters.lastCashCollectionDateTo,
      sortBy: appliedFilters.sortBy,
      sortOrder: appliedFilters.sortOrder,
    }
    dispatch(fetchAgents(params))
  }

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Polling interval options - 8 minutes as default
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 600000, label: "10m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      handleRefreshData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [isPolling, pollingInterval, currentPage, searchText, appliedFilters, pageSize])

  // Fetch agents based on applied filters
  useEffect(() => {
    const params: AgentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      search: searchText || undefined,
      status: appliedFilters.status,
      canCollectCash: appliedFilters.canCollectCash,
      areaOfficeId: appliedFilters.areaOfficeId,
      serviceCenterId: appliedFilters.serviceCenterId,
      minCashAtHand: appliedFilters.minCashAtHand,
      maxCashAtHand: appliedFilters.maxCashAtHand,
      lastCashCollectionDateFrom: appliedFilters.lastCashCollectionDateFrom,
      lastCashCollectionDateTo: appliedFilters.lastCashCollectionDateTo,
    }

    dispatch(fetchAgents(params))
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div>Error loading agents</div>

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-8 2xl:container sm:px-4 lg:px-6 2xl:px-16">
            <div className="mb-4 flex w-full justify-between max-md:flex-col max-sm:my-4 ">
              <div>
                <h4 className="text-2xl font-semibold">Sales Rep Management</h4>
                <p>Field sales reps onboarding, commissions, and performance tracking</p>
              </div>

              {/* Auto-refresh controls */}
              <div className="flex items-center gap-2 rounded-md border-r bg-white p-2 pr-3">
                <span className="text-sm font-medium text-gray-500">Auto-refresh:</span>
                <button
                  onClick={togglePolling}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isPolling
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {isPolling ? (
                    <>
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      ON
                    </>
                  ) : (
                    <>
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      OFF
                    </>
                  )}
                </button>

                {isPolling && (
                  <DropdownPopover
                    options={pollingOptions}
                    selectedValue={pollingInterval}
                    onSelect={handlePollingIntervalChange}
                  >
                    <span className="text-sm font-medium">
                      {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                    </span>
                  </DropdownPopover>
                )}
              </div>
            </div>
            <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 2xl:flex-row">
              {/* Main Content - Agent Table */}
              <motion.div
                className={
                  showDesktopFilters
                    ? "w-full rounded-md border bg-white p-3 md:p-4 lg:p-6 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
                    : "w-full rounded-md border bg-white p-3 md:p-4 lg:p-6 2xl:flex-1"
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Table Header */}
                <motion.div
                  className="items-center justify-between border-b py-2 md:flex md:py-4"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    {/* Filter Button for ALL screens up to 2xl */}
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
                    >
                      <Filter className="size-4" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </button>
                    <div>
                      <h3 className="text-lg font-medium max-sm:pb-2 md:text-2xl">Sales Rep Directory</h3>
                      <p className="text-sm text-gray-600">View and manage all field agents</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 md:mt-0">
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
                    <SearchModule
                      placeholder="Search agents..."
                      value={searchText}
                      onChange={handleSearch}
                      onCancel={handleCancelSearch}
                      className="w-[260px] md:w-[320px]"
                      bgClassName="bg-white"
                    />
                  </div>
                </motion.div>

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
                  </motion.div>
                ) : (
                  <>
                    {/* Table Wrapper - responsive with horizontal scroll on small screens */}
                    <motion.div
                      className="w-full overflow-x-auto border-x bg-[#FFFFFF]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <table className="w-full border-separate border-spacing-0 text-left md:min-w-[900px] 2xl:min-w-[1200px]">
                        <thead>
                          <tr>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                                Agent Name
                              </div>
                            </th>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
                              <div className="flex items-center gap-2">Status</div>
                            </th>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
                              <div className="flex items-center gap-2">Phone</div>
                            </th>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
                              <div className="flex items-center gap-2">Location</div>
                            </th>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
                              <div className="flex items-center gap-2">Daily Collection</div>
                            </th>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
                              <div className="flex items-center gap-2">Vends Today</div>
                            </th>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
                              <div className="flex items-center gap-2">Float Balance</div>
                            </th>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
                              <div className="flex items-center gap-2">Performance</div>
                            </th>
                            <th className="whitespace-nowrap border-y p-4 text-sm">
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
                                  <div className="flex items-center gap-2">
                                    <UserIcon />
                                    {agent.name}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  <motion.div
                                    style={getStatusStyle(agent.status)}
                                    className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    <span
                                      className="size-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          agent.status === "active"
                                            ? "#589E67"
                                            : agent.status === "inactive"
                                            ? "#6B7280"
                                            : "#AF4B4B",
                                      }}
                                    ></span>
                                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                                  </motion.div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <PhoneIcon />
                                    {agent.phone}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapIcon />
                                    {agent.location}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                                  {agent.dailyCollection}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{agent.vendsToday}</td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <BillsIcon />
                                    <span className={agent.status === "low float" ? "text-red-600" : "text-green-600"}>
                                      {agent.floatBalance}
                                    </span>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  <motion.div
                                    style={getPerformanceStyle(agent.performance)}
                                    className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    <span
                                      className="size-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          agent.performance === "Excellent"
                                            ? "#589E67"
                                            : agent.performance === "Good"
                                            ? "#003F9F"
                                            : agent.performance === "Average"
                                            ? "#AF4B4B"
                                            : "#AF4B4B",
                                      }}
                                    ></span>
                                    {agent.performance}
                                  </motion.div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                                  <ButtonModule
                                    variant="outline"
                                    type="button"
                                    size="sm"
                                    onClick={() => router.push(`/agent-management/all-agents/agent-detail/${agent.id}`)}
                                  >
                                    View details
                                  </ButtonModule>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </motion.div>

                    {/* Pagination */}
                    <motion.div
                      className="flex items-center justify-between border-t py-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)}{" "}
                        of {totalRecords} agents
                        {getActiveFilterCount() > 0 && " - filtered"}
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
                            currentPage === totalPages
                              ? "cursor-not-allowed text-gray-400"
                              : "text-[#003F9F] hover:bg-gray-100"
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

              {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
              {showDesktopFilters && (
                <motion.div
                  key="desktop-filters-sidebar"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="hidden w-full flex-col rounded-md border bg-white 2xl:flex 2xl:w-80 2xl:self-start"
                >
                  <div className="flex-shrink-0 border-b bg-white p-3 md:p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
                      >
                        <X className="size-3 md:size-4" />
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 md:p-5">
                    <div className="space-y-4">
                      {/* Status Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          {statusOptions
                            .filter((opt) => opt.value !== "")
                            .map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  handleFilterChange(
                                    "status",
                                    localFilters.status === option.value ? undefined : option.value
                                  )
                                }
                                className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                                  localFilters.status === option.value
                                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Can Collect Cash Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Can Collect Cash
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {canCollectCashOptions
                            .filter((opt) => opt.value !== "")
                            .map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  handleFilterChange(
                                    "canCollectCash",
                                    localFilters.canCollectCash === (option.value === "true")
                                      ? undefined
                                      : option.value === "true"
                                  )
                                }
                                className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                                  localFilters.canCollectCash === (option.value === "true")
                                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Area Office Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                        <FormSelectModule
                          name="areaOfficeId"
                          value={localFilters.areaOfficeId || ""}
                          onChange={(e) =>
                            handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                          }
                          options={areaOfficeOptions}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      {/* Cash At Hand Range */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Min Cash At Hand
                        </label>
                        <input
                          type="number"
                          value={localFilters.minCashAtHand || ""}
                          onChange={(e) =>
                            handleFilterChange("minCashAtHand", e.target.value ? Number(e.target.value) : undefined)
                          }
                          placeholder="Enter minimum amount"
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Max Cash At Hand
                        </label>
                        <input
                          type="number"
                          value={localFilters.maxCashAtHand || ""}
                          onChange={(e) =>
                            handleFilterChange("maxCashAtHand", e.target.value ? Number(e.target.value) : undefined)
                          }
                          placeholder="Enter maximum amount"
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
                      </div>

                      {/* Date Range Filters */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Last Collection From
                        </label>
                        <input
                          type="date"
                          value={localFilters.lastCashCollectionDateFrom || ""}
                          onChange={(e) =>
                            handleFilterChange("lastCashCollectionDateFrom", e.target.value || undefined)
                          }
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Last Collection To
                        </label>
                        <input
                          type="date"
                          value={localFilters.lastCashCollectionDateTo || ""}
                          onChange={(e) => handleFilterChange("lastCashCollectionDateTo", e.target.value || undefined)}
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
                      </div>

                      {/* Sort Options */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setIsSortExpanded((prev) => !prev)}
                          className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                          aria-expanded={isSortExpanded}
                        >
                          <span>Sort By</span>
                          {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </button>

                        {isSortExpanded && (
                          <div className="space-y-2">
                            {sortOptions.map((option) => (
                              <button
                                key={`${option.value}-${option.order}`}
                                onClick={() => handleSortChange(option)}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                                  localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                                    ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                <span>{option.label}</span>
                                {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                                  <span className="text-purple-600">
                                    {option.order === "asc" ? (
                                      <SortAsc className="size-4" />
                                    ) : (
                                      <SortDesc className="size-4" />
                                    )}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 space-y-3 border-t bg-white p-3 md:p-5">
                    <button
                      onClick={applyFilters}
                      className="button-filled flex w-full items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <Filter className="size-4" />
                      Apply Filters
                    </button>
                    <button
                      onClick={resetFilters}
                      className="button-oulined flex w-full items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <X className="size-4" />
                      Reset All
                    </button>
                  </div>

                  {/* Summary Stats */}
                  <div className="flex-shrink-0 rounded-lg bg-gray-50 p-3 md:p-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
                    <div className="space-y-1 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Records:</span>
                        <span className="font-medium">{totalRecords.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Page:</span>
                        <span className="font-medium">
                          {currentPage} / {totalPages || 1}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Filters:</span>
                        <span className="font-medium">{getActiveFilterCount()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <MobileFilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        statusOptions={statusOptions}
        canCollectCashOptions={canCollectCashOptions}
        areaOfficeOptions={areaOfficeOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
      <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onRequestClose={() => setIsAddAgentModalOpen(false)}
        onSuccess={handleAddAgentSuccess}
      />
    </section>
  )
}

export default AllAgents
