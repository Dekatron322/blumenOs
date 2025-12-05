"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { BillsIcon, MapIcon, PhoneIcon, PlusIcon, UserIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { type Agent as BackendAgent, fetchAgents } from "lib/redux/agentSlice"
import { formatCurrency } from "utils/formatCurrency"

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
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agentData, setAgentData] = useState(generateAgentData())
  const pageSize = 10

  const { agents: backendAgents, loading, error, pagination } = useAppSelector((state) => state.agents)

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

  const handleAddAgentSuccess = async () => {
    setIsAddAgentModalOpen(false)
    // Refresh data after adding agent
    setAgentData(generateAgentData())
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  useEffect(() => {
    dispatch(
      fetchAgents({
        pageNumber: currentPage,
        pageSize,
        search: searchText || undefined,
      })
    )
  }, [dispatch, currentPage, pageSize, searchText])

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div>Error loading agents</div>

  return (
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full ">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto px-16 py-8 max-sm:px-3">
            <div className="mb-4 flex w-full justify-between max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div>
                <h4 className="text-2xl font-semibold">Agent Management</h4>
                <p>Field agent onboarding, commissions, and performance tracking</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="mt-2"
                  icon={<PlusIcon />}
                  onClick={() => setIsAddAgentModalOpen(true)}
                >
                  Add New Agent
                </ButtonModule>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-6"
            >
              {/* Left Column - Agent Table */}
              <div className="flex-1">
                <motion.div
                  className="rounded-lg border bg-white p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h3 className="mb-2 text-lg font-semibold">Agent Directory</h3>
                    <SearchModule
                      placeholder="Search agents..."
                      value={searchText}
                      onChange={handleSearch}
                      onCancel={handleCancelSearch}
                    />
                  </div>

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
                      <motion.div
                        className="w-full overflow-x-auto border-x bg-[#FFFFFF]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                          <thead>
                            <tr>
                              <th className="whitespace-nowrap border-y p-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                                  Agent Name
                                </div>
                              </th>
                              <th
                                className="text-500 cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("status")}
                              >
                                <div className="flex items-center gap-2">
                                  Status <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("phone")}
                              >
                                <div className="flex items-center gap-2">
                                  Phone <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("location")}
                              >
                                <div className="flex items-center gap-2">
                                  Location <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("dailyCollection")}
                              >
                                <div className="flex items-center gap-2">
                                  Daily Collection <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("vendsToday")}
                              >
                                <div className="flex items-center gap-2">
                                  Vends Today <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("floatBalance")}
                              >
                                <div className="flex items-center gap-2">
                                  Float Balance <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("performance")}
                              >
                                <div className="flex items-center gap-2">
                                  Performance <RxCaretSort />
                                </div>
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
                                      <span
                                        className={agent.status === "low float" ? "text-red-600" : "text-green-600"}
                                      >
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
                                      onClick={() => router.push(`/agent-management/agent-detail/${agent.id}`)}
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

                      <motion.div
                        className="flex items-center justify-between pt-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <div className="text-sm text-gray-700">
                          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)}{" "}
                          of {totalRecords} entries
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center rounded-md p-2 ${
                              currentPage === 1
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#003F9F] hover:bg-gray-100"
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onRequestClose={() => setIsAddAgentModalOpen(false)}
        onSuccess={handleAddAgentSuccess}
      />
    </section>
  )
}

export default AllAgents
