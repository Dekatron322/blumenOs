"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort } from "react-icons/rx"
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
  MdOutlineCheckBoxOutlineBlank,
  MdOutlineReceipt,
} from "react-icons/md"
import { FiSmartphone } from "react-icons/fi"
import { HiOutlineCash } from "react-icons/hi"
import { BsLightningCharge } from "react-icons/bs"

// Mock data for Vending types
enum VendingStatus {
  Successful = "SUCCESSFUL",
  Failed = "FAILED",
  Pending = "PENDING",
  Reversed = "REVERSED",
}

enum VendingChannel {
  MobileApp = "MOBILE_APP",
  USSD = "USSD",
  VendorPOS = "VENDOR_POS",
  WebPortal = "WEB_PORTAL",
  AgentPOS = "AGENT_POS",
  BankTransfer = "BANK_TRANSFER",
}

enum TokenType {
  Standard = "STANDARD",
  Emergency = "EMERGENCY",
  Bonus = "BONUS",
  Free = "FREE",
}

interface VendingTransaction {
  id: number
  reference: string
  customerName: string
  customerAccountNumber: string
  meterNumber: string
  amount: number
  unitsPurchased: number
  token: string
  tokenType: TokenType
  channel: VendingChannel
  status: VendingStatus
  vendDate: string
  expiryDate: string
  tariff: string
  serviceCenter: string
  areaOffice: string
  vendorName: string
  vendorCode: string
  transactionFee: number
  receiptNumber: string
  createdAt: string
}

// Data for generating random vending transactions
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

const meterNumbers = [
  "04123456789",
  "04198765432",
  "04211223344",
  "04255667788",
  "04399887766",
  "04366554433",
  "04412398765",
  "04445612378",
  "04578945612",
  "04532165498",
]

const serviceCenters = [
  "Ikeja Service Center",
  "Victoria Island SC",
  "Garki Central",
  "Maitama District",
  "Kano Main",
  "Port Harcourt East",
  "Ibadan North",
  "Benin City",
  "Asaba Metro",
  "Kaduna Central",
]

const areaOffices = ["Ikeja Area", "Victoria Island", "Garki", "Maitama", "Kano Central", "Port Harcourt"]

const vendorNames = [
  "Vendor One Ltd",
  "QuickVend Services",
  "PowerVend NG",
  "EasyVend Solutions",
  "SwiftVend Limited",
  "Reliable Vendors Inc",
  "PrimeVend Services",
  "CityVend Limited",
  "MetroVend Solutions",
  "SmartVend NG",
]

const tariffs = ["R2", "C1", "A1", "B1", "D1", "R3", "C2", "A2"]

// Generate random vending transactions
const generateRandomVendingTransactions = (count: number): VendingTransaction[] => {
  return Array.from({ length: count }, (_, index) => {
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)] || "Unknown Customer"
    const meterNumber = meterNumbers[Math.floor(Math.random() * meterNumbers.length)] || "Unknown Meter"
    const serviceCenter = serviceCenters[Math.floor(Math.random() * serviceCenters.length)] || "Unknown SC"
    const areaOffice = areaOffices[Math.floor(Math.random() * areaOffices.length)] || "Unknown Area"
    const vendorName = vendorNames[Math.floor(Math.random() * vendorNames.length)] || "Unknown Vendor"
    const tariff = tariffs[Math.floor(Math.random() * tariffs.length)] || "Unknown Tariff"

    const statusList = [VendingStatus.Successful, VendingStatus.Failed, VendingStatus.Pending, VendingStatus.Reversed]
    const randomStatusIndex = Math.floor(Math.random() * statusList.length)
    const status = statusList[randomStatusIndex] ?? VendingStatus.Successful

    const channel = [
      VendingChannel.MobileApp,
      VendingChannel.USSD,
      VendingChannel.VendorPOS,
      VendingChannel.WebPortal,
      VendingChannel.AgentPOS,
      VendingChannel.BankTransfer,
    ][Math.floor(Math.random() * 6)]

    const tokenTypeList = [TokenType.Standard, TokenType.Emergency, TokenType.Bonus, TokenType.Free]
    const randomTokenTypeIndex = Math.floor(Math.random() * tokenTypeList.length)
    const tokenType = tokenTypeList[randomTokenTypeIndex] ?? TokenType.Standard

    // Generate random date within the last 90 days
    const randomDaysAgo = Math.floor(Math.random() * 90)
    const vendDate = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000)
    const expiryDate = new Date(vendDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days from vend date

    // Generate random token
    const token = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16))
      .join("")
      .toUpperCase()

    const amount = Math.floor(Math.random() * 50000) + 500
    const unitsPurchased = Math.floor(amount / (Math.random() * 50 + 20)) // Rough calculation based on amount
    const transactionFee = Math.floor(amount * 0.015) // 1.5% transaction fee

    return {
      id: 5000 + index,
      reference: `VEND-${String(5000 + index).padStart(6, "0")}`,
      customerName: customerName,
      customerAccountNumber: `ACC${String(Math.floor(Math.random() * 1000000)).padStart(8, "0")}`,
      meterNumber: meterNumber,
      amount: amount,
      unitsPurchased: unitsPurchased,
      token: token,
      tokenType: tokenType,
      channel: channel ?? VendingChannel.MobileApp,
      status: status,
      vendDate: vendDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      tariff: tariff,
      serviceCenter: serviceCenter,
      areaOffice: areaOffice,
      vendorName: vendorName,
      vendorCode: `VEND${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      transactionFee: transactionFee,
      receiptNumber: `RCPT-${String(Math.floor(Math.random() * 100000)).padStart(6, "0")}`,
      createdAt: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
    }
  })
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

      {/* Customer Info Skeleton */}
      <div className="my-4 rounded-lg bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 rounded bg-gray-200"></div>
              <div className="h-6 w-32 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(12)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(12)].map((_, cellIndex) => (
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

interface CustomerVendingProps {
  customerId?: string
  customerName?: string
  accountNumber?: string
  meterNumber?: string
}

const CustomerVending: React.FC<CustomerVendingProps> = ({
  customerId = "CUST001",
  customerName = "John Smith",
  accountNumber = "ACC00123456",
  meterNumber = "04123456789",
}) => {
  const router = useRouter()

  const [transactions, setTransactions] = useState<VendingTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
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
    tokenType: "",
  })

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: VendingStatus.Successful, label: "Successful" },
    { value: VendingStatus.Failed, label: "Failed" },
    { value: VendingStatus.Pending, label: "Pending" },
    { value: VendingStatus.Reversed, label: "Reversed" },
  ]

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: VendingChannel.MobileApp, label: "Mobile App" },
    { value: VendingChannel.USSD, label: "USSD" },
    { value: VendingChannel.VendorPOS, label: "Vendor POS" },
    { value: VendingChannel.WebPortal, label: "Web Portal" },
    { value: VendingChannel.AgentPOS, label: "Agent POS" },
    { value: VendingChannel.BankTransfer, label: "Bank Transfer" },
  ]

  const tokenTypeOptions = [
    { value: "", label: "All Token Types" },
    { value: TokenType.Standard, label: "Standard" },
    { value: TokenType.Emergency, label: "Emergency" },
    { value: TokenType.Bonus, label: "Bonus" },
    { value: TokenType.Free, label: "Free" },
  ]

  // Get pagination values from state
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize
  const totalRecords = pagination.totalCount
  const totalPages = pagination.totalPages

  // Fetch vending transactions on component mount and when search/pagination/filters change
  useEffect(() => {
    const fetchVendingTransactions = () => {
      setLoading(true)
      setError(null)

      // Simulate API delay
      setTimeout(() => {
        try {
          // Generate transactions based on current page and page size
          const generatedTransactions = generateRandomVendingTransactions(pageSize)

          // Apply search filter if any
          let filteredTransactions = generatedTransactions
          if (searchText.trim()) {
            const searchTerm = searchText.toLowerCase()
            filteredTransactions = generatedTransactions.filter(
              (transaction) =>
                transaction.reference.toLowerCase().includes(searchTerm) ||
                transaction.token.toLowerCase().includes(searchTerm) ||
                transaction.receiptNumber.toLowerCase().includes(searchTerm) ||
                transaction.vendorName.toLowerCase().includes(searchTerm)
            )
          }

          // Apply status filter if any
          if (filters.status) {
            filteredTransactions = filteredTransactions.filter((transaction) => transaction.status === filters.status)
          }

          // Apply channel filter if any
          if (filters.channel) {
            filteredTransactions = filteredTransactions.filter((transaction) => transaction.channel === filters.channel)
          }

          // Apply token type filter if any
          if (filters.tokenType) {
            filteredTransactions = filteredTransactions.filter(
              (transaction) => transaction.tokenType === filters.tokenType
            )
          }

          setTransactions(filteredTransactions)

          // Update pagination info
          const totalCount = 50 // Mock total count
          const totalPages = Math.ceil(totalCount / pageSize)
          setPagination((prev) => ({
            ...prev,
            totalPages,
            totalCount,
          }))
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load vending transactions")
        } finally {
          setLoading(false)
        }
      }, 500) // Simulate network delay
    }

    fetchVendingTransactions()
  }, [currentPage, pageSize, searchText, filters])

  const getStatusStyle = (status: VendingStatus) => {
    switch (status) {
      case VendingStatus.Successful:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          icon: "✓",
        }
      case VendingStatus.Failed:
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          icon: "✗",
        }
      case VendingStatus.Pending:
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          icon: "⏳",
        }
      case VendingStatus.Reversed:
        return {
          backgroundColor: "#EFF6FF",
          color: "#3B82F6",
          icon: "↩️",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          icon: "?",
        }
    }
  }

  const getChannelStyle = (channel: VendingChannel) => {
    switch (channel) {
      case VendingChannel.MobileApp:
        return {
          backgroundColor: "#F3E8FF",
          color: "#7C3AED",
          icon: <FiSmartphone className="mr-1 inline" />,
        }
      case VendingChannel.USSD:
        return {
          backgroundColor: "#E0F2FE",
          color: "#0284C7",
          icon: "*#",
        }
      case VendingChannel.VendorPOS:
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
          icon: <HiOutlineCash className="mr-1 inline" />,
        }
      case VendingChannel.WebPortal:
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
          icon: "🌐",
        }
      case VendingChannel.AgentPOS:
        return {
          backgroundColor: "#FCE7F3",
          color: "#DB2777",
          icon: <MdOutlineReceipt className="mr-1 inline" />,
        }
      case VendingChannel.BankTransfer:
        return {
          backgroundColor: "#FFEDD5",
          color: "#EA580C",
          icon: "🏦",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          icon: "?",
        }
    }
  }

  const getTokenTypeStyle = (tokenType: TokenType) => {
    switch (tokenType) {
      case TokenType.Standard:
        return {
          backgroundColor: "#F0F9FF",
          color: "#0C4A6E",
          icon: <BsLightningCharge className="mr-1 inline" />,
        }
      case TokenType.Emergency:
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
          icon: "🚨",
        }
      case TokenType.Bonus:
        return {
          backgroundColor: "#F3E8FF",
          color: "#5B21B6",
          icon: "🎁",
        }
      case TokenType.Free:
        return {
          backgroundColor: "#F0FDF4",
          color: "#166534",
          icon: "🎉",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          icon: "?",
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

  const formatToken = (token: string) => {
    // Format token in groups of 4 for better readability
    return token.match(/.{1,4}/g)?.join(" ") || token
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    // Reset to first page when clearing search
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
    // Reset to first page when filtering
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleSelectFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name as keyof typeof filters
    const value = String(e.target.value)
    handleFilterChange(name, value)
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      channel: "",
      tokenType: "",
    })
    setSearchText("")
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const paginate = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }))
  }

  const handleViewTokenDetails = (transaction: VendingTransaction) => {
    // Navigate to token details page
    router.push(`/customers/vending/token-details/${transaction.id}`)
  }

  const handleDownloadReceipt = (transaction: VendingTransaction) => {
    // Simulate receipt download
    console.log("Downloading receipt for:", transaction.receiptNumber)
    // In a real app, this would trigger a download
    alert(`Receipt ${transaction.receiptNumber} download started`)
  }

  // Calculate summary statistics
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalUnits = transactions.reduce((sum, transaction) => sum + transaction.unitsPurchased, 0)
  const successfulTransactions = transactions.filter((t) => t.status === VendingStatus.Successful).length
  const averageTransaction = transactions.length > 0 ? totalAmount / transactions.length : 0

  if (loading) return <LoadingSkeleton />

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Customer Information Header */}

      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Vending Transactions</p>
          <p className="text-sm text-gray-600">History of all electricity token purchases</p>
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
            name="tokenType"
            value={filters.tokenType}
            onChange={handleSelectFilter}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[#004B23] focus:outline-none focus:ring-1 focus:ring-[#004B23]"
          >
            {tokenTypeOptions.map((option) => (
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
            placeholder="Search by reference, token, or receipt..."
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

        {(filters.status || filters.channel || filters.tokenType || searchText) && (
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
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
          <p>Error loading vending transactions: {error}</p>
        </div>
      )}

      {transactions.length === 0 ? (
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
            {searchText || filters.status || filters.channel || filters.tokenType
              ? "No matching transactions found"
              : "No vending transactions available"}
          </motion.p>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {searchText || filters.status || filters.channel || filters.tokenType
              ? "Try adjusting your search or filters"
              : "Vending transactions will appear here once purchases are made"}
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
                    onClick={() => toggleSort("unitsPurchased")}
                  >
                    <div className="flex items-center gap-2">
                      Units <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">Token</th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("tokenType")}
                  >
                    <div className="flex items-center gap-2">
                      Token Type <RxCaretSort />
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
                    onClick={() => toggleSort("vendDate")}
                  >
                    <div className="flex items-center gap-2">
                      Vending Date <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">Expiry Date</th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">Tariff</th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">Vendor</th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {transactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                        {transaction.reference}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-semibold">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="font-medium">{transaction.unitsPurchased.toLocaleString()} kWh</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 font-mono text-sm ">
                        <code className="rounded bg-gray-100 px-2 py-1">{formatToken(transaction.token)}</code>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getTokenTypeStyle(transaction.tokenType)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {getTokenTypeStyle(transaction.tokenType).icon}
                          {transaction.tokenType}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getChannelStyle(transaction.channel)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {getChannelStyle(transaction.channel).icon}
                          {transaction.channel.replace("_", " ")}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getStatusStyle(transaction.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span>{getStatusStyle(transaction.status).icon}</span>
                          {transaction.status}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {formatDate(transaction.vendDate)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {formatDate(transaction.expiryDate)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{transaction.tariff}</span>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="text-xs font-medium">{transaction.vendorName}</div>
                          <div className="text-xs text-gray-500">{transaction.vendorCode}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleViewTokenDetails(transaction)}
                            className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View
                          </motion.button>
                          <motion.button
                            onClick={() => handleDownloadReceipt(transaction)}
                            className="rounded-md bg-green-50 px-3 py-1 text-xs text-green-700 hover:bg-green-100"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Receipt
                          </motion.button>
                        </div>
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
              {totalRecords} transactions
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

export default CustomerVending
