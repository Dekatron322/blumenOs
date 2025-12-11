"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineCheckBoxOutlineBlank, MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { CycleIcon, PlusIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearBillingJobs,
  fetchBillingJobs,
  BillingJob as ReduxBillingJob,
  setBillingJobsPagination,
} from "lib/redux/postpaidSlice"
import CreateBillingJobModal from "components/ui/Modal/create-billing-job-modal"

interface BillingJob {
  id: number
  period: string
  areaOfficeId: number
  areaOfficeName: string
  status: number
  draftedCount: number
  finalizedCount: number
  skippedCount: number
  totalCustomers: number
  processedCustomers: number
  lastError: string
  requestedAtUtc: string
  startedAtUtc: string
  completedAtUtc: string
  requestedByUserId: number
  requestedByName: string
}

interface ActionDropdownProps {
  job: BillingJob
  onViewDetails: (job: BillingJob) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ job, onViewDetails }) => {
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
    const dropdownHeight = 160

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
    onViewDetails(job)
    setIsOpen(false)
  }

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return "Pending"
      case 1:
        return "Running"
      case 2:
        return "Completed"
      case 3:
        return "Failed"
      case 4:
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const isJobRunning = job.status === 1
  const isJobPending = job.status === 0
  const hasOutput = job.status === 2 // Completed jobs might have output

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
                  console.log("View logs:", job.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Logs
              </motion.button>
              {isJobRunning && (
                <motion.button
                  className="block w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-100"
                  onClick={() => {
                    console.log("Cancel job:", job.id)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: "#fff7ed" }}
                  transition={{ duration: 0.1 }}
                >
                  Cancel Job
                </motion.button>
              )}
              {isJobPending && (
                <motion.button
                  className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
                  onClick={() => {
                    console.log("Start job:", job.id)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: "#eff6ff" }}
                  transition={{ duration: 0.1 }}
                >
                  Start Now
                </motion.button>
              )}
              {hasOutput && (
                <motion.button
                  className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100"
                  onClick={() => {
                    console.log("Download output:", job.id)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: "#f0fdf4" }}
                  transition={{ duration: 0.1 }}
                >
                  Download Output
                </motion.button>
              )}
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  console.log("Delete job:", job.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#fef2f2" }}
                transition={{ duration: 0.1 }}
              >
                Delete Job
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
        <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(10)].map((_, i) => (
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
                {[...Array(10)].map((_, cellIndex) => (
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
                            delay: (rowIndex * 10 + cellIndex) * 0.05,
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

const BillingJobs: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { billingJobs, billingJobsLoading, billingJobsError, billingJobsSuccess, billingJobsPagination } =
    useAppSelector((state) => state.postpaidBilling)

  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [selectedJob, setSelectedJob] = useState<BillingJob | null>(null)

  const currentPage = billingJobsPagination.currentPage
  const pageSize = billingJobsPagination.pageSize
  const totalRecords = billingJobsPagination.totalCount
  const totalPages = billingJobsPagination.totalPages || 1

  // Fetch billing jobs on component mount and when filters/pagination change
  useEffect(() => {
    const params = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(searchText && { period: searchText }),
      // Add other filters as needed
    }

    dispatch(fetchBillingJobs(params))
  }, [dispatch, currentPage, pageSize, searchText])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearBillingJobs())
    }
  }, [dispatch])

  const getStatusStyle = (status: number) => {
    switch (status) {
      case 0: // Pending
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case 1: // Running
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case 2: // Completed
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case 3: // Failed
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case 4: // Cancelled
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return "Pending"
      case 1:
        return "Running"
      case 2:
        return "Completed"
      case 3:
        return "Failed"
      case 4:
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const calculateProgress = (job: BillingJob) => {
    if (job.totalCustomers === 0) return 0
    return Math.round((job.processedCustomers / job.totalCustomers) * 100)
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
    // TODO: Implement actual sorting logic
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    dispatch(setBillingJobsPagination({ page: 1, pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(setBillingJobsPagination({ page: 1, pageSize }))
  }

  const handleAddJobSuccess = async () => {
    setIsAddJobModalOpen(false)
    // Refresh the jobs list
    dispatch(
      fetchBillingJobs({
        pageNumber: currentPage,
        pageSize: pageSize,
      })
    )
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      setBillingJobsPagination({
        page: 1,
        pageSize: newPageSize,
      })
    )
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      dispatch(
        setBillingJobsPagination({
          page,
          pageSize: billingJobsPagination.pageSize,
        })
      )
    }
  }

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = billingJobsPagination.currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    items.push(1)

    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      items.push("...", current - 1, current, current + 1, "...")
    }

    if (!items.includes(total)) {
      items.push(total)
    }

    return items
  }

  const getMobilePageItems = (): (number | string)[] => {
    const total = totalPages
    const current = billingJobsPagination.currentPage
    const items: (number | string)[] = []

    if (total <= 4) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  if (billingJobsLoading) return <LoadingSkeleton />
  if (billingJobsError) return <div className="p-4 text-red-500">Error loading jobs: {billingJobsError}</div>

  return (
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-8 2xl:container max-sm:px-3 2xl:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Billing Jobs</h4>
                <p className="text-gray-600">Monitor and manage automated billing system jobs and processes</p>
              </div>

              <motion.div
                className="flex items-center justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  icon={<PlusIcon />}
                  onClick={() => setIsAddJobModalOpen(true)}
                >
                  Generate Jobs
                </ButtonModule>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Jobs Table Container */}
              <div className="w-full">
                <motion.div
                  className="w-full rounded-lg border bg-white p-4 lg:p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold">Job Queue</h3>
                    <div className="max-w-md">
                      <SearchModule
                        placeholder="Search by period (e.g., 2024-01)..."
                        value={searchText}
                        onChange={handleSearch}
                        onCancel={handleCancelSearch}
                      />
                    </div>
                  </div>

                  {billingJobs.length === 0 ? (
                    <motion.div
                      className="flex h-60 flex-col items-center justify-center gap-2 rounded-lg bg-[#F6F6F9]"
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
                        {searchText ? "No matching jobs found" : "No jobs available"}
                      </motion.p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Table Container with Max Width and Scroll */}
                      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                        <div className="max-w-full overflow-x-auto">
                          <table className="w-full min-w-[1400px] border-separate border-spacing-0 text-left">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <MdOutlineCheckBoxOutlineBlank className="text-lg text-gray-400" />
                                    Period
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("areaOfficeName")}
                                >
                                  <div className="flex items-center gap-2">
                                    Area Office <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("status")}
                                >
                                  <div className="flex items-center gap-2">
                                    Status <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("draftedCount")}
                                >
                                  <div className="flex items-center gap-2">
                                    Drafted <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("finalizedCount")}
                                >
                                  <div className="flex items-center gap-2">
                                    Finalized <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("progress")}
                                >
                                  <div className="flex items-center gap-2">
                                    Progress <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("requestedByName")}
                                >
                                  <div className="flex items-center gap-2">
                                    Requested By <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("requestedAtUtc")}
                                >
                                  <div className="flex items-center gap-2">
                                    Requested At <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("completedAtUtc")}
                                >
                                  <div className="flex items-center gap-2">
                                    Completed At <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <AnimatePresence>
                                {billingJobs.map((job, index) => (
                                  <motion.tr
                                    key={job.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                                      <div className="flex items-center gap-2">
                                        <CycleIcon />
                                        <div>
                                          <div className="font-medium text-gray-900">{job.period}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {job.areaOfficeName || "General Bill"}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getStatusStyle(job.status)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        <span
                                          className="size-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              job.status === 0
                                                ? "#D97706"
                                                : job.status === 1
                                                ? "#2563EB"
                                                : job.status === 2
                                                ? "#589E67"
                                                : job.status === 3
                                                ? "#AF4B4B"
                                                : "#6B7280",
                                          }}
                                        ></span>
                                        {getStatusText(job.status)}
                                      </motion.div>
                                      {job.lastError && (
                                        <div
                                          className="mt-1 max-w-xs truncate text-xs text-red-500"
                                          title={job.lastError}
                                        >
                                          Error: {job.lastError}
                                        </div>
                                      )}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {job.draftedCount.toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {job.finalizedCount.toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-20 rounded-full bg-gray-200">
                                          <div
                                            className="h-2 rounded-full bg-green-500 transition-all duration-300"
                                            style={{ width: `${calculateProgress(job)}%` }}
                                          />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">
                                          {calculateProgress(job)}%
                                        </span>
                                      </div>
                                      <div className="mt-1 text-xs text-gray-500">
                                        {job.processedCustomers.toLocaleString()} /{" "}
                                        {job.totalCustomers.toLocaleString()} customers
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {job.requestedByName}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {formatDate(job.requestedAtUtc)}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {job.completedAtUtc ? formatDate(job.completedAtUtc) : "In Progress"}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <ButtonModule
                                        size="sm"
                                        onClick={() => router.push(`/billing/jobs/jobs-detail/${job.id}`)}
                                      >
                                        View Details
                                      </ButtonModule>
                                    </td>
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                        <div className="flex items-center gap-1 max-sm:hidden">
                          <p className="text-xs sm:text-sm">Show rows</p>
                          <select
                            value={billingJobsPagination.pageSize}
                            onChange={handleRowsChange}
                            className="bg-[#F2F2F2] p-1 text-xs sm:text-sm"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                          <button
                            className={`px-2 py-1 sm:px-3 sm:py-2 ${
                              billingJobsPagination.currentPage === 1
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#000000]"
                            }`}
                            onClick={() => changePage(billingJobsPagination.currentPage - 1)}
                            disabled={billingJobsPagination.currentPage === 1}
                          >
                            <BiSolidLeftArrow className="size-4 sm:size-5" />
                          </button>

                          <div className="flex items-center gap-1 sm:gap-2">
                            <div className="hidden items-center gap-1 sm:flex sm:gap-2">
                              {getPageItems().map((item, index) =>
                                typeof item === "number" ? (
                                  <button
                                    key={item}
                                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs sm:h-7 sm:w-8 sm:text-sm ${
                                      billingJobsPagination.currentPage === item
                                        ? "bg-[#000000] text-white"
                                        : "bg-gray-200 text-gray-800"
                                    }`}
                                    onClick={() => changePage(item)}
                                  >
                                    {item}
                                  </button>
                                ) : (
                                  <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
                                    {item}
                                  </span>
                                )
                              )}
                            </div>

                            <div className="flex items-center gap-1 sm:hidden">
                              {getMobilePageItems().map((item, index) =>
                                typeof item === "number" ? (
                                  <button
                                    key={item}
                                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs ${
                                      billingJobsPagination.currentPage === item
                                        ? "bg-[#000000] text-white"
                                        : "bg-gray-200 text-gray-800"
                                    }`}
                                    onClick={() => changePage(item)}
                                  >
                                    {item}
                                  </button>
                                ) : (
                                  <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-500">
                                    {item}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <button
                            className={`px-2 py-1 sm:px-3 sm:py-2 ${
                              billingJobsPagination.currentPage === totalPages || totalPages === 0
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#000000]"
                            }`}
                            onClick={() => changePage(billingJobsPagination.currentPage + 1)}
                            disabled={billingJobsPagination.currentPage === totalPages || totalPages === 0}
                          >
                            <BiSolidRightArrow className="size-4 sm:size-5" />
                          </button>
                        </div>

                        <p className="text-center text-xs text-gray-600 sm:text-right sm:text-sm">
                          Page {billingJobsPagination.currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()}{" "}
                          total jobs)
                          {searchText.trim() && " - filtered"}
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <CreateBillingJobModal
        isOpen={isAddJobModalOpen}
        onRequestClose={() => setIsAddJobModalOpen(false)}
        onSuccess={handleAddJobSuccess}
      />
    </section>
  )
}

export default BillingJobs
