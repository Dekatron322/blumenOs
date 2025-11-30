"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { ExportCsvIcon } from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  type VendorPayment,
  type VendorPaymentsRequestParams,
  fetchVendorPayments,
  clearVendorPayments,
} from "lib/redux/vendorSlice"

// Channel filter options
const channelOptions = [
  { value: "", label: "All Channels" },
  { value: "Cash", label: "Cash" },
  { value: "BankTransfer", label: "Bank Transfer" },
  { value: "Pos", label: "POS" },
  { value: "Card", label: "Card" },
  { value: "VendorWallet", label: "Vendor Wallet" },
] as const

// Status filter options
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Failed", label: "Failed" },
  { value: "Reversed", label: "Reversed" },
] as const

interface VendorPaymentsTabProps {
  vendorId: number
}

const VendorPaymentsTab: React.FC<VendorPaymentsTabProps> = ({ vendorId }) => {
  const dispatch = useAppDispatch()
  const { vendorPayments, vendorPaymentsLoading, vendorPaymentsError, vendorPaymentsPagination } = useAppSelector(
    (state) => state.vendors
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedChannel, setSelectedChannel] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isChannelOpen, setIsChannelOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Fetch payments for this vendor
  useEffect(() => {
    const params: VendorPaymentsRequestParams = {
      pageNumber: currentPage,
      pageSize: vendorPaymentsPagination.pageSize,
      vendorId,
      ...(selectedChannel && { channel: selectedChannel as VendorPaymentsRequestParams["channel"] }),
      ...(selectedStatus && { status: selectedStatus as VendorPaymentsRequestParams["status"] }),
      ...(searchText && { search: searchText }),
    }

    dispatch(fetchVendorPayments({ id: vendorId, params }))
  }, [dispatch, vendorId, currentPage, vendorPaymentsPagination.pageSize, selectedChannel, selectedStatus, searchText])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearVendorPayments())
    }
  }, [dispatch])

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    const params: VendorPaymentsRequestParams = {
      pageNumber: 1,
      pageSize: newPageSize,
      vendorId,
      ...(selectedChannel && { channel: selectedChannel as VendorPaymentsRequestParams["channel"] }),
      ...(selectedStatus && { status: selectedStatus as VendorPaymentsRequestParams["status"] }),
      ...(searchText && { search: searchText }),
    }

    dispatch(fetchVendorPayments({ id: vendorId, params }))
    setCurrentPage(1)
  }

  const totalPages = vendorPaymentsPagination.totalPages || 1
  const totalRecords = vendorPaymentsPagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const PaymentCard = ({ payment }: { payment: VendorPayment }) => {
    return (
      <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{payment.customerName}</h3>
            <p className="text-sm text-gray-600">Account #{payment.customerAccountNumber}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">
                Ref: {payment.reference}
              </span>
              <span className="rounded-full bg-gray-50 px-2 py-1 font-medium text-gray-700">{payment.channel}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                {payment.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</div>
            <div className="text-xs text-gray-500">Paid: {formatDateTime(payment.paidAtUtc)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-3">
          <div>
            <span className="font-medium">Payment Type:</span> {payment.paymentTypeName}
          </div>
          <div>
            <span className="font-medium">Bill Period:</span> {payment.postpaidBillPeriod || "N/A"}
          </div>
          <div>
            <span className="font-medium">Outstanding After:</span>{" "}
            {formatCurrency(payment.outstandingAfterPayment, payment.currency)}
          </div>
        </div>
      </div>
    )
  }

  const PaymentListItem = ({ payment }: { payment: VendorPayment }) => {
    return (
      <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">{payment.customerName}</h3>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                Ref: {payment.reference}
              </span>
              <span className="rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                {payment.channel}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                {payment.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Account:</strong> {payment.customerAccountNumber}
              </span>
              <span>
                <strong>Amount:</strong> {formatCurrency(payment.amount, payment.currency)}
              </span>
              <span>
                <strong>Paid:</strong> {formatDateTime(payment.paidAtUtc)}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Payment Type: {payment.paymentTypeName} • Bill Period: {payment.postpaidBillPeriod || "N/A"}
            </div>
          </div>
          <div className="ml-4 text-right text-sm">
            <div className="font-bold text-gray-900">{formatCurrency(payment.amountApplied, payment.currency)}</div>
            <div className="text-xs text-gray-500">Applied Amount</div>
          </div>
        </div>
      </div>
    )
  }

  if (vendorPaymentsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">Vendor Payments</h3>
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
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">Vendor Payments</h3>
        <button
          className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
          onClick={() => {
            /* TODO: Implement CSV export for vendor payments */
          }}
          disabled={!vendorPayments || vendorPayments.length === 0}
        >
          <ExportCsvIcon color="#2563EB" size={20} />
          <p className="text-sm text-[#2563EB]">Export CSV</p>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <SearchModule
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onCancel={handleCancelSearch}
          placeholder="Search by customer, account or reference"
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

        {/* Channel Filter */}
        <div className="relative" data-dropdown-root="channel-filter">
          <button
            type="button"
            className="button-oulined flex items-center gap-2"
            onClick={() => setIsChannelOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={isChannelOpen}
          >
            <IoMdFunnel />
            <span>{channelOptions.find((opt) => opt.value === selectedChannel)?.label || "All Channels"}</span>
            <ChevronDown className={`size-4 text-gray-500 transition-transform ${isChannelOpen ? "rotate-180" : ""}`} />
          </button>
          {isChannelOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {channelOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                      selectedChannel === option.value ? "bg-gray-50" : ""
                    }`}
                    onClick={() => {
                      setSelectedChannel(option.value)
                      setIsChannelOpen(false)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
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
      </div>

      {/* Payments Display */}
      {vendorPaymentsError ? (
        <div className="py-8 text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400" />
          <p className="text-gray-500">Error loading payments: {vendorPaymentsError}</p>
        </div>
      ) : vendorPayments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No payments found for this vendor</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendorPayments.map((payment: VendorPayment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      ) : (
        <div className="divide-y">
          {vendorPayments.map((payment: VendorPayment) => (
            <PaymentListItem key={payment.id} payment={payment} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {vendorPayments.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p>Show rows</p>
            <select value={vendorPaymentsPagination.pageSize} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
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

export default VendorPaymentsTab
