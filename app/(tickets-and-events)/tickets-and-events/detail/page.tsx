"use client"
import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  MdClose,
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md"
import { RxCaretSort } from "react-icons/rx"
import { FiArrowLeft } from "react-icons/fi"
import { MapIcon } from "lucide-react"
import Modal from "react-modal"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { useRouter } from "next/navigation"

// Components
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import DeleteModal from "components/ui/Modal/delete-modal"
import DashboardNav from "components/Navbar/DashboardNav"

// Icons
import EmptyState from "public/empty-state"
import PdfFile from "public/pdf-file"
import Filtericon from "public/filter-icon"
import CalendarIcon from "public/Icons/calendar-2"

// Types
type SortOrder = "asc" | "desc" | null

export type Attendee = {
  id: string
  name: string
  email: string
  purchaseDate: string
  status: "valid" | "used" | "cancelled" | "refunded"
  checkInTime?: string
}

export type TicketType = {
  id: string
  name: string
  price: number
  quantity: number
  sold: number
  remaining: number
  revenue: number
  attendees: Attendee[]
}

export type Event = {
  id: string
  title: string
  organizer: string
  date: string
  location: string
  status: "active" | "cancelled" | "completed"
  ticketTypes: TicketType[]
  totalAttendees: number
  totalRevenue: number
}

// Animations
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const SkeletonRow = ({ cols = 8 }: { cols?: number }) => {
  return (
    <tr>
      {[...Array(cols)].map((_, index) => (
        <td key={index} className="whitespace-nowrap border-b p-4">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
            className="h-4 w-full rounded bg-gray-200"
          ></motion.div>
        </td>
      ))}
    </tr>
  )
}

const AttendeeDetailModal: React.FC<{
  isOpen: boolean
  attendee: Attendee | null
  onRequestClose: () => void
}> = ({ isOpen, attendee, onRequestClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!modalRef.current) return

    try {
      const canvas = await html2canvas(modalRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Attendee_${attendee?.name}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "valid":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "used":
        return {
          backgroundColor: "#EDF2FE",
          color: "#4976F4",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "cancelled":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "refunded":
        return {
          backgroundColor: "#F4EDF7",
          color: "#954BAF",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      default:
        return {
          backgroundColor: "#FBF4EC",
          color: "#D28E3D",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="outline-none max-sm:w-full max-sm:max-w-[380px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      ariaHideApp={false}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl"
        ref={modalRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-blue-600 font-semibold text-white">
              {attendee?.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xl font-semibold text-gray-800">Attendee Details</p>
          </div>
          <button
            onClick={onRequestClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Detailed fields */}
        <div className="space-y-4 p-6">
          {[
            { label: "Attendee ID", value: attendee?.id },
            { label: "Name", value: attendee?.name },
            { label: "Email", value: attendee?.email },
            { label: "Purchase Date", value: attendee?.purchaseDate ? formatDate(attendee.purchaseDate) : "" },
            ...(attendee?.checkInTime ? [{ label: "Check-in Time", value: formatDate(attendee.checkInTime) }] : []),
            { label: "Status", value: attendee?.status },
          ].map((field, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex justify-between text-sm"
            >
              <p className="font-medium text-gray-600">{field.label}:</p>
              {field.label === "Status" ? (
                <div style={getStatusStyle(field.value || "")} className="inline-block capitalize">
                  {field.value}
                </div>
              ) : (
                <p className="text-gray-800">{field.value}</p>
              )}
            </motion.div>
          ))}

          {/* Actions */}
          <motion.div
            className="mt-8 flex justify-between gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ButtonModule
              variant="outline"
              size="md"
              icon={<PdfFile />}
              iconPosition="start"
              onClick={handleDownloadPDF}
              className="border-gray-300 hover:bg-gray-50"
            >
              Download PDF
            </ButtonModule>
            <ButtonModule
              variant="primary"
              size="md"
              onClick={onRequestClose}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </ButtonModule>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  )
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          ref={dropdownRef}
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            <div className="px-4 py-2 text-sm font-medium text-gray-700">Filter by status</div>
            {filterOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
              </motion.button>
            ))}
            <div className="border-t border-gray-100"></div>
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const AttendeesTable: React.FC<{ attendees: Attendee[] }> = ({ attendees }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [isAttendeeDetailModalOpen, setIsAttendeeDetailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [attendeeToDelete, setAttendeeToDelete] = useState<Attendee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const attendeeFilterOptions = [
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

  const filteredAttendees = attendees.filter((attendee) => {
    // Apply search filter
    const searchMatch = Object.values(attendee).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })

    // Apply status filter if any active filters
    const statusMatch = activeFilters.length === 0 || activeFilters.includes(attendee.status)

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

  const toggleSort = (column: keyof Attendee) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleDeleteClick = (attendee: Attendee) => {
    setAttendeeToDelete(attendee)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (reason: string) => {
    setIsDeleting(true)
    try {
      console.log("Deleting attendee:", attendeeToDelete?.id, "Reason:", reason)
      setIsDeleteModalOpen(false)
      setAttendeeToDelete(null)
    } catch (error) {
      console.error("Error deleting attendee:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewDetails = (attendee: Attendee) => {
    setSelectedAttendee(attendee)
    setIsAttendeeDetailModalOpen(true)
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
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mt-8">
      <motion.h2 className="mb-4 text-xl font-semibold text-gray-800">Attendees</motion.h2>

      {/* Header */}
      <motion.div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-medium text-gray-800 max-sm:pb-3 md:text-xl">Attendee List</p>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
          />
          <div className="relative">
            <ButtonModule
              variant="black"
              size="md"
              icon={<Filtericon />}
              iconPosition="start"
              onClick={toggleFilter}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="max-sm:hidden">Filter</p>
              {activeFilters.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-500 px-2 py-1 text-xs font-bold leading-none text-white"
                >
                  {activeFilters.length}
                </motion.span>
              )}
            </ButtonModule>
            <FilterDropdown
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
              filterOptions={attendeeFilterOptions}
            />
          </div>
        </div>
      </motion.div>

      {filteredAttendees.length === 0 ? (
        <motion.div
          variants={fadeIn}
          className="flex h-60 flex-col items-center justify-center gap-2 rounded-lg bg-gray-50"
        >
          <EmptyState />
          <p className="text-base font-bold text-gray-800">No attendees found.</p>
        </motion.div>
      ) : (
        <>
          <motion.div className="w-full overflow-x-auto rounded-lg  bg-white shadow-sm">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b p-4 text-sm font-medium text-gray-500"
                    onClick={() => toggleSort("id")}
                  >
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                    Attendee ID <RxCaretSort />
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm font-medium text-gray-500"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm font-medium text-gray-500"
                    onClick={() => toggleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm font-medium text-gray-500"
                    onClick={() => toggleSort("purchaseDate")}
                  >
                    <div className="flex items-center gap-2">
                      Purchase Date <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm font-medium text-gray-500"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm font-medium text-gray-500">
                    <div className="flex items-center gap-2">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheckBoxOutlineBlank className="text-lg text-gray-400" />
                        {attendee.id}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-gray-100">
                          <p className="text-sm font-medium text-gray-600">{getInitial(attendee.name)}</p>
                        </div>
                        {attendee.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-700">{attendee.email}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <CalendarIcon />
                        {formatDate(attendee.purchaseDate)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-700">
                      <div className="flex">
                        <div
                          style={getStatusStyle(attendee.status)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1 capitalize"
                        >
                          <span className="size-2 rounded-full" style={dotStyle(attendee.status)}></span>
                          {attendee.status}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm text-gray-700">
                      <div className="flex gap-2">
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(attendee)}
                          className="border-gray-300 hover:bg-gray-50"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View
                        </ButtonModule>
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(attendee)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Delete
                        </ButtonModule>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          <motion.div className="flex items-center justify-between border-t py-4">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAttendees.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAttendees.length)} of {filteredAttendees.length} entries
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`rounded-full p-1 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <MdOutlineArrowBackIosNew size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex size-8 items-center justify-center rounded-md text-sm ${
                  currentPage === 1 ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => paginate(1)}
              >
                1
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredAttendees.length / itemsPerPage)}
                className={`rounded-full p-1 ${
                  currentPage === Math.ceil(filteredAttendees.length / itemsPerPage)
                    ? "cursor-not-allowed text-gray-400"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <MdOutlineArrowForwardIos size={16} />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}

      {/* Attendee Detail Modal */}
      <AttendeeDetailModal
        isOpen={isAttendeeDetailModalOpen}
        attendee={selectedAttendee}
        onRequestClose={() => {
          setIsAttendeeDetailModalOpen(false)
          setSelectedAttendee(null)
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => {
          setIsDeleteModalOpen(false)
          setAttendeeToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        businessName={attendeeToDelete?.name || "this attendee"}
      />
    </motion.div>
  )
}

const TicketDetailsPage: React.FC = () => {
  const router = useRouter()

  // Mock data - in a real app, this would come from an API
  const mockEvent: Event = {
    id: "EVT-001",
    title: "Tech Conference 2023",
    organizer: "Tech Events Inc.",
    date: "2023-11-15T09:00:00",
    location: "San Francisco Convention Center",
    status: "active",
    totalAttendees: 320,
    totalRevenue: 63780,
    ticketTypes: [
      {
        id: "TKT-GA",
        name: "General Admission",
        price: 199,
        quantity: 500,
        sold: 200,
        remaining: 300,
        revenue: 39800,
        attendees: [
          {
            id: "ATT-001",
            name: "John Smith",
            email: "john.smith@example.com",
            purchaseDate: "2023-10-15T14:30:00",
            status: "valid",
          },
          {
            id: "ATT-002",
            name: "Sarah Johnson",
            email: "sarah.j@example.com",
            purchaseDate: "2023-10-10T09:15:00",
            status: "valid",
          },
          {
            id: "ATT-003",
            name: "Michael Brown",
            email: "michael.b@example.com",
            purchaseDate: "2023-10-05T16:45:00",
            status: "used",
            checkInTime: "2023-11-15T10:30:00",
          },
          {
            id: "ATT-004",
            name: "Emily Davis",
            email: "emily.d@example.com",
            purchaseDate: "2023-09-30T11:20:00",
            status: "cancelled",
          },
          {
            id: "ATT-005",
            name: "Robert Wilson",
            email: "robert.w@example.com",
            purchaseDate: "2023-09-25T13:10:00",
            status: "refunded",
          },
        ],
      },
      {
        id: "TKT-VIP",
        name: "VIP",
        price: 499,
        quantity: 50,
        sold: 30,
        remaining: 20,
        revenue: 14970,
        attendees: [
          {
            id: "ATT-101",
            name: "Alex Turner",
            email: "alex.t@example.com",
            purchaseDate: "2023-10-01T10:15:00",
            status: "valid",
          },
          {
            id: "ATT-102",
            name: "Jessica Lee",
            email: "jessica.l@example.com",
            purchaseDate: "2023-09-28T14:30:00",
            status: "used",
            checkInTime: "2023-11-15T09:45:00",
          },
        ],
      },
    ],
  }

  // Get the ticket type ID from URL params
  const [ticketTypeId, setTicketTypeId] = useState<string | null>(null)
  const [ticketType, setTicketType] = useState<TicketType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // In a real app, you would get this from the URL params
      const mockTicketTypeId = "TKT-GA" // This would come from router.query in a real app
      setTicketTypeId(mockTicketTypeId)

      if (mockTicketTypeId) {
        const foundTicketType = mockEvent.ticketTypes.find((type) => type.id === mockTicketTypeId)
        setTicketType(foundTicketType || null)
      }
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "completed":
        return {
          backgroundColor: "#EDF2FE",
          color: "#4976F4",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "cancelled":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      default:
        return {
          backgroundColor: "#FBF4EC",
          color: "#D28E3D",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <DashboardNav />
        <div className="container  px-16 py-8">
          <div className="animate-pulse">
            <div className="mb-6 h-6 w-24 rounded bg-gray-200"></div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between md:flex-row md:items-center">
                <div>
                  <div className="h-8 w-48 rounded bg-gray-200"></div>
                  <div className="mt-2 h-4 w-64 rounded bg-gray-200"></div>
                </div>
                <div className="mt-2 h-6 w-24 rounded bg-gray-200 md:mt-0"></div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-lg border bg-gray-100 p-4"></div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-24 rounded-lg border bg-gray-100 p-4"></div>
                ))}
              </div>
            </div>
            <div className="mt-8 h-96 rounded-lg bg-gray-100"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!ticketType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <DashboardNav />
        <div className="container  flex h-60 items-center justify-center px-4 py-8">
          <p className="text-lg text-gray-600">Ticket type not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <DashboardNav />
      <div className="container px-16 py-8">
        <motion.button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          whileHover={{ x: -2 }}
        >
          <FiArrowLeft className="mr-2" />
          Back to Event
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{ticketType.name}</h1>
              <p className="mt-1 text-gray-600">{mockEvent.title}</p>
            </div>
            <div
              style={getStatusStyle(mockEvent.status)}
              className="mt-2 inline-block text-sm font-medium capitalize md:mt-0"
            >
              {mockEvent.status}
            </div>
          </div>

          <motion.div
            className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-5"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {[
              { label: "Price", value: `$${ticketType.price}` },
              { label: "Sold", value: `${ticketType.sold} / ${ticketType.quantity}` },
              { label: "Revenue", value: `$${ticketType.revenue}` },
            ].map((stat, index) => (
              <motion.div key={index} className="rounded-lg border border-gray-200 p-4 hover:shadow-md">
                <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                <p className="mt-1 text-xl font-semibold text-gray-800">{stat.value}</p>
              </motion.div>
            ))}
            {[
              {
                label: "Event Date",
                value: formatDate(mockEvent.date),
                icon: <CalendarIcon />,
              },
              {
                label: "Location",
                value: mockEvent.location,
                icon: <MapIcon className="mr-2 size-4" />,
              },
            ].map((stat, index) => (
              <motion.div key={index} className="rounded-lg border border-gray-200 p-4 hover:shadow-md">
                <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                <p className="mt-1 flex items-center text-gray-800">
                  {stat.icon}
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"
            variants={stagger}
            initial="hidden"
            animate="visible"
          ></motion.div>
        </motion.div>

        {/* Attendees Table */}
        <AttendeesTable attendees={ticketType.attendees} />
      </div>
    </div>
  )
}

export default TicketDetailsPage
