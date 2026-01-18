"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { PlusIcon, UserIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { BillingDisputeData, getAllBillingDisputes, GetAllDisputesParams } from "lib/redux/billingDisputeSlice"
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
        <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(11)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(11)].map((_, cellIndex) => (
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

const PostpaidBillDisputes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [isAddDisputeModalOpen, setIsAddDisputeModalOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDispute, setSelectedDispute] = useState<PostpaidBillDispute | null>(null)
  const pageSize = 10

  const {
    loadingDisputes,
    disputes: apiDisputes,
    disputesError,
    disputesTotalCount,
    disputesTotalPages,
  } = useAppSelector((state) => state.billingDispute)

  const formatDate = (value: string | null | undefined): string => {
    if (!value) return "-"
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  }

  const mapStatus = (status: number): PostpaidBillDispute["status"] => {
    switch (status) {
      case 0:
        return "pending"
      case 1:
        return "under-review"
      case 2:
        return "resolved"
      case 3:
        return "rejected"
      default:
        return "pending"
    }
  }

  const mapPriority = (status: number): PostpaidBillDispute["priority"] => {
    switch (status) {
      case 0:
        return "medium"
      case 1:
        return "high"
      case 2:
        return "low"
      case 3:
        return "critical"
      default:
        return "medium"
    }
  }

  const mapDisputeType = (_dispute: BillingDisputeData): PostpaidBillDispute["disputeType"] => {
    return "other"
  }

  const mapCustomerType = (_dispute: BillingDisputeData): PostpaidBillDispute["customerType"] => {
    return "Residential"
  }

  const mapBillingDisputeToPostpaid = (dispute: BillingDisputeData): PostpaidBillDispute => {
    const firstPayment = dispute.payments && dispute.payments.length > 0 ? dispute.payments[0] : undefined
    const billingCycle = firstPayment?.postpaidBillPeriod || "-"

    const disputedAmountNumber = firstPayment?.overPaymentAmount ?? 0
    const originalAmountNumber = firstPayment?.billTotalDue ?? 0

    return {
      id: dispute.id,
      customerName: dispute.customerName,
      accountNumber: dispute.customerAccountNumber,
      billingCycle,
      disputedAmount: formatCurrency(disputedAmountNumber, "₦"),
      originalAmount: formatCurrency(originalAmountNumber, "₦"),
      status: mapStatus(dispute.status),
      disputeType: mapDisputeType(dispute),
      disputeCategory: "billing-error",
      submittedDate: formatDate(dispute.raisedAtUtc),
      dueDate: formatDate(dispute.resolvedAtUtc || dispute.raisedAtUtc),
      priority: mapPriority(dispute.status),
      assignedTo: dispute.raisedByName || "-",
      description: dispute.reason || dispute.details,
      resolution: dispute.resolutionNotes || undefined,
      meterNumber: "-",
      previousReading: "-",
      currentReading: "-",
      consumption: "-",
      tariffPlan: "-",
      location: firstPayment?.areaOfficeName || "-",
      customerType: mapCustomerType(dispute),
    }
  }

  const disputes: PostpaidBillDispute[] = (apiDisputes || []).map(mapBillingDisputeToPostpaid)

  const isLoading = loadingDisputes
  const isError = !!disputesError
  const totalRecords = disputesTotalCount || disputes.length
  const totalPages = disputesTotalPages || Math.ceil(totalRecords / pageSize)

  useEffect(() => {
    const params: GetAllDisputesParams = {
      PageNumber: currentPage,
      PageSize: pageSize,
    }

    dispatch(getAllBillingDisputes(params))
  }, [dispatch, currentPage, pageSize])

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

  const handleManualSearch = () => {
    const trimmed = searchText.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
      setCurrentPage(1)
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const handleAddDisputeSuccess = async () => {
    setIsAddDisputeModalOpen(false)
    // Refresh data after adding dispute
    const params: GetAllDisputesParams = {
      PageNumber: currentPage,
      PageSize: pageSize,
    }
    dispatch(getAllBillingDisputes(params))
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div className="p-4 text-red-500">Error loading disputes: {disputesError}</div>

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto mt-6 flex w-full flex-col px-3 2xl:container xl:px-16">
            <motion.div
              className="items-center justify-between border-b py-2 md:flex md:py-4"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Postpaid Bill Disputes</p>
                <p className="text-sm text-gray-600">Manage and resolve customer billing disputes and adjustments</p>
              </div>
              <div className="flex gap-4">
                <SearchModule
                  value={searchText}
                  onChange={handleSearch}
                  onCancel={handleCancelSearch}
                  onSearch={handleManualSearch}
                  placeholder="Search customers, accounts, or meter numbers..."
                  className="w-[380px]"
                  bgClassName="bg-white"
                />
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
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {disputes.length === 0 ? (
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
                    {searchText ? "No matching disputes found" : "No disputes available"}
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
                    <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th className="whitespace-nowrap border-b p-4 text-sm">
                            <div className="flex items-center gap-2">
                              <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                              Customer
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                            onClick={() => toggleSort("billingCycle")}
                          >
                            <div className="flex items-center gap-2">
                              Billing Cycle <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                            onClick={() => toggleSort("disputedAmount")}
                          >
                            <div className="flex items-center gap-2">
                              Disputed Amount <RxCaretSort />
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
                            onClick={() => toggleSort("disputeType")}
                          >
                            <div className="flex items-center gap-2">
                              Dispute Type <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                            onClick={() => toggleSort("priority")}
                          >
                            <div className="flex items-center gap-2">
                              Priority <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                            onClick={() => toggleSort("customerType")}
                          >
                            <div className="flex items-center gap-2">
                              Customer Type <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                            onClick={() => toggleSort("submittedDate")}
                          >
                            <div className="flex items-center gap-2">
                              Submitted <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                            onClick={() => toggleSort("dueDate")}
                          >
                            <div className="flex items-center gap-2">
                              Due Date <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                            onClick={() => toggleSort("assignedTo")}
                          >
                            <div className="flex items-center gap-2">
                              Assigned To <RxCaretSort />
                            </div>
                          </th>
                          <th className="whitespace-nowrap border-b p-4 text-sm">
                            <div className="flex items-center gap-2">Actions</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {disputes.map((dispute, index) => (
                            <motion.tr
                              key={dispute.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <UserIcon />
                                  <div>
                                    <div className="font-medium text-gray-900">{dispute.customerName}</div>
                                    <div className="text-xs text-gray-500">{dispute.accountNumber}</div>
                                    <div className="text-xs text-blue-600">{dispute.meterNumber}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm text-gray-600">
                                {dispute.billingCycle}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <div className="font-semibold text-gray-900">{dispute.disputedAmount}</div>
                                <div className="text-xs text-gray-500">Original: {dispute.originalAmount}</div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <motion.div
                                  style={getStatusStyle(dispute.status)}
                                  className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
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
                                  {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1).replace("-", " ")}
                                </motion.div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <motion.div
                                  style={getDisputeTypeStyle(dispute.disputeType)}
                                  className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.1 }}
                                >
                                  {dispute.disputeType
                                    .split("-")
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
                                </motion.div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <motion.div
                                  style={getPriorityStyle(dispute.priority)}
                                  className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
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
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <motion.div
                                  style={getCustomerTypeStyle(dispute.customerType)}
                                  className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.1 }}
                                >
                                  {dispute.customerType}
                                </motion.div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm text-gray-600">
                                {dispute.submittedDate}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <div
                                  className={`font-medium ${
                                    new Date(dispute.dueDate) < new Date() ? "text-red-600" : "text-gray-600"
                                  }`}
                                >
                                  {dispute.dueDate}
                                </div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm text-gray-600">
                                {dispute.assignedTo}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                                {/* <ActionDropdown
                                  dispute={dispute}
                                  onViewDetails={(dispute) => setSelectedDispute(dispute)}
                                /> */}

                                <ButtonModule
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/disputes/billing-disputes/details/${dispute.id}`)}
                                >
                                  View Details
                                </ButtonModule>
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

                      {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

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
                        <MdOutlineArrowForwardIos />
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
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
