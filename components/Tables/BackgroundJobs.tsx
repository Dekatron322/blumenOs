"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
  MdOutlineCheckBoxOutlineBlank,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  fetchBackgroundJobs,
  pauseJob,
  resumeJob,
  triggerJob,
  setSearchTerm,
  setSortOptions,
  getFilteredJobs,
} from "lib/redux/backgroundJobsSlice"
import type { BackgroundJob } from "lib/redux/backgroundJobsSlice"

interface ActionDropdownProps {
  job: BackgroundJob
  onPause: (job: BackgroundJob) => void
  onResume: (job: BackgroundJob) => void
  onTrigger: (job: BackgroundJob) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ job, onPause, onResume, onTrigger }) => {
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

  const handlePause = (e: React.MouseEvent) => {
    e.preventDefault()
    onPause(job)
    setIsOpen(false)
  }

  const handleResume = (e: React.MouseEvent) => {
    e.preventDefault()
    onResume(job)
    setIsOpen(false)
  }

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault()
    onTrigger(job)
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
                onClick={handlePause}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Pause Job
              </motion.button>

              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleResume}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Resume Job
              </motion.button>

              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleTrigger}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Trigger Job
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
              {[...Array(8)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
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

const BackgroundJobs: React.FC = () => {
  const dispatch = useAppDispatch()

  const {
    backgroundJobsData,
    filteredJobs,
    backgroundJobsLoading,
    backgroundJobsError,
    searchTerm,
    sortBy,
    sortOrder,
  } = useAppSelector((state) => state.backgroundJobs)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [expandedJobKey, setExpandedJobKey] = useState<string | null>(null)

  // Fetch background jobs on mount
  useEffect(() => {
    dispatch(fetchBackgroundJobs())
  }, [dispatch])

  const getStatusStyle = (isRunning: boolean) => {
    // Map job running state to badge styles
    if (isRunning) {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    }

    return {
      backgroundColor: "#F3F4F6",
      color: "#6B7280",
    }
  }

  const toggleSort = (column: "name" | "group" | "status") => {
    const isAscending = sortBy === column && sortOrder === "asc"
    const newOrder = isAscending ? "desc" : "asc"
    dispatch(setSortOptions({ sortBy: column, sortOrder: newOrder }))
    dispatch(getFilteredJobs())
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    dispatch(setSearchTerm(value))
    dispatch(getFilteredJobs())
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    dispatch(setSearchTerm(""))
    dispatch(getFilteredJobs())
    setCurrentPage(1)
  }

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handlePauseJob = (job: BackgroundJob) => {
    dispatch(pauseJob({ jobName: job.jobName, jobGroup: job.jobGroup }))
  }

  const handleResumeJob = (job: BackgroundJob) => {
    dispatch(resumeJob({ jobName: job.jobName, jobGroup: job.jobGroup }))
  }

  const handleTriggerJob = (job: BackgroundJob) => {
    dispatch(triggerJob({ jobName: job.jobName, jobGroup: job.jobGroup }))
  }

  const formatIdentifier = (value: string | null | undefined) => {
    if (!value) return "-"
    // Insert spaces before capital letters and between acronym + word boundaries
    const withSpaces = value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    return withSpaces.trim()
  }

  const formatDateTime = (value: string | null) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }
  const jobsSource = filteredJobs.length ? filteredJobs : backgroundJobsData?.jobs ?? []
  const totalRecords = jobsSource.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const paginatedJobs = jobsSource.slice(startIndex, startIndex + pageSize)

  if (backgroundJobsLoading) return <LoadingSkeleton />
  if (backgroundJobsError) {
    return <div className="p-4 text-red-500">Error loading background jobs data: {backgroundJobsError}</div>
  }

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Background Jobs</p>
          <p className="text-sm text-gray-600">Monitor and control background scheduler jobs</p>
        </div>
        <div className="flex gap-4">
          <SearchModule
            value={searchTerm}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search jobs..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
        </div>
      </motion.div>

      {paginatedJobs.length === 0 ? (
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
            {searchTerm ? "No matching jobs found" : "No background jobs available"}
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
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />#
                    </div>
                  </th>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Job Name <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("group")}
                  >
                    <div className="flex items-center gap-2">
                      Job Group <RxCaretSort />
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
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Description <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Triggers</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedJobs.map((job, index) => {
                    const jobKey = `${job.jobGroup}-${job.jobName}`
                    const isExpanded = expandedJobKey === jobKey

                    return (
                      <React.Fragment key={jobKey}>
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                            {startIndex + index + 1}
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            {formatIdentifier(job.jobName)}
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{job.jobGroup}</td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <motion.div
                              style={getStatusStyle(job.isRunning)}
                              className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.1 }}
                            >
                              <span
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor: job.isRunning ? "#589E67" : "#6B7280",
                                }}
                              ></span>
                              {job.isRunning ? "Running" : "Idle"}
                            </motion.div>
                          </td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{job.description || "-"}</td>
                          <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                            <button
                              type="button"
                              className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-[#003F9F] hover:bg-gray-50"
                              onClick={() => setExpandedJobKey((prev) => (prev === jobKey ? null : jobKey))}
                            >
                              {job.triggers?.length ?? 0} Triggers
                              {isExpanded ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                            </button>
                          </td>
                        </motion.tr>

                        {isExpanded && job.triggers && job.triggers.length > 0 && (
                          <tr>
                            <td colSpan={7} className="border-b bg-[#F9FAFB] px-6 py-4 text-xs text-gray-700">
                              <div className="mb-2 font-semibold">Triggers</div>
                              <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-0 text-left">
                                  <thead>
                                    <tr>
                                      <th className="border-b p-2">Name</th>
                                      <th className="border-b p-2">Group</th>
                                      <th className="border-b p-2">Type</th>
                                      <th className="border-b p-2">State</th>
                                      <th className="border-b p-2">Prev Fire (UTC)</th>
                                      <th className="border-b p-2">Next Fire (UTC)</th>
                                      <th className="border-b p-2">Cron</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {job.triggers.map((trigger) => (
                                      <tr key={`${trigger.triggerGroup}-${trigger.triggerName}`}>
                                        <td className="border-b p-2">{formatIdentifier(trigger.triggerName)}</td>
                                        <td className="border-b p-2">{trigger.triggerGroup}</td>
                                        <td className="border-b p-2">{formatIdentifier(trigger.triggerType)}</td>
                                        <td className="border-b p-2">{trigger.state}</td>
                                        <td className="border-b p-2">{formatDateTime(trigger.previousFireTimeUtc)}</td>
                                        <td className="border-b p-2">{formatDateTime(trigger.nextFireTimeUtc)}</td>
                                        <td className="border-b p-2">{trigger.cronExpression ?? "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
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

export default BackgroundJobs
