"use client"
import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { PlusIcon, UserIcon } from "components/Icons/Icons"
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

interface PostpaidBillDispute {
  id: number
  customerName: string
  accountNumber: string
  billingCycle: string
  disputedAmount: string
  originalAmount: string
  status: "pending" | "under-review" | "resolved" | "rejected" | "escalated"
  disputeType:
    | "meter-reading-error"
    | "tariff-application"
    | "service-charge"
    | "penalty-charge"
    | "billing-cycle"
    | "other"
  disputeCategory: "meter-issue" | "billing-error" | "service-issue" | "penalty-dispute"
  submittedDate: string
  dueDate: string
  priority: "low" | "medium" | "high" | "critical"
  assignedTo: string
  description: string
  resolution?: string
  meterNumber: string
  previousReading: string
  currentReading: string
  consumption: string
  tariffPlan: string
  location: string
  customerType: "Residential" | "Commercial" | "Industrial"
}

interface ActionDropdownProps {
  dispute: PostpaidBillDispute
  onViewDetails: (dispute: PostpaidBillDispute) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ dispute, onViewDetails }) => {
  const [isAddDisputeModalOpen, setIsAddDisputeModalOpen] = useState(false)
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
    onViewDetails(dispute)
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
                  console.log("Update dispute:", dispute.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Status
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Assign dispute:", dispute.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Assign to Agent
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
                onClick={() => {
                  console.log("Adjust bill:", dispute.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#eff6ff" }}
                transition={{ duration: 0.1 }}
              >
                Adjust Bill
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
              {[...Array(11)].map((_, i) => (
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
                {[...Array(11)].map((_, cellIndex) => (
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
                            delay: (rowIndex * 11 + cellIndex) * 0.05,
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

const generateDisputeData = () => {
  return {
    totalDisputes: 156,
    pendingDisputes: 42,
    resolvedDisputes: 89,
    escalatedDisputes: 25,
  }
}

const PostpaidBillDisputes: React.FC = () => {
  const [isAddDisputeModalOpen, setIsAddDisputeModalOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDispute, setSelectedDispute] = useState<PostpaidBillDispute | null>(null)
  const [disputeData, setDisputeData] = useState(generateDisputeData())
  const pageSize = 10

  const disputes: PostpaidBillDispute[] = [
    {
      id: 1,
      customerName: "Fatima Hassan",
      accountNumber: "2301567890",
      billingCycle: "January 2024",
      disputedAmount: "₦425",
      originalAmount: "₦625",
      status: "pending",
      disputeType: "meter-reading-error",
      disputeCategory: "meter-issue",
      submittedDate: "2024-01-16",
      dueDate: "2024-01-23",
      priority: "medium",
      assignedTo: "John Adebayo",
      description: "Customer claims meter reading is incorrect - actual reading should be lower",
      meterNumber: "MTR-789456",
      previousReading: "2450",
      currentReading: "2485",
      consumption: "35 units",
      tariffPlan: "Residential Tier 1",
      location: "Lagos Island",
      customerType: "Residential",
    },
    {
      id: 2,
      customerName: "Tech Solutions Ltd",
      accountNumber: "2301789012",
      billingCycle: "January 2024",
      disputedAmount: "₦1,250",
      originalAmount: "₦2,150",
      status: "under-review",
      disputeType: "tariff-application",
      disputeCategory: "billing-error",
      submittedDate: "2024-01-16",
      dueDate: "2024-01-25",
      priority: "high",
      assignedTo: "Sarah Johnson",
      description: "Commercial customer claims incorrect tariff was applied to their account",
      meterNumber: "MTR-789123",
      previousReading: "12450",
      currentReading: "12680",
      consumption: "230 units",
      tariffPlan: "Commercial Tier 3",
      location: "Victoria Island",
      customerType: "Commercial",
    },
    {
      id: 3,
      customerName: "Michael Johnson",
      accountNumber: "2301890123",
      billingCycle: "January 2024",
      disputedAmount: "₦320",
      originalAmount: "₦520",
      status: "resolved",
      disputeType: "service-charge",
      disputeCategory: "service-issue",
      submittedDate: "2024-01-15",
      dueDate: "2024-01-22",
      priority: "low",
      assignedTo: "James Okafor",
      description: "Customer disputes service charge for maintenance not performed",
      resolution: "Service charge waived - maintenance log confirmed no service was rendered",
      meterNumber: "MTR-456789",
      previousReading: "3450",
      currentReading: "3480",
      consumption: "30 units",
      tariffPlan: "Residential Tier 1",
      location: "Lekki",
      customerType: "Residential",
    },
    {
      id: 4,
      customerName: "Grace Okonkwo",
      accountNumber: "2301678901",
      billingCycle: "January 2024",
      disputedAmount: "₦187",
      originalAmount: "₦287",
      status: "escalated",
      disputeType: "penalty-charge",
      disputeCategory: "penalty-dispute",
      submittedDate: "2024-01-16",
      dueDate: "2024-01-30",
      priority: "critical",
      assignedTo: "Legal Department",
      description: "Customer disputes late payment penalty claiming payment was made on time",
      meterNumber: "MTR-456123",
      previousReading: "5670",
      currentReading: "5725",
      consumption: "55 units",
      tariffPlan: "Commercial Tier 2",
      location: "Surulere",
      customerType: "Commercial",
    },
    {
      id: 5,
      customerName: "Sarah Blumenthal",
      accountNumber: "2301901234",
      billingCycle: "January 2024",
      disputedAmount: "₦550",
      originalAmount: "₦750",
      status: "rejected",
      disputeType: "billing-cycle",
      disputeCategory: "billing-error",
      submittedDate: "2024-01-15",
      dueDate: "2024-01-22",
      priority: "medium",
      assignedTo: "John Adebayo",
      description: "Customer claims billing cycle dates are incorrect",
      resolution: "Dispute rejected - billing cycle verified as correct",
      meterNumber: "MTR-987654",
      previousReading: "45670",
      currentReading: "46250",
      consumption: "580 units",
      tariffPlan: "Industrial Tier 1",
      location: "Ilupeju",
      customerType: "Industrial",
    },
    {
      id: 6,
      customerName: "Adebayo Enterprises",
      accountNumber: "2302012345",
      billingCycle: "January 2024",
      disputedAmount: "₦2,150",
      originalAmount: "₦3,150",
      status: "under-review",
      disputeType: "other",
      disputeCategory: "service-issue",
      submittedDate: "2024-01-15",
      dueDate: "2024-01-24",
      priority: "high",
      assignedTo: "Sarah Johnson",
      description: "Large commercial account disputes multiple charges on the bill",
      meterNumber: "MTR-123789",
      previousReading: "78900",
      currentReading: "79250",
      consumption: "350 units",
      tariffPlan: "Industrial Tier 2",
      location: "Ikeja",
      customerType: "Industrial",
    },
  ]

  const isLoading = false
  const isError = false
  const totalRecords = disputes.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: PostpaidBillDispute["status"]) => {
    switch (status) {
      case "pending":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "under-review":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "resolved":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "rejected":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "escalated":
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

  const getPriorityStyle = (priority: PostpaidBillDispute["priority"]) => {
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

  const getDisputeTypeStyle = (type: PostpaidBillDispute["disputeType"]) => {
    switch (type) {
      case "meter-reading-error":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "tariff-application":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "service-charge":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "penalty-charge":
        return {
          backgroundColor: "#FDF2F8",
          color: "#DB2777",
        }
      case "billing-cycle":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "other":
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

  const getCustomerTypeStyle = (type: PostpaidBillDispute["customerType"]) => {
    switch (type) {
      case "Residential":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "Commercial":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "Industrial":
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

  const handleAddDisputeSuccess = async () => {
    setIsAddDisputeModalOpen(false)
    // Refresh data after adding dispute
    setDisputeData(generateDisputeData())
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div>Error loading disputes</div>

  return (
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto mt-6 flex w-full flex-col px-3 2xl:container xl:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Postpaid Bill Disputes</h4>
                <p className="text-gray-600">Manage and resolve customer billing disputes and adjustments</p>
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
                  onClick={() => setIsAddDisputeModalOpen(true)}
                >
                  New Dispute
                </ButtonModule>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Dispute Table Container */}
              <div className="w-full">
                <motion.div
                  className="w-full rounded-lg border bg-white p-4 lg:p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold">Dispute Directory</h3>
                    <div className="max-w-md">
                      <SearchModule
                        placeholder="Search customers, accounts, or meter numbers..."
                        value={searchText}
                        onChange={handleSearch}
                        onCancel={handleCancelSearch}
                      />
                    </div>
                  </div>

                  {disputes.length === 0 ? (
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
                        {searchText ? "No matching disputes found" : "No disputes available"}
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
                                    Customer
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("billingCycle")}
                                >
                                  <div className="flex items-center gap-2">
                                    Billing Cycle <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("disputedAmount")}
                                >
                                  <div className="flex items-center gap-2">
                                    Disputed Amount <RxCaretSort className="text-gray-400" />
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
                                  onClick={() => toggleSort("disputeType")}
                                >
                                  <div className="flex items-center gap-2">
                                    Dispute Type <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("priority")}
                                >
                                  <div className="flex items-center gap-2">
                                    Priority <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("customerType")}
                                >
                                  <div className="flex items-center gap-2">
                                    Customer Type <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("submittedDate")}
                                >
                                  <div className="flex items-center gap-2">
                                    Submitted <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("dueDate")}
                                >
                                  <div className="flex items-center gap-2">
                                    Due Date <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("assignedTo")}
                                >
                                  <div className="flex items-center gap-2">
                                    Assigned To <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <AnimatePresence>
                                {disputes.map((dispute, index) => (
                                  <motion.tr
                                    key={dispute.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                                      <div className="flex items-center gap-2">
                                        <UserIcon />
                                        <div>
                                          <div className="font-medium text-gray-900">{dispute.customerName}</div>
                                          <div className="text-xs text-gray-500">{dispute.accountNumber}</div>
                                          <div className="text-xs text-blue-600">{dispute.meterNumber}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {dispute.billingCycle}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <div className="font-semibold text-gray-900">{dispute.disputedAmount}</div>
                                      <div className="text-xs text-gray-500">Original: {dispute.originalAmount}</div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getStatusStyle(dispute.status)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        <span
                                          className="size-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              dispute.status === "pending"
                                                ? "#D97706"
                                                : dispute.status === "under-review"
                                                ? "#2563EB"
                                                : dispute.status === "resolved"
                                                ? "#589E67"
                                                : dispute.status === "rejected"
                                                ? "#AF4B4B"
                                                : "#DB2777",
                                          }}
                                        ></span>
                                        {dispute.status.charAt(0).toUpperCase() +
                                          dispute.status.slice(1).replace("-", " ")}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getDisputeTypeStyle(dispute.disputeType)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {dispute.disputeType
                                          .split("-")
                                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                          .join(" ")}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getPriorityStyle(dispute.priority)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        <span
                                          className="size-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              dispute.priority === "low"
                                                ? "#589E67"
                                                : dispute.priority === "medium"
                                                ? "#D97706"
                                                : dispute.priority === "high"
                                                ? "#AF4B4B"
                                                : "#DB2777",
                                          }}
                                        ></span>
                                        {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getCustomerTypeStyle(dispute.customerType)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {dispute.customerType}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {dispute.submittedDate}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <div
                                        className={`font-medium ${
                                          new Date(dispute.dueDate) < new Date() ? "text-red-600" : "text-gray-600"
                                        }`}
                                      >
                                        {dispute.dueDate}
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {dispute.assignedTo}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <ActionDropdown dispute={dispute} onViewDetails={setSelectedDispute} />
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

                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className="px-1 text-gray-500">...</span>
                          )}

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
        isOpen={isAddDisputeModalOpen}
        onRequestClose={() => setIsAddDisputeModalOpen(false)}
        onSuccess={handleAddDisputeSuccess}
      />
    </section>
  )
}

export default PostpaidBillDisputes
