"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { AiOutlineCheckCircle, AiOutlineExclamationCircle } from "react-icons/ai"
import { SearchModule } from "components/ui/Search/search-module"

interface ComplianceEntry {
  id: string
  name: string
  status: "passed" | "warning" | "failed" | "unknown"
  score: number // 0-100
  threshold: number // 0-100
  issues: number // 0 means none
  lastCheck: string // formatted date
  reportUrl?: string
}

interface ActionDropdownProps {
  entry: ComplianceEntry
  onViewReport: (entry: ComplianceEntry) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ entry, onViewReport }) => {
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

  const handleViewReport = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewReport(entry)
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
                onClick={handleViewReport}
              >
                View Report
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Export report for:", entry.id)
                  setIsOpen(false)
                }}
              >
                Export (PDF)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LoadingSkeleton: React.FC = () => (
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
            {[...Array(7)].map((_, i) => (
              <th key={i} className="whitespace-nowrap border-b p-4">
                <div className="h-4 w-32 rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(7)].map((_, cellIndex) => (
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

const mockCompliance: ComplianceEntry[] = [
  {
    id: "CHK-001",
    name: "NERC Billing Compliance",
    status: "passed",
    score: 94,
    threshold: 90,
    issues: 0,
    lastCheck: "2024-10-01",
    reportUrl: "#",
  },
  {
    id: "CHK-002",
    name: "Data Privacy Compliance",
    status: "passed",
    score: 98,
    threshold: 95,
    issues: 0,
    lastCheck: "2024-09-28",
    reportUrl: "#",
  },
  {
    id: "CHK-003",
    name: "Financial Reporting Standards",
    status: "warning",
    score: 88,
    threshold: 90,
    issues: 2,
    lastCheck: "2024-10-03",
    reportUrl: "#",
  },
  {
    id: "CHK-004",
    name: "Security Policy Adherence",
    status: "passed",
    score: 96,
    threshold: 90,
    issues: 0,
    lastCheck: "2024-10-04",
    reportUrl: "#",
  },
  {
    id: "CHK-005",
    name: "Meter Programming Standards",
    status: "passed",
    score: 92,
    threshold: 90,
    issues: 0,
    lastCheck: "2024-10-02",
    reportUrl: "#",
  },
]

const getStatusStyle = (status: ComplianceEntry["status"]) => {
  switch (status) {
    case "passed":
      return { backgroundColor: "#EEFDF4", color: "#15803D" }
    case "warning":
      return { backgroundColor: "#FFF7ED", color: "#D97706" }
    case "failed":
      return { backgroundColor: "#FEF2F2", color: "#B91C1C" }
    default:
      return { backgroundColor: "#F3F4F6", color: "#6B7280" }
  }
}

const ComplianceChecksTab: React.FC = () => {
  const [searchText, setSearchText] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<ComplianceEntry | null>(null)
  const [isLoading] = useState(false)
  const [isError] = useState(false)

  const pageSize = 10

  const entries = mockCompliance.filter((e) =>
    searchText ? Object.values(e).some((v) => String(v).toLowerCase().includes(searchText.toLowerCase())) : true
  )

  const totalRecords = entries.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const toggleSort = (col: string) => {
    const isAsc = sortColumn === col && sortOrder === "asc"
    setSortOrder(isAsc ? "desc" : "asc")
    setSortColumn(col)
    // NOTE: for real data, sort entries here or request sorted data from API
  }

  const paginate = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div className="p-4 text-red-600">Error loading compliance checks</div>

  const pageItems = entries.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const openReport = (entry: ComplianceEntry) => {
    if (entry.reportUrl) window.open(entry.reportUrl, "_blank")
    else {
      setSelectedEntry(entry)
    }
  }

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <motion.div
        className="items-center justify-between py-2 md:flex"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Compliance Checks</p>
          <p className="text-sm text-gray-600">Automated compliance monitoring and validation</p>
        </div>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search compliance checks..."
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
                  Compliance Check
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
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("score")}>
                <div className="flex items-center gap-2">
                  Score <RxCaretSort />
                </div>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                onClick={() => toggleSort("threshold")}
              >
                <div className="flex items-center gap-2">
                  Threshold <RxCaretSort />
                </div>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                onClick={() => toggleSort("issues")}
              >
                <div className="flex items-center gap-2">
                  Issues Found <RxCaretSort />
                </div>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                onClick={() => toggleSort("lastCheck")}
              >
                <div className="flex items-center gap-2">
                  Last Check <RxCaretSort />
                </div>
              </th>
              <th className="whitespace-nowrap border-b p-4 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {pageItems.map((entry, idx) => {
                const statusStyle = getStatusStyle(entry.status)
                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">{entry.name}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <motion.div
                        style={statusStyle}
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
                      >
                        {entry.status === "passed" ? (
                          <AiOutlineCheckCircle className="text-base" />
                        ) : (
                          <AiOutlineExclamationCircle className="text-base" />
                        )}
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </motion.div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-[#16A34A]">
                      {entry.score}%
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-700">{entry.threshold}%</td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      {entry.issues === 0 ? (
                        <span className="text-gray-500">None</span>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-full bg-[#FEF2F2] px-3 py-1 text-sm font-medium text-[#B91C1C]">
                          {entry.issues}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-700">{entry.lastCheck}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ActionDropdown entry={entry} onViewReport={openReport} />
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
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
              <h3 className="text-lg font-semibold">Compliance Report — {selectedEntry.name}</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Score:</strong> {selectedEntry.score}%
                </div>
                <div>
                  <strong>Threshold:</strong> {selectedEntry.threshold}%
                </div>
                <div>
                  <strong>Issues Found:</strong> {selectedEntry.issues || "None"}
                </div>
                <div>
                  <strong>Last Check:</strong> {selectedEntry.lastCheck}
                </div>
                <div className="col-span-2">
                  <strong>Details:</strong> Brief summary of the compliance check would appear here — you can wire this
                  to the real report response.
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </button>
                <button
                  className="rounded-md bg-[#0B5394] px-4 py-2 text-sm text-white hover:opacity-95"
                  onClick={() => {
                    if (selectedEntry.reportUrl) window.open(selectedEntry.reportUrl, "_blank")
                  }}
                >
                  Open Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ComplianceChecksTab
