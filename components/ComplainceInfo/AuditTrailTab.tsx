"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"

interface AuditEntry {
  auditId: string
  user: string
  action: string
  module: string
  timestamp: string // ISO or already formatted
  ipAddress: string
  status: "approved" | "flagged" | "pending"
}

interface ActionDropdownProps {
  entry: AuditEntry
  onViewDetails: (entry: AuditEntry) => void
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
                  console.log("Flag entry:", entry.auditId)
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

const mockAudit: AuditEntry[] = [
  {
    auditId: "AUD-2024-1245",
    user: "Musa Adamu",
    action: "Modified Customer Tariff",
    module: "Billing Engine",
    timestamp: "2024-10-05 14:32",
    ipAddress: "192.168.1.45",
    status: "approved",
  },
  {
    auditId: "AUD-2024-1246",
    user: "Fatima Ibrahim",
    action: "Generated KCT Token",
    module: "Prepaid Vending",
    timestamp: "2024-10-05 14:45",
    ipAddress: "192.168.1.67",
    status: "approved",
  },
  {
    auditId: "AUD-2024-1247",
    user: "Usman Hassan",
    action: "Updated RLS Policy",
    module: "System Settings",
    timestamp: "2024-10-05 15:10",
    ipAddress: "192.168.1.23",
    status: "flagged",
  },
  {
    auditId: "AUD-2024-1248",
    user: "Aisha Bello",
    action: "Processed Bulk Payment",
    module: "Collections",
    timestamp: "2024-10-05 15:25",
    ipAddress: "192.168.1.89",
    status: "approved",
  },
]

const AuditTrailTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)
  const pageSize = 10

  // In a real app you would fetch data from an API
  const isLoading = false
  const isError = false
  const entries = mockAudit.filter((e) =>
    searchText ? Object.values(e).some((v) => String(v).toLowerCase().includes(searchText.toLowerCase())) : true
  )
  const totalRecords = entries.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
    // For mock data we won't re-order; in real implementation you should sort the entries here.
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1
    if (pageNumber > totalPages) pageNumber = totalPages
    setCurrentPage(pageNumber)
  }

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div>Error loading audit trail</div>

  const startIndex = (currentPage - 1) * pageSize
  const pageItems = entries.slice(startIndex, startIndex + pageSize)

  const getStatusStyle = (status: AuditEntry["status"]) => {
    switch (status) {
      case "approved":
        return { backgroundColor: "#EEFDF4", color: "#15803D" }
      case "flagged":
        return { backgroundColor: "#FEF2F2", color: "#B91C1C" }
      case "pending":
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <motion.div
        className="items-center justify-between  py-2 md:flex "
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Audit Trails</p>
          <p className="text-sm text-gray-600">Complete record of all system activities and user actions</p>
        </div>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search audit trails..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
        </div>
      </motion.div>

      <motion.div
        className="mt-4 w-full overflow-x-auto border-x bg-[#FFFFFF]"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="whitespace-nowrap border-b p-4 text-sm">
                <div className="flex items-center gap-2">
                  <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                  Audit ID
                </div>
              </th>
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("user")}>
                <div className="flex items-center gap-2">
                  User <RxCaretSort />
                </div>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                onClick={() => toggleSort("action")}
              >
                <div className="flex items-center gap-2">
                  Action <RxCaretSort />
                </div>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                onClick={() => toggleSort("module")}
              >
                <div className="flex items-center gap-2">
                  Module <RxCaretSort />
                </div>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                onClick={() => toggleSort("timestamp")}
              >
                <div className="flex items-center gap-2">
                  Timestamp <RxCaretSort />
                </div>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                onClick={() => toggleSort("ipAddress")}
              >
                <div className="flex items-center gap-2">
                  IP Address <RxCaretSort />
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
              <th className="whitespace-nowrap border-b p-4 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {pageItems.map((entry, idx) => (
                <motion.tr
                  key={entry.auditId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">{entry.auditId}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{entry.user}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{entry.action}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-sm font-medium">
                      {entry.module}
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{entry.timestamp}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{entry.ipAddress}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                    <motion.div
                      style={getStatusStyle(entry.status)}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{
                          backgroundColor:
                            entry.status === "approved"
                              ? "#15803D"
                              : entry.status === "flagged"
                              ? "#B91C1C"
                              : "#6B7280",
                        }}
                      />
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </motion.div>
                  </td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                    <ActionDropdown entry={entry} onViewDetails={(e) => setSelectedEntry(e)} />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
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
                  currentPage === pageNum ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

      {/* Optional: Modal / details view */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            className="z-60 fixed inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedEntry(null)} />
            <motion.div
              className="relative z-10 w-[720px] rounded-lg bg-white p-6"
              initial={{ scale: 0.98, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 8 }}
            >
              <h3 className="text-lg font-semibold">Audit Detail - {selectedEntry.auditId}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>User:</strong> {selectedEntry.user}
                </div>
                <div>
                  <strong>IP Address:</strong> {selectedEntry.ipAddress}
                </div>
                <div>
                  <strong>Action:</strong> {selectedEntry.action}
                </div>
                <div>
                  <strong>Module:</strong> {selectedEntry.module}
                </div>
                <div>
                  <strong>Timestamp:</strong> {selectedEntry.timestamp}
                </div>
                <div>
                  <strong>Status:</strong> {selectedEntry.status}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AuditTrailTab
