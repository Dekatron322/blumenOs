"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearBills,
  fetchPostpaidBills,
  type PostpaidBill,
  PostpaidBillsRequestParams,
  setPagination,
} from "lib/redux/postpaidSlice"
import PostpaidBillDetailsModal from "components/ui/Modal/postpaid-bill-modal"
import { ButtonModule } from "components/ui/Button/Button"
import EmptySearchState from "components/ui/EmptySearchState"
import { SearchModule } from "components/ui/Search/search-module"

// Status configuration
const getStatusConfig = (status: number) => {
  const configs = {
    0: {
      label: "Draft",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: <Clock className="size-3.5 text-gray-600" />,
    },
    1: {
      label: "Published",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle className="size-3.5 text-emerald-600" />,
    },
    2: {
      label: "Reversed",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="size-3.5 text-red-600" />,
    },
  }
  return configs[status as keyof typeof configs] || configs[0]
}

// Category configuration
const getCategoryConfig = (category: number) => {
  const configs = {
    1: { label: "Residential", badge: "bg-blue-50 text-blue-700" },
    2: { label: "Commercial", badge: "bg-purple-50 text-purple-700" },
  }
  return configs[category as keyof typeof configs] || configs[1]
}

// Status filter options
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "0", label: "Draft" },
  { value: "1", label: "Published" },
  { value: "2", label: "Reversed" },
]

// Category filter options
const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
]

// Formatting utilities
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  } catch {
    return "—"
  }
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (typeof amount !== "number") return "₦0"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatNumber = (value: number | null | undefined): string => {
  if (typeof value !== "number") return "0"
  return value.toLocaleString()
}

// Skeleton Components
const TableRowSkeleton = () => (
  <motion.tr
    className="border-b border-gray-100 bg-white"
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
    <td className="p-2">
      <div className="space-y-1">
        <div className="h-3 w-24 rounded bg-gray-200"></div>
        <div className="h-2.5 w-20 rounded bg-gray-200"></div>
      </div>
    </td>
    <td className="p-2">
      <div className="h-5 w-16 rounded-full bg-gray-200"></div>
    </td>
    <td className="p-2">
      <div className="h-5 w-20 rounded-full bg-gray-200"></div>
    </td>
    <td className="p-2">
      <div className="space-y-1">
        <div className="h-2.5 w-20 rounded bg-gray-200"></div>
        <div className="h-2.5 w-16 rounded bg-gray-200"></div>
      </div>
    </td>
    <td className="p-2">
      <div className="h-5 w-20 rounded bg-gray-200"></div>
    </td>
    <td className="p-2">
      <div className="h-5 w-16 rounded bg-gray-200"></div>
    </td>
    <td className="p-2">
      <div className="h-5 w-12 rounded bg-gray-200"></div>
    </td>
    <td className="p-2">
      <div className="flex justify-end gap-1">
        <div className="h-6 w-12 rounded bg-gray-200"></div>
      </div>
    </td>
  </motion.tr>
)

const TableHeaderSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        <div className="h-10 w-32 rounded bg-gray-200"></div>
        <div className="size-10 rounded bg-gray-200"></div>
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-10 w-64 rounded bg-gray-200"></div>
      <div className="h-10 w-32 rounded bg-gray-200"></div>
      <div className="h-10 w-32 rounded bg-gray-200"></div>
    </div>
  </div>
)

const PaginationSkeleton = () => (
  <div className="mt-4 flex items-center justify-between">
    <div className="h-8 w-32 rounded bg-gray-200"></div>
    <div className="flex gap-2">
      <div className="h-8 w-20 rounded bg-gray-200"></div>
      <div className="h-8 w-20 rounded bg-gray-200"></div>
    </div>
    <div className="h-8 w-40 rounded bg-gray-200"></div>
  </div>
)

interface PostpaidBillingTabProps {
  customerId: number
}

const PostpaidBillingTab: React.FC<PostpaidBillingTabProps> = ({ customerId }) => {
  const dispatch = useAppDispatch()
  const { bills, loading, error, pagination } = useAppSelector((state) => state.postpaidBilling)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<PostpaidBill | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch postpaid bills
  useEffect(() => {
    const params: PostpaidBillsRequestParams = {
      pageNumber: currentPage,
      pageSize: pagination.pageSize,
      customerId: customerId,
      ...(selectedStatus && { status: parseInt(selectedStatus) }),
      ...(selectedCategory && { category: parseInt(selectedCategory) }),
      ...(searchText && { accountNumber: searchText }),
    }

    dispatch(fetchPostpaidBills(params))
  }, [dispatch, customerId, currentPage, pagination.pageSize, selectedStatus, selectedCategory, searchText])

  // Sync local search input
  useEffect(() => {
    setSearchInput(searchText)
  }, [searchText])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearBills())
    }
  }, [dispatch])

  const handleViewDetails = (bill: PostpaidBill) => {
    setSelectedBill(bill)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleRefresh = () => {
    const params: PostpaidBillsRequestParams = {
      pageNumber: currentPage,
      pageSize: pagination.pageSize,
      customerId: customerId,
      ...(selectedStatus && { status: parseInt(selectedStatus) }),
      ...(selectedCategory && { category: parseInt(selectedCategory) }),
      ...(searchText && { accountNumber: searchText }),
    }
    dispatch(fetchPostpaidBills(params))
  }

  // Search handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate && trimmed !== searchText) {
      setSearchText(trimmed)
      setCurrentPage(1)
    }
  }

  const handleCancelSearch = () => {
    setSearchInput("")
    setSearchText("")
    setCurrentPage(1)
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(setPagination({ page: currentPage, pageSize: newPageSize }))
    setCurrentPage(1)
  }

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Loading state
  if (loading && bills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <TableHeaderSkeleton />

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Bill Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Period
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Consumption
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[...Array(5)].map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>

        <PaginationSkeleton />
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Header with title and actions */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Postpaid Bills</h2>
            <p className="text-xs text-gray-500">{totalRecords} bill(s) found</p>
          </div>

          <div className="flex items-center gap-2">
            <ButtonModule
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="border-gray-300 bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </ButtonModule>

            <ButtonModule
              variant="outline"
              size="sm"
              onClick={() => {
                /* TODO: Implement CSV export */
              }}
              disabled={!bills || bills.length === 0}
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Download className="mr-2 size-4" />
              Export CSV
            </ButtonModule>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-r from-green-50/60 to-white p-4 shadow-sm">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">Search Bills</p>
            <h4 className="text-sm font-medium text-gray-900">Find bill records</h4>
            <p className="text-xs text-gray-600">Search by account number, bill reference, or customer details.</p>
          </div>
          <SearchModule
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onCancel={handleCancelSearch}
            onSearch={handleManualSearch}
            placeholder="Type account number, bill reference, or customer details..."
            height="h-12"
            className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm [&_button]:min-h-[32px] [&_button]:px-4 [&_button]:text-xs [&_input]:text-xs sm:[&_input]:text-sm"
          />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
            >
              <Filter className="size-3.5" />
              {statusOptions.find((opt) => opt.value === selectedStatus)?.label || "Status"}
            </button>
            {isStatusOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`flex w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
                      selectedStatus === option.value ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedStatus(option.value)
                      setIsStatusOpen(false)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <Filter className="size-3.5" />
              {categoryOptions.find((opt) => opt.value === selectedCategory)?.label || "Category"}
            </button>
            {isCategoryOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`flex w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
                      selectedCategory === option.value ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedCategory(option.value)
                      setIsCategoryOpen(false)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active filters indicator */}
          {(selectedStatus || selectedCategory || searchText) && (
            <button
              onClick={() => {
                setSelectedStatus("")
                setSelectedCategory("")
                setSearchText("")
              }}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="size-4" />
              <p className="text-xs font-medium">Error loading bills: {error}</p>
            </div>
          </div>
        )}

        {/* Bills table */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="size-5 text-red-600" />
            </div>
            <h3 className="mt-3 text-sm font-medium text-gray-900">Failed to load bills</h3>
            <p className="mt-1 text-xs text-gray-500">{error}</p>
            <ButtonModule variant="outline" size="sm" onClick={handleRefresh} className="mt-3">
              <RefreshCw className="mr-2 size-3.5" />
              Try again
            </ButtonModule>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
              <FileText className="size-5 text-gray-400" />
            </div>
            <h3 className="mt-3 text-sm font-medium text-gray-900">No bills found</h3>
            <EmptySearchState
              title={
                searchText || selectedStatus || selectedCategory
                  ? "Try adjusting your filters"
                  : "No postpaid bills available for this customer"
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Bill Details
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Period
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Consumption
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {bills.map((bill: PostpaidBill) => {
                  const statusConfig = getStatusConfig(bill.status)
                  const categoryConfig = getCategoryConfig(bill.category)
                  const hasDisputes = bill.openDisputeCount > 0

                  return (
                    <tr key={bill.id} className="transition-colors hover:bg-gray-50">
                      <td className="p-2">
                        <div className="max-w-xs">
                          <p className="truncate text-xs font-medium text-gray-900">{bill.name}</p>
                          <p className="text-xs text-gray-500">Acc: {bill.customerAccountNumber}</p>
                          {hasDisputes && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                              <AlertCircle className="size-2.5" />
                              <span>{bill.openDisputeCount} dispute(s)</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap p-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap p-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${categoryConfig.badge}`}
                        >
                          {categoryConfig.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap p-2 text-xs text-gray-700">{bill.period}</td>

                      <td className="whitespace-nowrap p-2">
                        <div>
                          <p className="text-xs font-medium text-gray-900">{formatCurrency(bill.totalDue)}</p>
                          <p className="text-xs text-gray-500">Bill: {formatCurrency(bill.currentBillAmount)}</p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap p-2 text-xs text-gray-700">
                        {formatNumber(bill.consumptionKwh)} kWh
                      </td>

                      <td className="whitespace-nowrap p-2 text-xs text-gray-500">{formatDate(bill.createdAt)}</td>

                      <td className="p-2">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleViewDetails(bill)}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <Eye className="size-3" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {bills.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700">Show rows</span>
              <select
                value={pagination.pageSize}
                onChange={handleRowsChange}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ButtonModule
                variant="outline"
                size="sm"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-gray-300"
              >
                Previous
              </ButtonModule>

              <span className="text-xs text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <ButtonModule
                variant="outline"
                size="sm"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-gray-300"
              >
                Next
              </ButtonModule>
            </div>

            <div className="text-xs text-gray-500">Total records: {formatNumber(totalRecords)}</div>
          </div>
        )}

        {/* Details Modal */}
        <PostpaidBillDetailsModal isOpen={isModalOpen} onRequestClose={handleCloseModal} bill={selectedBill} />
      </motion.div>
    </>
  )
}

export default PostpaidBillingTab
