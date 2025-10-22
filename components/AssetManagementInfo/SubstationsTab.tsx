"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"

interface Substation {
  id: string
  name: string
  voltage: string
  capacity: string
  feeders: number
  location: string
  status: "operational" | "maintenance" | "faulty"
}

interface Status {
  value: number
  label: string
}

interface ActionDropdownProps {
  substation: Substation
  onViewDetails: (substation: Substation) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ substation, onViewDetails }) => {
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
    onViewDetails(substation)
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
                  console.log("Monitor performance for:", substation.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Monitor Performance
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Update status for:", substation.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Status
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
              {[...Array(8)].map((_, i) => (
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
                {[...Array(8)].map((_, cellIndex) => (
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
                            delay: (rowIndex * 8 + cellIndex) * 0.05,
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

// Mock data based on your sample
const mockSubstations: Substation[] = [
  {
    id: "SS-001",
    name: "Kaduna Main Substation",
    voltage: "132/33 KV",
    capacity: "60 MVA",
    feeders: 6,
    location: "Kaduna Central",
    status: "operational",
  },
  {
    id: "SS-002",
    name: "Barnawa Substation",
    voltage: "33/11 KV",
    capacity: "15 MVA",
    feeders: 3,
    location: "Barnawa",
    status: "operational",
  },
  {
    id: "SS-003",
    name: "Rigasa Substation",
    voltage: "33/11 KV",
    capacity: "20 MVA",
    feeders: 4,
    location: "Rigasa",
    status: "operational",
  },
]

const SubstationsTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSubstation, setSelectedSubstation] = useState<Substation | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const substations = mockSubstations
  const totalRecords = substations.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Substation["status"]) => {
    switch (status) {
      case "operational":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "maintenance":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "faulty":
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

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div>Error loading substation data</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Substation Network</p>
          <p className="text-sm text-gray-600">High-voltage transmission infrastructure</p>
        </div>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search substations..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
        </div>
      </motion.div>

      {substations.length === 0 ? (
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
            {searchText ? "No matching substations found" : "No substations available"}
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
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      ID
                    </div>
                  </th>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("voltage")}
                  >
                    <div className="flex items-center gap-2">
                      Voltage <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("capacity")}
                  >
                    <div className="flex items-center gap-2">
                      Capacity <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("feeders")}
                  >
                    <div className="flex items-center gap-2">
                      Feeders <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("location")}
                  >
                    <div className="flex items-center gap-2">
                      Location <RxCaretSort />
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
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {substations.map((substation, index) => (
                    <motion.tr
                      key={substation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">{substation.id}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{substation.name}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{substation.voltage}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{substation.capacity}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{substation.feeders}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{substation.location}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getStatusStyle(substation.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor:
                                substation.status === "operational"
                                  ? "#589E67"
                                  : substation.status === "maintenance"
                                  ? "#D97706"
                                  : "#AF4B4B",
                            }}
                          ></span>
                          {substation.status.charAt(0).toUpperCase() + substation.status.slice(1)}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ActionDropdown substation={substation} onViewDetails={setSelectedSubstation} />
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

export default SubstationsTab
