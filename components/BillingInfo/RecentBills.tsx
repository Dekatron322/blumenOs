"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { VscEye } from "react-icons/vsc"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { ButtonModule } from "components/ui/Button/Button"
import BillDetailsModal from "components/ui/Modal/bill-details-modal"
import { BillsIcon, BillsIdIcon, CategoryIcon, CycleIcon, DateIcon, RevenueGeneratedIcon } from "components/Icons/Icons"
import PdfFile from "public/pdf-file"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchPostpaidBills, PostpaidBill } from "lib/redux/postpaidSlice"

interface RecentBillsProps {
  onExport?: () => void
  onGenerateBills?: () => void
  onViewDetails?: (bill: PostpaidBill) => void
}

// Responsive Skeleton Components
const BillCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4"
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
    <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
      <div className="flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="h-5 w-32 rounded bg-gray-200 sm:w-40"></div>
          <div className="h-6 w-20 rounded-full bg-gray-200"></div>
          <div className="h-6 w-16 rounded-full bg-gray-200"></div>
        </div>
        <div className="space-y-1">
          <div className="h-4 w-40 rounded bg-gray-200 sm:w-48"></div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full bg-gray-200"></div>
            <div className="h-3 w-56 rounded bg-gray-200 sm:w-64"></div>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
        <div className="space-y-1 text-right">
          <div className="h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-3 w-24 rounded bg-gray-200"></div>
        </div>
        <div className="h-8 w-24 rounded-md border border-gray-200 bg-white"></div>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200 sm:size-5"></div>
          <div className="space-y-1">
            <div className="h-3 w-16 rounded bg-gray-200 sm:w-20"></div>
            <div className="h-4 w-12 rounded bg-gray-200 sm:w-16"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const MobileBillCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3"
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
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-5 w-16 rounded-full bg-gray-200"></div>
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-3 w-32 rounded bg-gray-200"></div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded-full bg-gray-200"></div>
            <div className="h-3 w-40 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
      <div className="ml-2 flex flex-col items-end gap-1">
        <div className="space-y-1 text-right">
          <div className="h-3 w-24 rounded bg-gray-200"></div>
          <div className="h-2 w-20 rounded bg-gray-200"></div>
        </div>
        <div className="h-7 w-20 rounded-md border border-gray-200 bg-white"></div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-gray-200"></div>
          <div className="space-y-1">
            <div className="h-2 w-12 rounded bg-gray-200"></div>
            <div className="h-3 w-8 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
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
    <div className="h-7 w-32 rounded bg-gray-200 sm:w-40"></div>
    <div className="flex gap-2">
      <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
      <div className="h-9 w-28 rounded bg-gray-200 sm:w-32"></div>
    </div>
  </motion.div>
)

const SearchSkeleton = () => (
  <motion.div
    className="mb-6 h-12 w-full rounded-lg bg-gray-200 sm:w-96"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  ></motion.div>
)

const RecentBills: React.FC<RecentBillsProps> = ({ onExport, onGenerateBills, onViewDetails }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { bills, loading, error, pagination } = useAppSelector((state) => state.postpaidBilling)

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBill, setSelectedBill] = useState<PostpaidBill | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    void dispatch(
      fetchPostpaidBills({
        pageNumber: currentPage,
        pageSize: pagination.pageSize,
      })
    )
  }, [dispatch, currentPage, pagination.pageSize])

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleViewDetails = (bill: PostpaidBill) => {
    // Navigate to the bill details page
    router.push(`/billing/bills/${bill.id}`)
    onViewDetails?.(bill)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBill(null)
  }

  const formatAmount = (amount: number) => {
    if (isMobileView) {
      // Compact format for mobile
      if (amount >= 1000000) {
        return `₦${(amount / 1000000).toFixed(1)}M`
      } else if (amount >= 1000) {
        return `₦${(amount / 1000).toFixed(1)}K`
      }
      return `₦${amount.toLocaleString()}`
    }

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const mapStatusToLabel = (status: number): "generated" | "pending" | "approved" => {
    switch (status) {
      case 0:
        return "pending"
      case 1:
        return "generated"
      case 2:
        return "approved"
      default:
        return "pending"
    }
  }

  const filteredBills = bills.filter((bill) => {
    if (!searchText.trim()) return true
    const query = searchText.toLowerCase()
    return (
      bill.customerName.toLowerCase().includes(query) ||
      bill.customerAccountNumber.toLowerCase().includes(query) ||
      bill.id.toString().toLowerCase().includes(query)
    )
  })

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    void dispatch(
      fetchPostpaidBills({
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

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
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
    const current = currentPage
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

  const getStatusColor = (status: "generated" | "pending" | "approved") => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "generated":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isMobileView) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const BillCard = ({ bill }: { bill: PostpaidBill }) => {
    const statusLabel = mapStatusToLabel(bill.status)
    return (
      <motion.div
        key={bill.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 hover:shadow-sm sm:p-4"
        whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{bill.customerName}</h4>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(statusLabel)}`}>
                {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                Cat {bill.category}
              </span>
            </div>

            <p className="text-sm font-medium text-gray-900 sm:text-base">{bill.customerAccountNumber}</p>
            <div className="mt-1 flex items-center gap-2">
              <DateIcon />
              <p className="text-xs text-gray-600 sm:text-sm">Due: {formatDate(bill.dueDate ?? bill.period)}</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
            <div className="text-right text-xs sm:text-sm">
              <p className="font-semibold text-gray-900">{formatAmount(bill.currentBillAmount)}</p>
              <p className="text-gray-500">{bill.consumptionKwh.toLocaleString()} kWh</p>
            </div>
            <ButtonModule
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(bill)}
              icon={<VscEye className="size-3 sm:size-4" />}
              iconPosition="start"
              className="mt-1 bg-white text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </ButtonModule>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 text-xs sm:gap-4 sm:text-sm">
          <div className="flex items-center gap-2">
            <BillsIdIcon />
            <div>
              <p className="text-gray-500">Bill ID</p>
              <p className="font-medium text-gray-900">{bill.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CategoryIcon />
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium text-gray-900">Cat {bill.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CycleIcon />
            <div>
              <p className="text-gray-500">Status</p>
              <p
                className={`font-medium ${
                  statusLabel === "approved"
                    ? "text-green-600"
                    : statusLabel === "generated"
                    ? "text-blue-600"
                    : "text-yellow-600"
                }`}
              >
                {isMobileView
                  ? statusLabel.charAt(0).toUpperCase()
                  : statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RevenueGeneratedIcon />
            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-medium text-gray-900">{formatAmount(bill.currentBillAmount)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const MobileBillCard = ({ bill }: { bill: PostpaidBill }) => {
    const statusLabel = mapStatusToLabel(bill.status)
    return (
      <motion.div
        key={bill.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 hover:shadow-sm"
        whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900">{bill.customerName}</h4>
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${getStatusColor(statusLabel)}`}>
                {statusLabel.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="mt-1 space-y-1">
              <p className="text-xs font-medium text-gray-900">{bill.customerAccountNumber}</p>
              <div className="flex items-center gap-1">
                <DateIcon />
                <p className="text-xs text-gray-600">Due: {formatDate(bill.dueDate ?? bill.period)}</p>
              </div>
            </div>
          </div>
          <div className="ml-2 flex flex-col items-end gap-1">
            <div className="text-right text-xs">
              <p className="font-semibold text-gray-900">{formatAmount(bill.currentBillAmount)}</p>
              <p className="text-gray-500">{bill.consumptionKwh.toLocaleString()} kWh</p>
            </div>
            <ButtonModule
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(bill)}
              icon={<VscEye />}
              iconPosition="start"
              className="bg-white text-xs"
            >
              View
            </ButtonModule>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
          <div className="flex items-center gap-1">
            <BillsIdIcon />
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-medium text-gray-900">{bill.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CategoryIcon />
            <div>
              <p className="text-gray-500">Cat</p>
              <p className="font-medium text-gray-900">{bill.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CycleIcon />
            <div>
              <p className="text-gray-500">Status</p>
              <p
                className={`font-medium ${
                  statusLabel === "approved"
                    ? "text-green-600"
                    : statusLabel === "generated"
                    ? "text-blue-600"
                    : "text-yellow-600"
                }`}
              >
                {statusLabel.charAt(0).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <RevenueGeneratedIcon />
            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-medium text-gray-900">{formatAmount(bill.currentBillAmount)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold sm:text-xl">Recent Bills</h3>
            <div className="flex gap-2">
              <ButtonModule
                icon={<PdfFile />}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
                onClick={onExport}
              >
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </ButtonModule>
              <ButtonModule variant="primary" size="sm" className="text-xs sm:text-sm" onClick={onGenerateBills}>
                <span className="hidden sm:inline">Generate Bills</span>
                <span className="sm:hidden">Generate</span>
              </ButtonModule>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 sm:mb-6">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search bills..."
              className="w-full sm:w-96"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-3 sm:space-y-4">
              {isMobileView ? (
                <>
                  <MobileBillCardSkeleton />
                  <MobileBillCardSkeleton />
                  <MobileBillCardSkeleton />
                </>
              ) : (
                <>
                  <BillCardSkeleton />
                  <BillCardSkeleton />
                  <BillCardSkeleton />
                </>
              )}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-lg bg-red-50 p-3 sm:p-4">
              <p className="text-xs text-red-600 sm:text-sm">Error loading bills: {error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredBills.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 sm:size-16">
                  <BillsIcon />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No Bills Found</h3>
                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                  {searchText.trim() ? "Try adjusting your search criteria" : "No bills available"}
                </p>
              </div>
            </div>
          )}

          {/* Bills List */}
          {!loading && !error && filteredBills.length > 0 && (
            <>
              <div className="space-y-3 sm:space-y-4">
                {filteredBills.map((bill) =>
                  isMobileView ? <MobileBillCard key={bill.id} bill={bill} /> : <BillCard key={bill.id} bill={bill} />
                )}
              </div>

              {/* Pagination */}
              <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                <div className="flex items-center gap-1 max-sm:hidden">
                  <p className="text-xs sm:text-sm">Show rows</p>
                  <select
                    value={pagination.pageSize}
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
                      currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                    }`}
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
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

                    <div className="flex items-center gap-1 sm:hidden">
                      {getMobilePageItems().map((item, index) =>
                        typeof item === "number" ? (
                          <button
                            key={item}
                            className={`flex h-6 w-6 items-center justify-center rounded-md text-xs ${
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
                    className={`px-2 py-1 sm:px-3 sm:py-2 ${
                      currentPage === totalPages || totalPages === 0
                        ? "cursor-not-allowed text-gray-400"
                        : "text-[#000000]"
                    }`}
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <BiSolidRightArrow className="size-4 sm:size-5" />
                  </button>
                </div>

                <p className="text-center text-xs text-gray-600 sm:text-right sm:text-sm">
                  Page {currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()} total bills)
                  {searchText.trim() && " - filtered"}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Bill Details Modal */}
      {/* <BillDetailsModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        bill={selectedBill}
      /> */}
    </>
  )
}

export default RecentBills
