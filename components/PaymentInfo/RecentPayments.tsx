import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPayments, Payment } from "lib/redux/paymentSlice"
import { ChevronDown } from "lucide-react"
import { ExportCsvIcon } from "components/Icons/Icons"

type SortOrder = "asc" | "desc" | null

// Skeleton Components
const PaymentCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-4 shadow-sm"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-gray-200"></div>
        <div>
          <div className="h-5 w-32 rounded bg-gray-200"></div>
          <div className="mt-1 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-gray-200"></div>
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
      <div className="size-6 rounded bg-gray-200"></div>
    </div>

    <div className="mt-4 space-y-2 text-sm">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-4 w-16 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>

    <div className="mt-3 border-t pt-3">
      <div className="h-4 w-full rounded bg-gray-200"></div>
    </div>

    <div className="mt-3 flex gap-2">
      <div className="h-9 flex-1 rounded bg-gray-200"></div>
    </div>
  </motion.div>
)

const PaymentListItemSkeleton = () => (
  <motion.div
    className="border-b bg-white p-4"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-gray-200"></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-5 w-40 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-gray-200"></div>
              <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="mt-2 h-4 w-64 rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded bg-gray-200"></div>
          <div className="size-6 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const StatCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-3"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-5 w-12 rounded bg-gray-200"></div>
        <div className="h-5 w-20 rounded bg-gray-200"></div>
      </div>
      <div className="h-4 w-16 rounded bg-gray-200"></div>
    </div>
    <div className="mt-3 space-y-1">
      <div className="flex justify-between">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </div>
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-4 flex items-center justify-between"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="flex items-center gap-2">
      <div className="h-4 w-16 rounded bg-gray-200"></div>
      <div className="h-8 w-16 rounded bg-gray-200"></div>
    </div>

    <div className="flex items-center gap-3">
      <div className="size-8 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-7 rounded bg-gray-200"></div>
        ))}
      </div>
      <div className="size-8 rounded bg-gray-200"></div>
    </div>

    <div className="h-4 w-24 rounded bg-gray-200"></div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="flex flex-col py-2"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    <div className="h-8 w-40 rounded bg-gray-200"></div>
    <div className="mt-2 flex gap-4">
      <div className="h-10 w-80 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

const RecentPayments = () => {
  const dispatch = useAppDispatch()
  const { payments, loading, error, pagination } = useAppSelector((state) => state.payments)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showStats, setShowStats] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()

  const statusOptions = ["All Status", "Confirmed", "Pending", "Failed", "Reversed"]
  const paymentMethods = ["Bank Transfer", "POS Agent", "Card Payment", "Cash", "Vendor Wallet"]

  // Fetch payments on component mount and when page changes
  useEffect(() => {
    dispatch(
      fetchPayments({
        pageNumber: currentPage,
        pageSize: pagination.pageSize || 6,
      })
    )
  }, [dispatch, currentPage, pagination.pageSize])

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-root="payment-actions"]')) {
        setActiveDropdown(null)
      }
      if (!target.closest('[data-dropdown-root="status-filter"]')) {
        setIsStatusOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Pending":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "Failed":
      case "Reversed":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F2F2F2", color: "#666666" }
    }
  }

  const getPaymentMethodStyle = (method: string) => {
    switch (method) {
      case "Bank Transfer":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "POS Agent":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      case "Card Payment":
        return { backgroundColor: "#F0F7ED", color: "#4BAF5E" }
      case "Cash":
        return { backgroundColor: "#FEF7ED", color: "#F4A261" }
      default:
        return { backgroundColor: "#F2F2F2", color: "#666666" }
    }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return { backgroundColor: "#589E67" }
      case "Pending":
        return { backgroundColor: "#D28E3D" }
      case "Failed":
      case "Reversed":
        return { backgroundColor: "#AF4B4B" }
      default:
        return { backgroundColor: "#666666" }
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  // Filter payments based on search text and status
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchText === "" ||
      payment.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.customerAccountNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchText.toLowerCase()) ||
      (payment.externalReference && payment.externalReference.toLowerCase().includes(searchText.toLowerCase()))

    const matchesStatus = selectedStatus === "" || selectedStatus === "All Status" || payment.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      fetchPayments({
        pageNumber: 1,
        pageSize: newPageSize,
      })
    )
    setCurrentPage(1)
  }

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleViewDetails = (payment: Payment) => {
    router.push(`/payment/payment-detail/${payment.id}`)
  }

  // Statistics calculations
  const successfulCount = payments.filter((p) => p.status === "Confirmed").length
  const pendingCount = payments.filter((p) => p.status === "Pending").length
  const failedCount = payments.filter((p) => p.status === "Failed" || p.status === "Reversed").length

  const today = new Date().toISOString().slice(0, 10)
  const todaysSuccessfulPayments = payments.filter((p) =>
    p.paidAtUtc ? p.paidAtUtc.slice(0, 10) === today && p.status === "Confirmed" : false
  )
  const todaysRevenue = todaysSuccessfulPayments.reduce((sum, p) => sum + p.amount, 0)

  const bankTransferCount = payments.filter((p) => p.channel === "BankTransfer").length
  const posCount = payments.filter((p) => p.channel === "Pos").length
  const cardCount = payments.filter((p) => p.channel === "Card").length

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
            <span className="font-semibold text-blue-600">
              {payment.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{payment.customerName}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div
                style={getStatusStyle(payment.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(payment.status)}></span>
                {payment.status.toUpperCase()}
              </div>
              <div style={getPaymentMethodStyle(payment.channel)} className="rounded-full px-2 py-1 text-xs">
                {payment.channel}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-medium">{formatCurrency(payment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Account:</span>
          <span className="font-medium">{payment.customerAccountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Reference:</span>
          <span className="font-medium">{payment.reference}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="font-medium">
            {payment.paidAtUtc ? new Date(payment.paidAtUtc).toLocaleDateString() : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Payment ID:</span>
          <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">{payment.id}</div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-500">{payment.externalReference || "No external reference"}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleViewDetails(payment)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#f9f9f9]"
        >
          <VscEye className="size-4" />
          View Details
        </button>
      </div>
    </div>
  )

  const PaymentListItem = ({ payment }: { payment: Payment }) => (
    <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {payment.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">{payment.customerName}</h3>
              <div
                style={getStatusStyle(payment.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(payment.status)}></span>
                {payment.status.toUpperCase()}
              </div>
              <div style={getPaymentMethodStyle(payment.channel)} className="rounded-full px-2 py-1 text-xs">
                {payment.channel}
              </div>
              <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">ID: {payment.id}</div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Amount:</strong> {formatCurrency(payment.amount)}
              </span>
              <span>
                <strong>Account:</strong> {payment.customerAccountNumber}
              </span>
              <span>
                <strong>Reference:</strong> {payment.reference}
              </span>
              <span>
                <strong>Date:</strong> {payment.paidAtUtc ? new Date(payment.paidAtUtc).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{payment.externalReference || "No external reference"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">{payment.customerAccountNumber}</div>
            <div className={`mt-1 text-xs ${payment.status === "Pending" ? "text-amber-600" : "text-gray-500"}`}>
              {payment.status === "Pending" ? "Awaiting Confirmation" : "Processed"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleViewDetails(payment)} className="button-oulined flex items-center gap-2">
              <VscEye className="size-4" />
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const StatCard = ({
    title,
    value,
    subtitle,
    color = "blue",
  }: {
    title: string
    value: string
    subtitle: string
    color?: string
  }) => (
    <div className="rounded-lg border bg-[#f9f9f9] p-3 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <div className="flex text-sm">
          <span className="font-medium">{value}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{subtitle}</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content Skeleton */}
        <div className={`rounded-md border bg-white p-5 ${showStats ? "flex-1" : "w-full"}`}>
          <HeaderSkeleton />

          {/* Payment Display Area Skeleton */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <PaymentCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {[...Array(5)].map((_, index) => (
                  <PaymentListItemSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          <PaginationSkeleton />
        </div>

        {/* Stats Sidebar Skeleton */}
        {showStats && (
          <div className="w-80 rounded-md border bg-white p-5">
            <div className="border-b pb-4">
              <div className="h-6 w-40 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-3">
              {[...Array(6)].map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>

            {/* Summary Stats Skeleton */}
            <div className="mt-6 rounded-lg bg-gray-50 p-3">
              <div className="mb-2 h-5 w-20 rounded bg-gray-200"></div>
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                    <div className="h-4 w-12 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-3 relative mt-5 flex items-start gap-6">
      {/* Main Content - Payments List/Grid */}
      <div className={`rounded-md border bg-white p-5 ${showStats ? "flex-1" : "w-full"}`}>
        <div className="flex flex-col py-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-2xl font-medium">Recent Payments</p>
            <button
              className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
              onClick={() => {
                /* Export functionality */
              }}
              disabled={!payments || payments.length === 0}
            >
              <ExportCsvIcon color="#2563EB" size={20} />
              <p className="text-sm text-[#2563EB]">Export CSV</p>
            </button>
          </div>
          <div className="mt-2 flex gap-4">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by customer, account, or reference"
              className="max-w-[300px]"
            />

            <div className="flex gap-2">
              <button
                className={`button-oulined ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <MdGridView />
                <p>Grid</p>
              </button>
              <button
                className={`button-oulined ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <MdFormatListBulleted />
                <p>List</p>
              </button>
            </div>

            <button className="button-oulined" onClick={() => setShowStats(!showStats)}>
              {showStats ? "Hide Stats" : "Show Stats"}
            </button>

            <div className="relative" data-dropdown-root="status-filter">
              <button
                type="button"
                className="button-oulined flex items-center gap-2"
                onClick={() => setIsStatusOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isStatusOpen}
              >
                <IoMdFunnel />
                <span>{selectedStatus || "All Status"}</span>
                <ChevronDown
                  className={`size-4 text-gray-500 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isStatusOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                          selectedStatus === status ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedStatus(status === "All Status" ? "" : status)
                          setIsStatusOpen(false)
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Display Area */}
        <div className="w-full">
          {filteredPayments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No payments found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {filteredPayments.map((payment) => (
                <PaymentListItem key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p>Show rows</p>
            <select value={pagination.pageSize || 6} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={18}>18</option>
              <option value={24}>24</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`px-3 py-2 ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"}`}
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <BiSolidLeftArrow />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`flex h-[27px] w-[30px] items-center justify-center rounded-md ${
                    currentPage === index + 1 ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                  }`}
                  onClick={() => changePage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              className={`px-3 py-2 ${
                currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
              }`}
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <BiSolidRightArrow />
            </button>
          </div>
          <p>
            Page {currentPage} of {totalPages} ({totalRecords} total records)
          </p>
        </div>
      </div>

      {/* Stats Sidebar */}
      <AnimatePresence initial={false}>
        {showStats && (
          <motion.div
            key="stats-sidebar"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="w-80 rounded-md border bg-white p-5"
          >
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment Statistics</h2>
            </div>

            <div className="mt-4 space-y-3">
              <StatCard
                title="Today's Revenue"
                value={formatCurrency(todaysRevenue)}
                subtitle="Confirmed payments today"
                color="green"
              />
              <StatCard
                title="Successful Payments"
                value={successfulCount.toString()}
                subtitle="Total confirmed"
                color="green"
              />
              <StatCard
                title="Pending Payments"
                value={pendingCount.toString()}
                subtitle="Awaiting confirmation"
                color="yellow"
              />
              <StatCard
                title="Failed Payments"
                value={failedCount.toString()}
                subtitle="Failed or reversed"
                color="red"
              />
              <StatCard
                title="Bank Transfers"
                value={bankTransferCount.toString()}
                subtitle="Total transactions"
                color="blue"
              />
              <StatCard title="POS Payments" value={posCount.toString()} subtitle="Agent transactions" color="purple" />
            </div>

            {/* Summary Stats */}
            <div className="mt-6 rounded-lg bg-gray-50 p-3">
              <h3 className="mb-2 font-medium text-gray-900">Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-medium">{totalRecords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">
                    {totalRecords > 0 ? Math.round((successfulCount / totalRecords) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Methods:</span>
                  <span className="font-medium">{paymentMethods.length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RecentPayments
