"use client"
import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { BillsIcon, MapIcon, PhoneIcon, PlusIcon, UserIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddAgentModal from "components/ui/Modal/add-agent-modal"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface Enumeration {
  id: number
  fieldAgent: string
  location: string
  date: string
  metersEnumerated: number
  customersRegistered: number
  status: "completed" | "in-progress" | "pending" | "cancelled"
  progress: number
  qualityScore: number
  supervisor: string
  notes: string
}

interface ActionDropdownProps {
  enumeration: Enumeration
  onViewDetails: (enumeration: Enumeration) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ enumeration, onViewDetails }) => {
  const [isAddEnumerationModalOpen, setIsAddEnumerationModalOpen] = useState(false)
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
    onViewDetails(enumeration)
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
                  console.log("Update enumeration:", enumeration.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Progress
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Generate report:", enumeration.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Generate Report
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
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
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

const generateEnumerationData = () => {
  return {
    totalEnumerations: 32,
    metersEnumerated: 2450,
    customersRegistered: 2300,
    completionRate: 78.5,
  }
}

const AllEnumerations: React.FC = () => {
  const [isAddEnumerationModalOpen, setIsAddEnumerationModalOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEnumeration, setSelectedEnumeration] = useState<Enumeration | null>(null)
  const [enumerationData, setEnumerationData] = useState(generateEnumerationData())
  const pageSize = 10

  const enumerations: Enumeration[] = [
    {
      id: 1,
      fieldAgent: "Tunde Bakare",
      location: "Lagos Island",
      date: "2024-01-15",
      metersEnumerated: 245,
      customersRegistered: 230,
      status: "completed",
      progress: 100,
      qualityScore: 94,
      supervisor: "Mr. Adewale",
      notes: "Completed ahead of schedule with excellent quality",
    },
    {
      id: 2,
      fieldAgent: "Amina Abdullahi",
      location: "Ikeja",
      date: "2024-01-16",
      metersEnumerated: 180,
      customersRegistered: 165,
      status: "in-progress",
      progress: 75,
      qualityScore: 88,
      supervisor: "Ms. Johnson",
      notes: "Good progress, expected completion in 2 days",
    },
    {
      id: 3,
      fieldAgent: "Emeka Okonkwo",
      location: "Surulere",
      date: "2024-01-14",
      metersEnumerated: 320,
      customersRegistered: 305,
      status: "completed",
      progress: 100,
      qualityScore: 96,
      supervisor: "Mr. Adewale",
      notes: "Highest number of meters enumerated this week",
    },
    {
      id: 4,
      fieldAgent: "Chinedu Okafor",
      location: "Victoria Island",
      date: "2024-01-17",
      metersEnumerated: 95,
      customersRegistered: 85,
      status: "in-progress",
      progress: 45,
      qualityScore: 82,
      supervisor: "Ms. Johnson",
      notes: "Slow progress due to access issues",
    },
    {
      id: 5,
      fieldAgent: "Fatima Hassan",
      location: "Lekki",
      date: "2024-01-18",
      metersEnumerated: 0,
      customersRegistered: 0,
      status: "pending",
      progress: 0,
      qualityScore: 0,
      supervisor: "Mr. Adewale",
      notes: "Scheduled to start tomorrow",
    },
    {
      id: 6,
      fieldAgent: "James Okafor",
      location: "Yaba",
      date: "2024-01-13",
      metersEnumerated: 275,
      customersRegistered: 260,
      status: "completed",
      progress: 100,
      qualityScore: 91,
      supervisor: "Ms. Johnson",
      notes: "Completed with minor data quality issues",
    },
    {
      id: 7,
      fieldAgent: "Sarah Blume",
      location: "Ilupeju",
      date: "2024-01-16",
      metersEnumerated: 150,
      customersRegistered: 140,
      status: "cancelled",
      progress: 30,
      qualityScore: 78,
      supervisor: "Mr. Adewale",
      notes: "Cancelled due to security concerns in the area",
    },
  ]

  const isLoading = false
  const isError = false
  const totalRecords = enumerations.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Enumeration["status"]) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "in-progress":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "pending":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "cancelled":
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

  const getProgressStyle = (progress: number) => {
    if (progress === 100) {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    } else if (progress >= 50) {
      return {
        backgroundColor: "#EFF6FF",
        color: "#2563EB",
      }
    } else if (progress > 0) {
      return {
        backgroundColor: "#FEF6E6",
        color: "#D97706",
      }
    } else {
      return {
        backgroundColor: "#F3F4F6",
        color: "#6B7280",
      }
    }
  }

  const getQualityScoreStyle = (score: number) => {
    if (score >= 90) {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    } else if (score >= 80) {
      return {
        backgroundColor: "#EFF6FF",
        color: "#2563EB",
      }
    } else if (score >= 70) {
      return {
        backgroundColor: "#FEF6E6",
        color: "#D97706",
      }
    } else {
      return {
        backgroundColor: "#F7EDED",
        color: "#AF4B4B",
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

  const handleAddEnumerationSuccess = async () => {
    setIsAddEnumerationModalOpen(false)
    // Refresh data after adding enumeration
    setEnumerationData(generateEnumerationData())
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div>Error loading enumerations</div>

  return (
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full ">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto px-16 py-8 max-sm:px-3">
            <div className="mb-4 flex w-full justify-between max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div>
                <h4 className="text-2xl font-semibold">Field Enumerations</h4>
                <p>Track field enumeration progress and quality metrics</p>
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
                  onClick={() => setIsAddEnumerationModalOpen(true)}
                >
                  New Enumeration
                </ButtonModule>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-6"
            >
              {/* Left Column - Enumeration Table */}
              <div className="flex-1">
                <motion.div
                  className="rounded-lg border bg-white p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h3 className="mb-2 text-lg font-semibold">Enumeration Directory</h3>
                    <SearchModule
                      placeholder="Search agents or locations..."
                      value={searchText}
                      onChange={handleSearch}
                      onCancel={handleCancelSearch}
                    />
                  </div>

                  {enumerations.length === 0 ? (
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
                        {searchText ? "No matching enumerations found" : "No enumerations available"}
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
                        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                          <thead>
                            <tr>
                              <th className="whitespace-nowrap border-y p-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                                  Field Agent
                                </div>
                              </th>
                              <th
                                className="text-500 cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("location")}
                              >
                                <div className="flex items-center gap-2">
                                  Location <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("date")}
                              >
                                <div className="flex items-center gap-2">
                                  Date <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("metersEnumerated")}
                              >
                                <div className="flex items-center gap-2">
                                  Meters <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("customersRegistered")}
                              >
                                <div className="flex items-center gap-2">
                                  Customers <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("status")}
                              >
                                <div className="flex items-center gap-2">
                                  Status <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("progress")}
                              >
                                <div className="flex items-center gap-2">
                                  Progress <RxCaretSort />
                                </div>
                              </th>
                              <th
                                className="cursor-pointer whitespace-nowrap border-y p-4 text-sm"
                                onClick={() => toggleSort("qualityScore")}
                              >
                                <div className="flex items-center gap-2">
                                  Quality Score <RxCaretSort />
                                </div>
                              </th>
                              <th className="whitespace-nowrap border-y p-4 text-sm">
                                <div className="flex items-center gap-2">Actions</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <AnimatePresence>
                              {enumerations.map((enumeration, index) => (
                                <motion.tr
                                  key={enumeration.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  exit={{ opacity: 0, y: -10 }}
                                >
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                      <UserIcon />
                                      <div>
                                        <div>{enumeration.fieldAgent}</div>
                                        <div className="text-xs text-gray-500">
                                          Supervisor: {enumeration.supervisor}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <MapIcon />
                                      {enumeration.location}
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    {new Date(enumeration.date).toLocaleDateString()}
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                                    {enumeration.metersEnumerated.toLocaleString()}
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    {enumeration.customersRegistered.toLocaleString()}
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    <motion.div
                                      style={getStatusStyle(enumeration.status)}
                                      className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.1 }}
                                    >
                                      <span
                                        className="size-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            enumeration.status === "completed"
                                              ? "#589E67"
                                              : enumeration.status === "in-progress"
                                              ? "#2563EB"
                                              : enumeration.status === "pending"
                                              ? "#D97706"
                                              : "#AF4B4B",
                                        }}
                                      ></span>
                                      {enumeration.status.charAt(0).toUpperCase() +
                                        enumeration.status.slice(1).replace("-", " ")}
                                    </motion.div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    <motion.div
                                      style={getProgressStyle(enumeration.progress)}
                                      className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.1 }}
                                    >
                                      {enumeration.progress}%
                                    </motion.div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                    <motion.div
                                      style={getQualityScoreStyle(enumeration.qualityScore)}
                                      className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.1 }}
                                    >
                                      {enumeration.qualityScore > 0 ? `${enumeration.qualityScore}/100` : "N/A"}
                                    </motion.div>
                                  </td>
                                  <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                                    <ActionDropdown enumeration={enumeration} onViewDetails={setSelectedEnumeration} />
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
        isOpen={isAddEnumerationModalOpen}
        onRequestClose={() => setIsAddEnumerationModalOpen(false)}
        onSuccess={handleAddEnumerationSuccess}
      />
    </section>
  )
}

export default AllEnumerations
