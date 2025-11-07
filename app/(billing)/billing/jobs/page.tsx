"use client"
import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { BillsIcon, CycleIcon, DateIcon, MapIcon, PlusIcon, StatusIcon, UserIcon } from "components/Icons/Icons"
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

interface BillingJob {
  id: number
  jobName: string
  jobType:
    | "bill-generation"
    | "meter-reading"
    | "data-export"
    | "report-generation"
    | "system-maintenance"
    | "dispute-processing"
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  scheduledTime: string
  startTime: string
  endTime: string
  initiatedBy: string
  progress: number
  totalRecords: number
  processedRecords: number
  successCount: number
  failureCount: number
  billingCycle: string
  description: string
  errorMessage?: string
  outputFile?: string
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
              {job.status === "running" && (
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
              {job.status === "pending" && (
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
              {job.outputFile && (
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

const generateJobData = () => {
  return {
    totalJobs: 24,
    runningJobs: 3,
    completedJobs: 18,
    failedJobs: 2,
  }
}

const BillingJobs: React.FC = () => {
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedJob, setSelectedJob] = useState<BillingJob | null>(null)
  const [jobData, setJobData] = useState(generateJobData())
  const pageSize = 10

  const jobs: BillingJob[] = [
    {
      id: 1,
      jobName: "January 2024 Bill Generation",
      jobType: "bill-generation",
      status: "completed",
      priority: "high",
      scheduledTime: "2024-01-01 00:00",
      startTime: "2024-01-01 00:05",
      endTime: "2024-01-01 02:30",
      initiatedBy: "System Auto",
      progress: 100,
      totalRecords: 89540,
      processedRecords: 89540,
      successCount: 89420,
      failureCount: 120,
      billingCycle: "January 2024",
      description: "Monthly bill generation for all customers",
      outputFile: "bills_january_2024.csv",
    },
    {
      id: 2,
      jobName: "Meter Reading Import - Route A",
      jobType: "meter-reading",
      status: "running",
      priority: "medium",
      scheduledTime: "2024-01-15 08:00",
      startTime: "2024-01-15 08:00",
      endTime: "",
      initiatedBy: "John Adebayo",
      progress: 65,
      totalRecords: 12500,
      processedRecords: 8125,
      successCount: 8100,
      failureCount: 25,
      billingCycle: "February 2024",
      description: "Import meter readings from field agents for Route A",
    },
    {
      id: 3,
      jobName: "Q4 2023 Financial Report",
      jobType: "report-generation",
      status: "pending",
      priority: "medium",
      scheduledTime: "2024-01-20 22:00",
      startTime: "",
      endTime: "",
      initiatedBy: "Sarah Johnson",
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      successCount: 0,
      failureCount: 0,
      billingCycle: "Q4 2023",
      description: "Generate quarterly financial reports for management",
    },
    {
      id: 4,
      jobName: "Customer Data Export",
      jobType: "data-export",
      status: "failed",
      priority: "low",
      scheduledTime: "2024-01-14 14:00",
      startTime: "2024-01-14 14:00",
      endTime: "2024-01-14 14:15",
      initiatedBy: "Michael Chen",
      progress: 45,
      totalRecords: 150000,
      processedRecords: 67500,
      successCount: 67500,
      failureCount: 0,
      billingCycle: "N/A",
      description: "Export customer data for analytics team",
      errorMessage: "Disk space insufficient for export file",
    },
    {
      id: 5,
      jobName: "System Database Maintenance",
      jobType: "system-maintenance",
      status: "completed",
      priority: "critical",
      scheduledTime: "2024-01-13 23:00",
      startTime: "2024-01-13 23:00",
      endTime: "2024-01-14 01:30",
      initiatedBy: "System Auto",
      progress: 100,
      totalRecords: 0,
      processedRecords: 0,
      successCount: 1,
      failureCount: 0,
      billingCycle: "N/A",
      description: "Weekly database optimization and cleanup",
    },
    {
      id: 6,
      jobName: "Pending Dispute Processing",
      jobType: "dispute-processing",
      status: "running",
      priority: "high",
      scheduledTime: "2024-01-15 09:00",
      startTime: "2024-01-15 09:00",
      endTime: "",
      initiatedBy: "Dispute System",
      progress: 30,
      totalRecords: 156,
      processedRecords: 47,
      successCount: 45,
      failureCount: 2,
      billingCycle: "January 2024",
      description: "Process pending billing disputes automatically",
    },
    {
      id: 7,
      jobName: "February 2024 Pre-Billing Check",
      jobType: "bill-generation",
      status: "cancelled",
      priority: "medium",
      scheduledTime: "2024-01-25 06:00",
      startTime: "",
      endTime: "",
      initiatedBy: "System Auto",
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      successCount: 0,
      failureCount: 0,
      billingCycle: "February 2024",
      description: "Pre-billing validation and checks",
    },
  ]

  const isLoading = false
  const isError = false
  const totalRecords = jobs.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: BillingJob["status"]) => {
    switch (status) {
      case "pending":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "running":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "completed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "failed":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "cancelled":
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

  const getPriorityStyle = (priority: BillingJob["priority"]) => {
    switch (priority) {
      case "low":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "medium":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "high":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "critical":
        return {
          backgroundColor: "#FDF2F8",
          color: "#DB2777",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getJobTypeStyle = (type: BillingJob["jobType"]) => {
    switch (type) {
      case "bill-generation":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "meter-reading":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "data-export":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "report-generation":
        return {
          backgroundColor: "#F3E8FF",
          color: "#9333EA",
        }
      case "system-maintenance":
        return {
          backgroundColor: "#FDF2F8",
          color: "#DB2777",
        }
      case "dispute-processing":
        return {
          backgroundColor: "#FFFBEB",
          color: "#D97706",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatJobType = (type: BillingJob["jobType"]) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
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

  const handleAddJobSuccess = async () => {
    setIsAddJobModalOpen(false)
    setJobData(generateJobData())
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div>Error loading jobs</div>

  return (
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto px-4 py-8 max-sm:px-2 lg:px-16">
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
                  New Job
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
                        placeholder="Search jobs by name or description..."
                        value={searchText}
                        onChange={handleSearch}
                        onCancel={handleCancelSearch}
                      />
                    </div>
                  </div>

                  {jobs.length === 0 ? (
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
                                <th className="whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <MdOutlineCheckBoxOutlineBlank className="text-lg text-gray-400" />
                                    Job Name
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("jobType")}
                                >
                                  <div className="flex items-center gap-2">
                                    Job Type <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("status")}
                                >
                                  <div className="flex items-center gap-2">
                                    Status <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("priority")}
                                >
                                  <div className="flex items-center gap-2">
                                    Priority <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("progress")}
                                >
                                  <div className="flex items-center gap-2">
                                    Progress <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("billingCycle")}
                                >
                                  <div className="flex items-center gap-2">
                                    Billing Cycle <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("initiatedBy")}
                                >
                                  <div className="flex items-center gap-2">
                                    Initiated By <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("scheduledTime")}
                                >
                                  <div className="flex items-center gap-2">
                                    Scheduled Time <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("processedRecords")}
                                >
                                  <div className="flex items-center gap-2">
                                    Records <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th className="whitespace-nowrap border-b border-t p-4 text-sm font-semibold text-gray-900">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <AnimatePresence>
                                {jobs.map((job, index) => (
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
                                          <div className="font-medium text-gray-900">{job.jobName}</div>
                                          <div className="text-xs text-gray-500">{job.description}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getJobTypeStyle(job.jobType)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {formatJobType(job.jobType)}
                                      </motion.div>
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
                                              job.status === "pending"
                                                ? "#D97706"
                                                : job.status === "running"
                                                ? "#2563EB"
                                                : job.status === "completed"
                                                ? "#589E67"
                                                : job.status === "failed"
                                                ? "#AF4B4B"
                                                : "#6B7280",
                                          }}
                                        ></span>
                                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getPriorityStyle(job.priority)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        <span
                                          className="size-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              job.priority === "low"
                                                ? "#589E67"
                                                : job.priority === "medium"
                                                ? "#D97706"
                                                : job.priority === "high"
                                                ? "#AF4B4B"
                                                : "#DB2777",
                                          }}
                                        ></span>
                                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-20 rounded-full bg-gray-200">
                                          <div
                                            className="h-2 rounded-full bg-green-500 transition-all duration-300"
                                            style={{ width: `${job.progress}%` }}
                                          />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">{job.progress}%</span>
                                      </div>
                                      <div className="mt-1 text-xs text-gray-500">
                                        {job.processedRecords.toLocaleString()} / {job.totalRecords.toLocaleString()}
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {job.billingCycle}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {job.initiatedBy}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {job.scheduledTime}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <div className="text-sm font-medium text-gray-900">
                                        {job.processedRecords.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {job.successCount.toLocaleString()} success
                                      </div>
                                      {job.failureCount > 0 && (
                                        <div className="text-xs text-red-500">
                                          {job.failureCount.toLocaleString()} failed
                                        </div>
                                      )}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <ActionDropdown job={job} onViewDetails={setSelectedJob} />
                                    </td>
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      <motion.div
                        className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <div className="text-sm text-gray-700">
                          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)}{" "}
                          of {totalRecords} entries
                        </div>
                        <div className="flex items-center gap-1">
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
                            <MdOutlineArrowBackIosNew size={16} />
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

                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className="px-1 text-gray-500">...</span>
                          )}

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
                            <MdOutlineArrowForwardIos size={16} />
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
        isOpen={isAddJobModalOpen}
        onRequestClose={() => setIsAddJobModalOpen(false)}
        onSuccess={handleAddJobSuccess}
      />
    </section>
  )
}

export default BillingJobs
