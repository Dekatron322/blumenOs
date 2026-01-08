"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { VscEye } from "react-icons/vsc"
import { ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearSupportTicketsStatus, getSupportTickets } from "lib/redux/customersDashboardSlice"
import Image from "next/image"
import { ButtonModule } from "components/ui/Button/Button"

// Support ticket status enum matching API
enum TicketStatus {
  Open = "Open",
  InProgress = "In-Progress",
  Resolved = "Resolved",
  Closed = "Closed",
}

// Support ticket priority enum matching API
enum TicketPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

// Support ticket interface matching API response
interface SupportTicket {
  id: number
  reference: string
  title: string
  description: string
  status: string
  priority: string
  categoryId: number
  categoryName: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  createdAtUtc: string
  lastMessageAtUtc: string
  resolvedAtUtc: string | null
  closedAtUtc: string | null
  assignedToId: number | null
  assignedToName: string | null
  fileUrls: string[]
  messageCount: number
}

interface ActionDropdownProps {
  ticket: SupportTicket
  onViewDetails: (ticket: SupportTicket) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ ticket, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
    onViewDetails(ticket)
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
                  console.log("Update ticket:", ticket.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Ticket
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

interface AllSupportTicketProps {
  agentId?: number
  customerId?: number
  vendorId?: number
  areaOfficeId?: number
  distributionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

const AllSupportTicket: React.FC<AllSupportTicketProps> = ({
  agentId,
  customerId,
  vendorId,
  areaOfficeId,
  distributionSubstationId,
  feederId,
  serviceCenterId,
}) => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // Redux state
  const supportTicketsList = useSelector((state: RootState) => state.customersDashboard.supportTicketsList)
  const supportTicketsPagination = useSelector((state: RootState) => state.customersDashboard.supportTicketsPagination)
  const isLoadingSupportTickets = useSelector((state: RootState) => state.customersDashboard.isLoadingSupportTickets)
  const supportTicketsError = useSelector((state: RootState) => state.customersDashboard.supportTicketsError)

  // Local state
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Filter dropdown states
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)
  const [isPriorityFilterOpen, setIsPriorityFilterOpen] = useState(false)
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)

  // Filter values
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    categoryId: "",
  })

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
  })

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: TicketStatus.Open, label: "Open" },
    { value: TicketStatus.InProgress, label: "In Progress" },
    { value: TicketStatus.Resolved, label: "Resolved" },
    { value: TicketStatus.Closed, label: "Closed" },
  ]

  const priorityOptions = [
    { value: "", label: "All Priority" },
    { value: TicketPriority.Low, label: "Low" },
    { value: TicketPriority.Medium, label: "Medium" },
    { value: TicketPriority.High, label: "High" },
    { value: TicketPriority.Critical, label: "Critical" },
  ]

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "1", label: "Billing & Payments" },
    { value: "2", label: "Meter Issues" },
    { value: "3", label: "Account Management" },
    { value: "4", label: "Technical Support" },
    { value: "5", label: "Service Requests" },
  ]

  const handleViewTicketDetails = (ticket: SupportTicket) => {
    router.push(`/customer-portal/all-support-ticket/${ticket.id}`)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (!target.closest('[data-dropdown-root="status-filter"]')) {
        setIsStatusFilterOpen(false)
      }

      if (!target.closest('[data-dropdown-root="priority-filter"]')) {
        setIsPriorityFilterOpen(false)
      }

      if (!target.closest('[data-dropdown-root="category-filter"]')) {
        setIsCategoryFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Fetch support tickets when filters, search, or pagination changes
  useEffect(() => {
    const fetchSupportTickets = () => {
      const requestParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        customerId,
        status: filters.status || undefined,
        categoryId: filters.categoryId ? parseInt(filters.categoryId) : undefined,
        priority: filters.priority || undefined,
        search: searchText || undefined,
      }

      // Remove undefined values
      const cleanParams = Object.fromEntries(Object.entries(requestParams).filter(([_, value]) => value !== undefined))

      dispatch(getSupportTickets(cleanParams as any))
    }

    fetchSupportTickets()
  }, [
    dispatch,
    pagination.currentPage,
    pagination.pageSize,
    searchText,
    filters.status,
    filters.priority,
    filters.categoryId,
    customerId,
  ])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSupportTicketsStatus())
    }
  }, [dispatch])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case TicketStatus.Resolved:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          dotColor: "#589E67",
        }
      case TicketStatus.InProgress:
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          dotColor: "#D97706",
        }
      case TicketStatus.Open:
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          dotColor: "#AF4B4B",
        }
      case TicketStatus.Closed:
        return {
          backgroundColor: "#EFF6FF",
          color: "#3B82F6",
          dotColor: "#3B82F6",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          dotColor: "#6B7280",
        }
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case TicketPriority.Critical:
        return {
          backgroundColor: "#F3E8FF",
          color: "#7C3AED",
        }
      case TicketPriority.High:
        return {
          backgroundColor: "#E0F2FE",
          color: "#0284C7",
        }
      case TicketPriority.Medium:
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case TicketPriority.Low:
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setShowMobileSearch(false)
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status }))
    setIsStatusFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handlePriorityFilterChange = (priority: string) => {
    setFilters((prev) => ({ ...prev, priority }))
    setIsPriorityFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleCategoryFilterChange = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, categoryId }))
    setIsCategoryFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      categoryId: "",
    })
    setSearchText("")
    setShowMobileSearch(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const paginate = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }))
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value)
    setPagination({ currentPage: 1, pageSize: newPageSize })
  }

  const getPageItems = (): (number | string)[] => {
    const total = supportTicketsPagination?.totalPages || 1
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    // Always show first page
    items.push(1)

    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      // Close to the start: show first few pages
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      // Close to the end: show ellipsis then last few pages
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      // In the middle: show ellipsis, surrounding pages, then ellipsis
      items.push("...", current - 1, current, current + 1, "...")
    }

    // Always show last page
    if (!items.includes(total)) {
      items.push(total)
    }

    return items
  }

  const getMobilePageItems = (): (number | string)[] => {
    const total = supportTicketsPagination?.totalPages || 1
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 4) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    // Example for early pages on mobile: 1,2,3,...,last
    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    // Middle pages: 1, ..., current, ..., last
    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    // Near the end: 1, ..., last-2, last-1, last
    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= (supportTicketsPagination?.totalPages || 1)) {
      setPagination((prev) => ({ ...prev, currentPage: page }))
    }
  }

  if (isLoadingSupportTickets) return <LoadingSkeleton />

  const currentTickets = supportTicketsList || []
  const totalRecords = supportTicketsPagination?.totalCount || 0
  const totalPages = supportTicketsPagination?.totalPages || 1
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Support Tickets</p>
          <p className="text-sm text-gray-600">View and manage all support tickets</p>
        </div>
      </motion.div>

      {/* Header with Search and Mobile Search Toggle */}
      <motion.div
        className="flex flex-col py-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Mobile search input revealed when icon is tapped */}
        {showMobileSearch && (
          <div className="mb-3 sm:hidden">
            <SearchModule
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by reference, title or customer name"
              className="w-full"
            />
          </div>
        )}

        {/* Filters Section */}
        <motion.div
          className="mt-2 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Status Filter Dropdown */}
          <div className="relative" data-dropdown-root="status-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm md:text-base"
              onClick={() => setIsStatusFilterOpen((open) => !open)}
            >
              <IoMdFunnel className="size-4 md:size-5" />
              <span>
                {filters.status === TicketStatus.Open
                  ? "Open"
                  : filters.status === TicketStatus.InProgress
                  ? "In Progress"
                  : filters.status === TicketStatus.Resolved
                  ? "Resolved"
                  : filters.status === TicketStatus.Closed
                  ? "Closed"
                  : "All Status"}
              </span>
              <ChevronDown
                className={`size-3 text-gray-500 transition-transform md:size-4 ${
                  isStatusFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isStatusFilterOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === "" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange("")}
                  >
                    All Status
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === TicketStatus.Open ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(TicketStatus.Open)}
                  >
                    Open
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === TicketStatus.InProgress ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(TicketStatus.InProgress)}
                  >
                    In Progress
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === TicketStatus.Resolved ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(TicketStatus.Resolved)}
                  >
                    Resolved
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.status === TicketStatus.Closed ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(TicketStatus.Closed)}
                  >
                    Closed
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Priority Filter Dropdown */}
          <div className="relative" data-dropdown-root="priority-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm md:text-base"
              onClick={() => setIsPriorityFilterOpen((open) => !open)}
            >
              <IoMdFunnel className="size-4 md:size-5" />
              <span>
                {filters.priority === TicketPriority.Low
                  ? "Low"
                  : filters.priority === TicketPriority.Medium
                  ? "Medium"
                  : filters.priority === TicketPriority.High
                  ? "High"
                  : filters.priority === TicketPriority.Critical
                  ? "Critical"
                  : "All Priority"}
              </span>
              <ChevronDown
                className={`size-3 text-gray-500 transition-transform md:size-4 ${
                  isPriorityFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isPriorityFilterOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.priority === "" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handlePriorityFilterChange("")}
                  >
                    All Priority
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.priority === TicketPriority.Low ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handlePriorityFilterChange(TicketPriority.Low)}
                  >
                    Low
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.priority === TicketPriority.Medium ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handlePriorityFilterChange(TicketPriority.Medium)}
                  >
                    Medium
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.priority === TicketPriority.High ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handlePriorityFilterChange(TicketPriority.High)}
                  >
                    High
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.priority === TicketPriority.Critical ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handlePriorityFilterChange(TicketPriority.Critical)}
                  >
                    Critical
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative" data-dropdown-root="category-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm md:text-base"
              onClick={() => setIsCategoryFilterOpen((open) => !open)}
            >
              <IoMdFunnel className="size-4 md:size-5" />
              <span>
                {filters.categoryId === "1"
                  ? "Billing & Payments"
                  : filters.categoryId === "2"
                  ? "Meter Issues"
                  : filters.categoryId === "3"
                  ? "Account Management"
                  : filters.categoryId === "4"
                  ? "Technical Support"
                  : filters.categoryId === "5"
                  ? "Service Requests"
                  : "All Categories"}
              </span>
              <ChevronDown
                className={`size-3 text-gray-500 transition-transform md:size-4 ${
                  isCategoryFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoryFilterOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.categoryId === "" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange("")}
                  >
                    All Categories
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.categoryId === "1" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange("1")}
                  >
                    Billing & Payments
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.categoryId === "2" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange("2")}
                  >
                    Meter Issues
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.categoryId === "3" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange("3")}
                  >
                    Account Management
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.categoryId === "4" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange("4")}
                  >
                    Technical Support
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.categoryId === "5" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange("5")}
                  >
                    Service Requests
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={handlePageSizeChange} className="button-oulined text-sm md:text-base">
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filters.status || filters.priority || filters.categoryId || searchText) && (
            <motion.button
              onClick={clearFilters}
              className="button-oulined text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All Filters
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Error Message */}
      {supportTicketsError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
          <p>Error loading support tickets: {supportTicketsError}</p>
        </div>
      )}

      {currentTickets.length === 0 ? (
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
            {searchText || filters.status || filters.priority || filters.categoryId
              ? "No matching support tickets found"
              : "No support tickets available"}
          </motion.p>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {searchText || filters.status || filters.priority || filters.categoryId
              ? "Try adjusting your search or filters"
              : "Support tickets will appear here once they are created"}
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
                      Ref
                    </div>
                  </th>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Title <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("customerName")}
                  >
                    <div className="flex items-center gap-2">
                      Customer <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("categoryName")}
                  >
                    <div className="flex items-center gap-2">
                      Category <RxCaretSort />
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
                    onClick={() => toggleSort("createdAtUtc")}
                  >
                    <div className="flex items-center gap-2">
                      Created <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("lastMessageAtUtc")}
                  >
                    <div className="flex items-center gap-2">
                      Last Activity <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentTickets.map((ticket, index) => (
                    <motion.tr
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                        {ticket.reference || `TKT-${ticket.id}`}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="max-w-xs truncate font-medium">{ticket.title}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{ticket.customerName || "-"}</div>
                          <div className="text-xs text-gray-500">{ticket.customerAccountNumber || ""}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{ticket.categoryName || "-"}</td>

                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getStatusStyle(ticket.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: getStatusStyle(ticket.status).dotColor,
                            }}
                          ></span>
                          {ticket.status}
                        </motion.div>
                      </td>

                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {formatDate(ticket.createdAtUtc)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {formatDate(ticket.lastMessageAtUtc)}
                      </td>

                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ButtonModule
                          size="sm"
                          variant="outline"
                          icon={<VscEye />}
                          onClick={() => router.push(`/customer-portal/all-support-ticket/${ticket.id}`)}
                        >
                          View
                        </ButtonModule>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          <motion.div
            className="mt-4 flex w-full flex-row items-center justify-between gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-sm md:text-base">Show rows</p>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="bg-[#F2F2F2] p-1 text-sm md:text-base"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start md:gap-3">
              <button
                className={`px-2 py-1 md:px-3 md:py-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <MdOutlineArrowBackIosNew className="size-4 md:size-5" />
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                <div className="hidden items-center gap-1 md:flex md:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-6 items-center justify-center rounded-md text-xs md:h-7 md:w-8 md:text-sm ${
                          currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
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

                <div className="flex items-center gap-1 md:hidden">
                  {getMobilePageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-6 items-center justify-center rounded-md text-xs md:w-8 ${
                          currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
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
                className={`px-2 py-1 md:px-3 md:py-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <MdOutlineArrowForwardIos className="size-4 md:size-5" />
              </button>
            </div>
            <p className="text-sm max-sm:hidden md:text-base">
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

export default AllSupportTicket
