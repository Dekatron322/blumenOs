"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { ExportCsvIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearBills,
  fetchPostpaidBills,
  type PostpaidBill,
  PostpaidBillsRequestParams,
  setPagination,
} from "lib/redux/postpaidSlice"

// Status options for filtering (based on your API: 0, 1, 2)
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "0", label: "Pending" },
  { value: "1", label: "Paid" },
  { value: "2", label: "Overdue" },
]

// Category options for filtering (based on your API: 1, 2)
const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
]

// Postpaid Bill Card Component
const PostpaidBillCard = ({
  bill,
  onViewDetails,
}: {
  bill: PostpaidBill
  onViewDetails: (bill: PostpaidBill) => void
}) => {
  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "PENDING" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "PAID" },
      2: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "OVERDUE" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getCategoryConfig = (category: number) => {
    const configs = {
      1: { label: "Residential", color: "text-blue-600", bg: "bg-blue-50" },
      2: { label: "Commercial", color: "text-purple-600", bg: "bg-purple-50" },
    }
    return configs[category as keyof typeof configs] || configs[1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const statusConfig = getStatusConfig(bill.status)
  const categoryConfig = getCategoryConfig(bill.category)

  return (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
            <span className="font-semibold text-green-600">₦</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Bill #{bill.id}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                {statusConfig.label}
              </div>
              <div className={`rounded-full px-2 py-1 text-xs ${categoryConfig.bg} ${categoryConfig.color}`}>
                {categoryConfig.label}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{formatCurrency(bill.totalDue)}</div>
          <div className="text-sm text-gray-500">Period: {bill.period}</div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Account Number:</span>
          <span className="font-medium">{bill.customerAccountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Consumption:</span>
          <span className="font-medium">{bill.consumptionKwh} kWh</span>
        </div>
        <div className="flex justify-between">
          <span>Current Bill:</span>
          <span className="font-medium">{formatCurrency(bill.currentBillAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Area Office:</span>
          <span className="font-medium">{bill.areaOfficeName}</span>
        </div>
        <div className="flex justify-between">
          <span>Feeder:</span>
          <span className="font-medium">{bill.feederName}</span>
        </div>
        <div className="flex justify-between">
          <span>Created:</span>
          <span className="font-medium">{formatDate(bill.createdAt)}</span>
        </div>
      </div>

      {bill.openDisputeCount > 0 && (
        <div className="mt-3 rounded-md bg-yellow-50 p-2">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <AlertCircle className="size-4" />
            <span>{bill.openDisputeCount} open dispute(s)</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onViewDetails(bill)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#f9f9f9]"
        >
          <VscEye className="size-4" />
          View Details
        </button>
      </div>
    </div>
  )
}

// Postpaid Bill List Item Component
const PostpaidBillListItem = ({
  bill,
  onViewDetails,
}: {
  bill: PostpaidBill
  onViewDetails: (bill: PostpaidBill) => void
}) => {
  const getStatusConfig = (status: number) => {
    const configs = {
      0: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "PENDING" },
      1: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "PAID" },
      2: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "OVERDUE" },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getCategoryConfig = (category: number) => {
    const configs = {
      1: { label: "Residential", color: "text-blue-600", bg: "bg-blue-50" },
      2: { label: "Commercial", color: "text-purple-600", bg: "bg-purple-50" },
    }
    return configs[category as keyof typeof configs] || configs[1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const statusConfig = getStatusConfig(bill.status)
  const categoryConfig = getCategoryConfig(bill.category)

  return (
    <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
            <span className="text-sm font-semibold text-green-600">₦</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">Bill #{bill.id}</h3>
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
              >
                <span className={`size-2 rounded-full ${statusConfig.bg} ${statusConfig.border}`}></span>
                {statusConfig.label}
              </div>
              <div className={`rounded-full px-2 py-1 text-xs ${categoryConfig.bg} ${categoryConfig.color}`}>
                {categoryConfig.label}
              </div>
              <div className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                Period: {bill.period}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Account:</strong> {bill.customerAccountNumber}
              </span>
              <span>
                <strong>Consumption:</strong> {bill.consumptionKwh} kWh
              </span>
              <span>
                <strong>Area Office:</strong> {bill.areaOfficeName}
              </span>
              <span>
                <strong>Feeder:</strong> {bill.feederName}
              </span>
              <span>
                <strong>Created:</strong> {formatDate(bill.createdAt)}
              </span>
            </div>
            {bill.openDisputeCount > 0 && (
              <div className="mt-1 flex items-center gap-2 text-xs text-yellow-600">
                <AlertCircle className="size-3" />
                <span>{bill.openDisputeCount} open dispute(s)</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(bill.totalDue)}</div>
            <div className="text-sm text-gray-500">Total Due</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onViewDetails(bill)} className="button-oulined flex items-center gap-2">
              <VscEye className="size-4" />
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PostpaidBillingTabProps {
  customerId: number
}

const PostpaidBillingTab: React.FC<PostpaidBillingTabProps> = ({ customerId }) => {
  const dispatch = useAppDispatch()
  const { bills, loading, error, success, pagination } = useAppSelector((state) => state.postpaidBilling)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<PostpaidBill | null>(null)

  // Fetch postpaid bills for this customer
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearBills())
    }
  }, [dispatch])

  const handleViewDetails = (bill: PostpaidBill) => {
    setSelectedBill(bill)
    // You can implement a modal or navigate to bill details page
    console.log("View bill details:", bill)
  }

  const handleCancelSearch = () => {
    setSearchText("")
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

  // Loading skeleton
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">Postpaid Billing</h3>
        <div className="animate-pulse">
          <div className="mb-4 flex gap-4">
            <div className="h-10 w-80 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">Postpaid Billing</h3>
        <button
          className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
          onClick={() => {
            /* TODO: Implement CSV export for postpaid bills */
          }}
          disabled={!bills || bills.length === 0}
        >
          <ExportCsvIcon color="#2563EB" size={20} />
          <p className="text-sm text-[#2563EB]">Export CSV</p>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="mb-6 flex gap-4">
        <SearchModule
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onCancel={handleCancelSearch}
          placeholder="Search by account number"
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

        {/* Status Filter */}
        <div className="relative" data-dropdown-root="status-filter">
          <button
            type="button"
            className="button-oulined flex items-center gap-2"
            onClick={() => setIsStatusOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={isStatusOpen}
          >
            <IoMdFunnel />
            <span>{statusOptions.find((opt) => opt.value === selectedStatus)?.label || "All Status"}</span>
            <ChevronDown className={`size-4 text-gray-500 transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
          </button>
          {isStatusOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                      selectedStatus === option.value ? "bg-gray-50" : ""
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
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative" data-dropdown-root="category-filter">
          <button
            type="button"
            className="button-oulined flex items-center gap-2"
            onClick={() => setIsCategoryOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={isCategoryOpen}
          >
            <IoMdFunnel />
            <span>{categoryOptions.find((opt) => opt.value === selectedCategory)?.label || "All Categories"}</span>
            <ChevronDown
              className={`size-4 text-gray-500 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isCategoryOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                      selectedCategory === option.value ? "bg-gray-50" : ""
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
            </div>
          )}
        </div>
      </div>

      {/* Postpaid Bills Display */}
      {error ? (
        <div className="py-8 text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400" />
          <p className="text-gray-500">Error loading postpaid bills: {error}</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No postpaid bills found for this customer</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill: PostpaidBill) => (
            <PostpaidBillCard key={bill.id} bill={bill} onViewDetails={handleViewDetails} />
          ))}
        </div>
      ) : (
        <div className="divide-y">
          {bills.map((bill: PostpaidBill) => (
            <PostpaidBillListItem key={bill.id} bill={bill} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {bills.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p>Show rows</p>
            <select value={pagination.pageSize} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
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
      )}
    </motion.div>
  )
}

export default PostpaidBillingTab
