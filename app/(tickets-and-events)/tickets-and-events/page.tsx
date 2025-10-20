"use client"
import React, { useEffect, useRef, useState } from "react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { RxCaretSort } from "react-icons/rx"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import DeleteModal from "components/ui/Modal/delete-modal"
import Filtericon from "public/filter-icon"
import CalendarIcon from "public/Icons/calendar-2"
import { MapIcon, TicketIcon } from "lucide-react"
import DashboardNav from "components/Navbar/DashboardNav"

type SortOrder = "asc" | "desc" | null

export type Event = {
  id: string
  title: string
  organizer: string
  date: string
  location: string
  status: "active" | "cancelled" | "completed"
  ticketTypes: {
    name: string
    price: number
    quantity: number
  }[]
  attendees: number
  revenue: number
}

export type Ticket = {
  id: string
  eventId: string
  eventTitle: string
  ticketType: string
  price: number
  attendee: string
  purchaseDate: string
  status: "valid" | "used" | "cancelled" | "refunded"
  checkInTime?: string
}

const FilterDropdown = ({
  isOpen,
  onClose,
  onFilterChange,
  activeFilters,
  filterOptions,
}: {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filter: string) => void
  activeFilters: string[]
  filterOptions: { value: string; label: string }[]
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm font-medium text-gray-700">Filter by status</div>
        {filterOptions.map((option) => (
          <button
            key={option.value}
            className={`flex w-full items-center px-4 py-2 text-left text-sm ${
              activeFilters.includes(option.value)
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            onClick={() => onFilterChange(option.value)}
          >
            <span className="mr-2">
              {activeFilters.includes(option.value) ? (
                <svg className="size-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="size-4 opacity-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {option.label}
          </button>
        ))}
        <div className="border-t border-gray-100"></div>
        <button
          className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

const TicketsTable: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const ticketFilterOptions = [
    { value: "valid", label: "Valid" },
    { value: "used", label: "Used" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ]

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const filteredTickets = tickets.filter((ticket) => {
    // Apply search filter
    const searchMatch = Object.values(ticket).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })

    // Apply status filter if any active filters
    const statusMatch = activeFilters.length === 0 || activeFilters.includes(ticket.status)

    return searchMatch && statusMatch
  })

  const getInitial = (name: string) => {
    if (!name || name.length === 0) return ""
    return name.charAt(0).toUpperCase()
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "valid":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "used":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "cancelled":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "refunded":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      default:
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    }
  }

  const dotStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "valid":
        return { backgroundColor: "#589E67" }
      case "used":
        return { backgroundColor: "#4976F4" }
      case "cancelled":
        return { backgroundColor: "#AF4B4B" }
      case "refunded":
        return { backgroundColor: "#954BAF" }
      default:
        return { backgroundColor: "#D28E3D" }
    }
  }

  const toggleSort = (column: keyof Ticket) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleDeleteClick = (ticket: Ticket) => {
    setTicketToDelete(ticket)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (reason: string) => {
    setIsDeleting(true)
    try {
      console.log("Deleting ticket:", ticketToDelete?.id, "Reason:", reason)
      setIsDeleteModalOpen(false)
      setTicketToDelete(null)
    } catch (error) {
      console.error("Error deleting ticket:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsTicketDetailModalOpen(true)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-medium max-sm:pb-3 md:text-xl">Tickets</p>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
          />
          <div className="relative">
            <ButtonModule variant="black" size="md" icon={<Filtericon />} iconPosition="start" onClick={toggleFilter}>
              <p className="max-sm:hidden">Filter</p>
              {activeFilters.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-500 px-2 py-1 text-xs font-bold leading-none text-white">
                  {activeFilters.length}
                </span>
              )}
            </ButtonModule>
            <FilterDropdown
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
              filterOptions={ticketFilterOptions}
            />
          </div>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#f9f9f9]">
          <EmptyState />
          <p className="text-base font-bold text-[#202B3C]">No tickets found.</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto border-l border-r bg-[#ffffff]">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("id")}
                  >
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                    Ticket ID <RxCaretSort />
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("eventTitle")}
                  >
                    <div className="flex items-center gap-2">
                      Event <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("ticketType")}
                  >
                    <div className="flex items-center gap-2">
                      Type <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("price")}
                  >
                    <div className="flex items-center gap-2">
                      Price <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("attendee")}
                  >
                    <div className="flex items-center gap-2">
                      Attendee <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("purchaseDate")}
                  >
                    <div className="flex items-center gap-2">
                      Purchase Date <RxCaretSort />
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
                    <div className="flex items-center gap-2">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                        {ticket.id}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <TicketIcon className="size-4" />
                        {ticket.eventTitle}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{ticket.ticketType}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">${ticket.price.toFixed(2)}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-[#EDF0F4]">
                          <p>{getInitial(ticket.attendee)}</p>
                        </div>
                        {ticket.attendee}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon />
                        {formatDate(ticket.purchaseDate)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex">
                        <div
                          style={getStatusStyle(ticket.status)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1 capitalize"
                        >
                          <span className="size-2 rounded-full" style={dotStyle(ticket.status)}></span>
                          {ticket.status}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                      <div className="flex gap-2">
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(ticket)}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          View
                        </ButtonModule>
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(ticket)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </ButtonModule>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t py-3">
            <div className="text-sm text-gray-700">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTickets.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${currentPage === 1 ? "cursor-not-allowed text-gray-500" : "text-[#003F9F]"}`}
              >
                <MdOutlineArrowBackIosNew />
              </button>
              <button
                className={`flex size-7 items-center justify-center rounded-md shadow-sm ${
                  currentPage === 1 ? "bg-white text-[#003F9F]" : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => paginate(1)}
              >
                1
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredTickets.length / itemsPerPage)}
                className={`flex size-7 items-center justify-center rounded-full ${
                  currentPage === Math.ceil(filteredTickets.length / itemsPerPage)
                    ? "cursor-not-allowed text-gray-500"
                    : "text-[#003F9F]"
                }`}
              >
                <MdOutlineArrowForwardIos />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Ticket Detail Modal would go here */}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => {
          setIsDeleteModalOpen(false)
          setTicketToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        businessName={ticketToDelete?.id || "this ticket"}
      />
    </div>
  )
}

const EventManagementPage: React.FC = () => {
  const mockTickets: Ticket[] = [
    {
      id: "TKT-1001",
      eventId: "EVT-001",
      eventTitle: "Tech Conference 2023",
      ticketType: "General Admission",
      price: 199,
      attendee: "John Smith",
      purchaseDate: "2023-10-15T14:30:00",
      status: "valid",
    },
    {
      id: "TKT-1002",
      eventId: "EVT-001",
      eventTitle: "Tech Conference 2023",
      ticketType: "VIP",
      price: 499,
      attendee: "Sarah Johnson",
      purchaseDate: "2023-10-10T09:15:00",
      status: "valid",
    },
    {
      id: "TKT-2001",
      eventId: "EVT-002",
      eventTitle: "Music Festival",
      ticketType: "Weekend Pass",
      price: 159,
      attendee: "Michael Brown",
      purchaseDate: "2023-07-25T16:45:00",
      status: "used",
      checkInTime: "2023-08-20T12:30:00",
    },
    {
      id: "TKT-2002",
      eventId: "EVT-002",
      eventTitle: "Music Festival",
      ticketType: "Single Day",
      price: 89,
      attendee: "Emily Davis",
      purchaseDate: "2023-08-01T11:20:00",
      status: "refunded",
    },
    {
      id: "TKT-3001",
      eventId: "EVT-003",
      eventTitle: "Art Exhibition",
      ticketType: "Standard",
      price: 25,
      attendee: "Robert Wilson",
      purchaseDate: "2023-08-20T13:10:00",
      status: "cancelled",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <DashboardNav />
      <div className="  px-16 py-8">
        <h1 className="mb-6 text-2xl font-bold">Event Management</h1>

        {/* Custom Tabs Implementation */}

        {/* Tab Content */}
        <div>
          <TicketsTable tickets={mockTickets} />
        </div>
      </div>
    </div>
  )
}

export default EventManagementPage
