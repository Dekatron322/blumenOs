"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"

// Mock data for Payment types
enum PaymentStatus {
  Confirmed = "CONFIRMED",
  Pending = "PENDING",
  Failed = "FAILED",
  Reversed = "REVERSED",
}

enum PaymentChannel {
  Cash = "CASH",
  BankTransfer = "BANK_TRANSFER",
  Pos = "POS",
  Card = "CARD",
  VendorWallet = "VENDOR_WALLET",
  Chaque = "CHEQUE",
}

enum CollectorType {
  Customer = "CUSTOMER",
  SalesRep = "SALES_REP",
  Vendor = "VENDOR",
  Staff = "STAFF",
}

interface Payment {
  id: number
  reference: string
  amount: number
  customerName: string
  customerAccountNumber: string
  agentName: string
  agentCode: string
  paymentTypeName: string
  channel: PaymentChannel
  status: PaymentStatus
  collectorType: CollectorType
  paidAtUtc: string
  areaOfficeName: string
  createdAt: string
  updatedAt: string
}

interface ActionDropdownProps {
  payment: Payment
  onViewDetails: (payment: Payment) => void
}

// Data for generating random payments
const customerNames = [
  "John Smith",
  "Jane Doe",
  "Michael Johnson",
  "Sarah Williams",
  "David Brown",
  "Lisa Davis",
  "Robert Wilson",
  "Emily Taylor",
  "William Moore",
  "Olivia Anderson",
]

const agentNames = [
  "Agent James",
  "Agent Mary",
  "Agent Paul",
  "Agent Grace",
  "Agent Thomas",
  "Agent Susan",
  "Agent Richard",
  "Agent Patricia",
  "Agent Daniel",
  "Agent Jennifer",
]

const paymentTypes = ["Electricity Bill", "Water Bill", "Gas Bill", "Rent", "Service Charge"]
const areaOffices = ["Ikeja Area", "Victoria Island", "Garki", "Maitama", "Kano Central", "Port Harcourt"]

// Generate random payments
const generateRandomPayments = (count: number): Payment[] => {
  return Array.from({ length: count }, (_, index) => {
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)] || "Unknown Customer"
    const agentName = agentNames[Math.floor(Math.random() * agentNames.length)] || "Unknown Agent"
    const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)] || "Unknown Payment Type"
    const areaOffice = areaOffices[Math.floor(Math.random() * areaOffices.length)] || "Unknown Area Office"
    const statusList = [PaymentStatus.Confirmed, PaymentStatus.Pending, PaymentStatus.Failed, PaymentStatus.Reversed]
    const randomStatusIndex = Math.floor(Math.random() * statusList.length)
    const status = statusList[randomStatusIndex] ?? PaymentStatus.Pending
    const channel = [
      PaymentChannel.Cash,
      PaymentChannel.BankTransfer,
      PaymentChannel.Pos,
      PaymentChannel.Card,
      PaymentChannel.VendorWallet,
      PaymentChannel.Chaque,
    ][Math.floor(Math.random() * 6)]

    const collectorList = [CollectorType.Customer, CollectorType.SalesRep, CollectorType.Vendor, CollectorType.Staff]
    const randomCollectorIndex = Math.floor(Math.random() * collectorList.length)
    const collectorType = collectorList[randomCollectorIndex] ?? CollectorType.Customer

    // Generate random date within the last 30 days
    const randomDaysAgo = Math.floor(Math.random() * 30)
    const paidDate = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000)

    return {
      id: 1000 + index,
      reference: `PAY-${String(1000 + index).padStart(6, "0")}`,
      amount: Math.floor(Math.random() * 50000) + 1000,
      customerName: customerName,
      customerAccountNumber: `ACC${String(Math.floor(Math.random() * 1000000)).padStart(8, "0")}`,
      agentName: agentName,
      agentCode: `AGT${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      paymentTypeName: paymentType,
      channel: channel ?? PaymentChannel.Cash,
      status: status,
      collectorType: collectorType,
      paidAtUtc: paidDate.toISOString(),
      areaOfficeName: areaOffice,
      createdAt: new Date(Date.now() - (randomDaysAgo + 1) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
    }
  })
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ payment, onViewDetails }) => {
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
    onViewDetails(payment)
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
                  console.log("Update payment:", payment.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Payment
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

interface AllPaymentsTableProps {
  agentId?: number
  customerId?: number
}

const AllPaymentsTable: React.FC<AllPaymentsTableProps> = ({ agentId, customerId }) => {
  const router = useRouter()

  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [paymentsPagination, setPaymentsPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 5,
    totalCount: 50,
  })

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    channel: "",
    collectorType: "",
  })

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: PaymentStatus.Pending, label: "Pending" },
    { value: PaymentStatus.Confirmed, label: "Confirmed" },
    { value: PaymentStatus.Failed, label: "Failed" },
    { value: PaymentStatus.Reversed, label: "Reversed" },
  ]

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: PaymentChannel.Cash, label: "Cash" },
    { value: PaymentChannel.BankTransfer, label: "Bank Transfer" },
    { value: PaymentChannel.Pos, label: "POS" },
    { value: PaymentChannel.Card, label: "Card" },
    { value: PaymentChannel.VendorWallet, label: "Vendor Wallet" },
    { value: PaymentChannel.Chaque, label: "Cheque" },
  ]

  const collectorOptions = [
    { value: "", label: "All Collectors" },
    { value: CollectorType.Customer, label: "Customer" },
    { value: CollectorType.SalesRep, label: "Sales Rep" },
    { value: CollectorType.Vendor, label: "Vendor" },
    { value: CollectorType.Staff, label: "Staff" },
  ]

  const handleViewPaymentDetails = (payment: Payment) => {
    router.push(`/agents/payments/payment-details/${payment.id}`)
  }

  // Get pagination values from state
  const currentPage = paymentsPagination.currentPage
  const pageSize = paymentsPagination.pageSize
  const totalRecords = paymentsPagination.totalCount
  const totalPages = paymentsPagination.totalPages

  // Fetch payments on component mount and when search/pagination/filters change
  useEffect(() => {
    const fetchPayments = () => {
      setPaymentsLoading(true)
      setPaymentsError(null)

      // Simulate API delay
      setTimeout(() => {
        try {
          // Generate payments based on current page and page size
          const generatedPayments = generateRandomPayments(pageSize)

          // Apply search filter if any
          let filteredPayments = generatedPayments
          if (searchText.trim()) {
            const searchTerm = searchText.toLowerCase()
            filteredPayments = generatedPayments.filter(
              (payment) =>
                payment.customerName.toLowerCase().includes(searchTerm) ||
                payment.reference.toLowerCase().includes(searchTerm) ||
                payment.customerAccountNumber.toLowerCase().includes(searchTerm) ||
                payment.agentName.toLowerCase().includes(searchTerm)
            )
          }

          // Apply status filter if any
          if (filters.status) {
            filteredPayments = filteredPayments.filter((payment) => payment.status === filters.status)
          }

          // Apply channel filter if any
          if (filters.channel) {
            filteredPayments = filteredPayments.filter((payment) => payment.channel === filters.channel)
          }

          // Apply collector type filter if any
          if (filters.collectorType) {
            filteredPayments = filteredPayments.filter((payment) => payment.collectorType === filters.collectorType)
          }

          setPayments(filteredPayments)

          // Update pagination info
          const totalCount = 50 // Mock total count
          const totalPages = Math.ceil(totalCount / pageSize)
          setPaymentsPagination((prev) => ({
            ...prev,
            totalPages,
            totalCount,
          }))
        } catch (err) {
          setPaymentsError(err instanceof Error ? err.message : "Failed to load payments")
        } finally {
          setPaymentsLoading(false)
        }
      }, 500) // Simulate network delay
    }

    fetchPayments()
  }, [currentPage, pageSize, searchText, filters, agentId, customerId])

  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Confirmed:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          dotColor: "#589E67",
        }
      case PaymentStatus.Pending:
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          dotColor: "#D97706",
        }
      case PaymentStatus.Failed:
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          dotColor: "#AF4B4B",
        }
      case PaymentStatus.Reversed:
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

  const getChannelStyle = (channel: PaymentChannel) => {
    switch (channel) {
      case PaymentChannel.Cash:
        return {
          backgroundColor: "#F3E8FF",
          color: "#7C3AED",
        }
      case PaymentChannel.BankTransfer:
        return {
          backgroundColor: "#E0F2FE",
          color: "#0284C7",
        }
      case PaymentChannel.Pos:
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case PaymentChannel.Card:
        return {
          backgroundColor: "#FCE7F3",
          color: "#DB2777",
        }
      case PaymentChannel.VendorWallet:
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
        }
      case PaymentChannel.Chaque:
        return {
          backgroundColor: "#FFEDD5",
          color: "#EA580C",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getCollectorTypeStyle = (collectorType: CollectorType) => {
    switch (collectorType) {
      case CollectorType.Customer:
        return {
          backgroundColor: "#F0F9FF",
          color: "#0C4A6E",
        }
      case CollectorType.SalesRep:
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        }
      case CollectorType.Vendor:
        return {
          backgroundColor: "#F3E8FF",
          color: "#5B21B6",
        }
      case CollectorType.Staff:
        return {
          backgroundColor: "#F0FDF4",
          color: "#166534",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    // Reset to first page when searching
    setPaymentsPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    // Reset to first page when clearing search
    setPaymentsPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
    // Reset to first page when filtering
    setPaymentsPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleSelectFilter = (
    e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const name = e.target.name as keyof typeof filters
    const value = String(e.target.value)
    handleFilterChange(name, value)
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      channel: "",
      collectorType: "",
    })
    setSearchText("")
    setPaymentsPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const paginate = (pageNumber: number) => {
    setPaymentsPagination((prev) => ({ ...prev, currentPage: pageNumber }))
  }

  if (paymentsLoading) return <LoadingSkeleton />

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Summary Statistics (Payment Breakdown) */}

      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Payments</p>
          <p className="text-sm text-gray-600">View and manage all payment transactions</p>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        className="my-4 flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <select
            name="status"
            value={filters.status}
            onChange={handleSelectFilter}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            name="channel"
            value={filters.channel}
            onChange={handleSelectFilter}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
          >
            {channelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            name="collectorType"
            value={filters.collectorType}
            onChange={handleSelectFilter}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
          >
            {collectorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchText}
            onChange={handleSearch}
            placeholder="Search payments..."
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
          />
          {searchText && (
            <button
              onClick={handleCancelSearch}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              Clear
            </button>
          )}
        </div>

        {(filters.status || filters.channel || filters.collectorType || searchText) && (
          <motion.button
            onClick={clearFilters}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All Filters
          </motion.button>
        )}
      </motion.div>

      {/* Error Message */}
      {paymentsError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
          <p>Error loading payments: {paymentsError}</p>
        </div>
      )}

      {payments.length === 0 ? (
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
            {searchText || filters.status || filters.channel || filters.collectorType
              ? "No matching payments found"
              : "No payments available"}
          </motion.p>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {searchText || filters.status || filters.channel || filters.collectorType
              ? "Try adjusting your search or filters"
              : "Payments will appear here once transactions are processed"}
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
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center gap-2">
                      Amount <RxCaretSort />
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
                    onClick={() => toggleSort("agentName")}
                  >
                    <div className="flex items-center gap-2">
                      Agent <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("paymentTypeName")}
                  >
                    <div className="flex items-center gap-2">
                      Payment Type <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("channel")}
                  >
                    <div className="flex items-center gap-2">
                      Channel <RxCaretSort />
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
                    onClick={() => toggleSort("collectorType")}
                  >
                    <div className="flex items-center gap-2">
                      Collector <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("paidAtUtc")}
                  >
                    <div className="flex items-center gap-2">
                      Date/Time <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("areaOfficeName")}
                  >
                    <div className="flex items-center gap-2">
                      Area Office <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {payments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                        {payment.reference || `PAY-${payment.id}`}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{payment.customerName || "-"}</div>
                          <div className="text-xs text-gray-500">{payment.customerAccountNumber || ""}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{payment.agentName || "-"}</div>
                          <div className="text-xs text-gray-500">
                            {payment.agentCode ? `Code: ${payment.agentCode}` : ""}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{payment.paymentTypeName || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getChannelStyle(payment.channel)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {payment.channel}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getStatusStyle(payment.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: getStatusStyle(payment.status).dotColor,
                            }}
                          ></span>
                          {payment.status}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getCollectorTypeStyle(payment.collectorType)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {payment.collectorType}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {payment.paidAtUtc ? formatDate(payment.paidAtUtc) : "-"}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{payment.areaOfficeName || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ActionDropdown payment={payment} onViewDetails={handleViewPaymentDetails} />
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
              {totalRecords} payments
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

export default AllPaymentsTable
