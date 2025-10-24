"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { FiDownload } from "react-icons/fi"
import { SearchModule } from "components/ui/Search/search-module"

interface RegulatoryReport {
  id: string
  name: string
  period: string
  dueDate: string // YYYY-MM-DD
  submittedOn?: string | null // YYYY-MM-DD or null
  status: "submitted" | "pending" | "overdue"
  reportUrl?: string | null
}

const mockReports: RegulatoryReport[] = [
  {
    id: "RPT-001",
    name: "Monthly Operations Report",
    period: "September 2024",
    dueDate: "2024-10-05",
    submittedOn: "2024-10-05",
    status: "submitted",
    reportUrl: "#",
  },
  {
    id: "RPT-002",
    name: "Quarterly Financial Summary",
    period: "Q3 2024",
    dueDate: "2024-10-15",
    submittedOn: "2024-10-04",
    status: "submitted",
    reportUrl: "#",
  },
  {
    id: "RPT-003",
    name: "Customer Complaint Statistics",
    period: "September 2024",
    dueDate: "2024-10-05",
    submittedOn: "2024-10-03",
    status: "submitted",
    reportUrl: "#",
  },
  {
    id: "RPT-004",
    name: "Technical Performance Report",
    period: "September 2024",
    dueDate: "2024-10-10",
    submittedOn: null,
    status: "pending",
    reportUrl: null,
  },
]

const LoadingSkeleton: React.FC = () => (
  <motion.div
    className="flex-1 mt-5 flex flex-col rounded-md border bg-white p-5"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.25 }}
  >
    <div className="items-center justify-between border-b py-2 md:flex md:py-4">
      <div className="h-8 w-56 rounded bg-gray-200" />
      <div className="mt-3 flex gap-4 md:mt-0">
        <div className="h-10 w-48 rounded bg-gray-200" />
        <div className="h-10 w-24 rounded bg-gray-200" />
      </div>
    </div>

    <div className="w-full overflow-x-auto border-x bg-[#f9f9f9] mt-4">
      <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i} className="whitespace-nowrap border-b p-4">
                <div className="h-4 w-32 rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, r) => (
            <tr key={r}>
              {[...Array(6)].map((__, c) => (
                <td key={c} className="whitespace-nowrap border-b px-4 py-6">
                  <div className="h-4 w-full rounded bg-gray-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
)

const getStatusStyles = (status: RegulatoryReport["status"]) => {
  switch (status) {
    case "submitted":
      return { bg: "bg-[#ECFDF3]", text: "text-[#15803D]" }
    case "pending":
      return { bg: "bg-[#FFF7ED]", text: "text-[#D97706]" }
    case "overdue":
      return { bg: "bg-[#FEF2F2]", text: "text-[#B91C1C]" }
    default:
      return { bg: "bg-gray-100", text: "text-gray-700" }
  }
}

const NercReportsTab: React.FC = () => {
  const [reports, setReports] = useState<RegulatoryReport[]>(mockReports)
  const [searchText, setSearchText] = useState("")
  const [isLoading] = useState(false)
  const [isError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [showReportPreview, setShowReportPreview] = useState<RegulatoryReport | null>(null)

  // filtering
  const filtered = reports.filter((r) =>
    searchText
      ? [r.name, r.period, r.dueDate, r.submittedOn || "not submitted", r.status]
          .join(" ")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      : true
  )

  const totalRecords = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))

  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleSort = (col: string) => {
    const isAsc = sortColumn === col && sortOrder === "asc"
    setSortOrder(isAsc ? "desc" : "asc")
    setSortColumn(col)
    // NOTE: implement sorting logic / API call as needed
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }
  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const paginate = (p: number) => {
    if (p < 1) p = 1
    if (p > totalPages) p = totalPages
    setCurrentPage(p)
  }

  // Simulated generation: marks report as submitted after a short delay
  const generateReport = (id: string) => {
    setGeneratingId(id)
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "submitted",
                submittedOn: new Date().toISOString().slice(0, 10),
                reportUrl: "#",
              }
            : r
        )
      )
      setGeneratingId(null)
    }, 1200)
  }

  const downloadReport = (r: RegulatoryReport) => {
    if (r.reportUrl) {
      window.open(r.reportUrl, "_blank")
    } else {
      // fallback: open preview modal
      setShowReportPreview(r)
    }
  }

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div className="p-4 text-red-600">Error loading reports</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }}>
     <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">NERC Reports</p>
          <p className="text-sm text-gray-600">Mandatory reports for Nigerian Electricity Regulatory Commission</p>
        </div>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search NERC Reports..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
        </div>
      </motion.div>

      <motion.div className="w-full overflow-x-auto border-x bg-white mt-4" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="whitespace-nowrap border-b p-4 text-sm">
                <div className="flex items-center gap-2"><MdOutlineCheckBoxOutlineBlank className="text-lg" /> Report Name</div>
              </th>
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("period")}>
                <div className="flex items-center gap-2">Period <RxCaretSort /></div>
              </th>
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("dueDate")}>
                <div className="flex items-center gap-2">Due Date <RxCaretSort /></div>
              </th>
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("submittedOn")}>
                <div className="flex items-center gap-2">Submitted On <RxCaretSort /></div>
              </th>
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("status")}>
                <div className="flex items-center gap-2">Status <RxCaretSort /></div>
              </th>
              <th className="whitespace-nowrap border-b p-4 text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {pageItems.map((r, idx) => {
                const s = getStatusStyles(r.status)
                return (
                  <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: idx * 0.02 }} exit={{ opacity: 0, y: -8 }}>
                    <td className="whitespace-nowrap border-b px-4 py-6 text-sm font-medium">{r.name}</td>
                    <td className="whitespace-nowrap border-b px-4 py-6 text-sm">{r.period}</td>
                    <td className="whitespace-nowrap border-b px-4 py-6 text-sm">{r.dueDate}</td>
                    <td className="whitespace-nowrap border-b px-4 py-6 text-sm">{r.submittedOn ?? <span className="text-gray-400">Not submitted</span>}</td>
                    <td className="whitespace-nowrap border-b px-4 py-6 text-sm">
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${s.bg}`}>
                        <span className={s.text}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-6 text-sm">
                      {r.status === "submitted" ? (
                        <button
                          className="inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium hover:bg-gray-100"
                          onClick={() => downloadReport(r)}
                          title="Download report"
                        >
                          <FiDownload className="text-lg" />
                        </button>
                      ) : (
                        <button
                          className={`rounded-md px-3 py-1 text-sm font-medium ${generatingId === r.id ? "bg-gray-100 text-gray-600" : "text-[#0B5394]"} hover:underline`}
                          onClick={() => generateReport(r.id)}
                          disabled={!!generatingId}
                        >
                          {generatingId === r.id ? "Generating..." : "Generate"}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      <motion.div className="flex items-center justify-between border-t py-3 mt-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
        <div className="text-sm text-gray-700">
          Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
        </div>

        <div className="flex items-center gap-2">
          <motion.button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center justify-center rounded-md p-2 ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"}`} whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }} whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}>
            <MdOutlineArrowBackIosNew />
          </motion.button>

          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            let pageNum = i + 1
            return (
              <motion.button key={i} onClick={() => paginate(pageNum)} className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${currentPage === pageNum ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {pageNum}
              </motion.button>
            )
          })}

          <motion.button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`flex items-center justify-center rounded-md p-2 ${currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"}`} whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }} whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}>
            <MdOutlineArrowForwardIos />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showReportPreview && (
          <motion.div className="fixed inset-0 z-60 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowReportPreview(null)} />
            <motion.div className="relative z-10 w-[720px] rounded-lg bg-white p-6" initial={{ scale: 0.98, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 8 }}>
              <h3 className="text-lg font-semibold">{showReportPreview.name}</h3>
              <div className="mt-4 text-sm text-gray-700 grid grid-cols-2 gap-3">
                <div><strong>Period:</strong> {showReportPreview.period}</div>
                <div><strong>Due Date:</strong> {showReportPreview.dueDate}</div>
                <div><strong>Submitted On:</strong> {showReportPreview.submittedOn ?? "Not submitted"}</div>
                <div><strong>Status:</strong> {showReportPreview.status}</div>
                <div className="col-span-2"><strong>Preview / Notes:</strong> This is where a brief summary or preview could appear; wire to real report response as needed.</div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200" onClick={() => setShowReportPreview(null)}>Close</button>
                {showReportPreview.reportUrl && <button className="rounded-md bg-[#0B5394] px-4 py-2 text-sm text-white" onClick={() => window.open(showReportPreview.reportUrl || "", "_blank")}>Open Report</button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default NercReportsTab
