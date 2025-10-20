"use client"
import React, { useRef, useState } from "react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { RxCaretSort } from "react-icons/rx"
import OutgoingIcon from "public/outgoing-icon"
import IncomingIcon from "public/incoming-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import PdfFile from "public/pdf-file"
import DeleteModal from "components/ui/Modal/delete-modal"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import Filtericon from "public/filter-icon"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import {
  Transaction,
  useGetTransactionByIdQuery,
  useGetTransactionsQuery,
  useRefundTransactionMutation,
} from "lib/redux/transactionSlice"
import { notify } from "components/ui/Notification/Notification"

type SortOrder = "asc" | "desc" | null

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {[...Array(8)].map((_, index) => (
        <td key={index} className="whitespace-nowrap border-b p-4">
          <div className={`h-4 rounded bg-gray-200 ${index % 2 === 0 ? "w-3/4" : "w-full"}`}></div>
        </td>
      ))}
    </tr>
  )
}

const TableSkeleton = () => {
  return (
    <div className="w-full overflow-x-auto border-l border-r bg-[#ffffff]">
      <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {[...Array(8)].map((_, index) => (
              <th key={index} className="whitespace-nowrap border-b p-4 text-sm">
                <div className="h-4 w-3/4 rounded bg-gray-300"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const DetailSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="flex items-center justify-between bg-[#E9F0FF] p-4">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-gray-300"></div>
          <div className="h-6 w-40 rounded bg-gray-300"></div>
        </div>
        <div className="size-6 rounded bg-gray-300"></div>
      </div>

      <div className="flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="h-5 w-48 rounded bg-gray-300"></div>
        <div className="mt-2 h-4 w-32 rounded bg-gray-300"></div>
        <div className="mt-2 h-6 w-20 rounded bg-gray-300"></div>
      </div>

      <div className="space-y-4 p-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        ))}

        <div className="pt-4">
          <div className="mb-2 h-4 w-32 rounded bg-gray-300"></div>
          <div className="space-y-2 rounded-md bg-gray-50 p-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-24 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-8">
          <div className="h-10 w-36 rounded bg-gray-300"></div>
          <div className="h-10 w-36 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  )
}

interface TransactionDetailModalProps {
  isOpen: boolean
  transactionId: number | null
  onRequestClose: () => void
  onRefund: (transactionId: number, reference: string) => void
  isRefunding?: boolean
  refundedTransactions: Set<number>
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  transactionId,
  onRequestClose,
  onRefund,
  isRefunding = false,
  refundedTransactions,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError } = useGetTransactionByIdQuery(transactionId ?? 0, {
    skip: !transactionId || !isOpen,
  })

  const transaction = data?.data?.[0] || null

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

      pdf.save(`Transaction_${transaction?.reference}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleRefund = () => {
    if (transaction?.id && transaction?.reference) {
      onRefund(transaction.id, transaction.reference)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "pending":
      case "processing":
        return {
          backgroundColor: "#FBF4EC",
          color: "#D28E3D",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "failed":
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
          backgroundColor: "#EDF2FE",
          color: "#4976F4",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
    return date.toLocaleDateString("en-US", options)
  }

  if (!isOpen || !transactionId) return null

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex h-auto w-[481px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[380px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      ariaHideApp={false}
    >
      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !transaction ? (
        <div className="flex w-full flex-col items-center justify-center p-8">
          <p className="text-red-500">Failed to load transaction details</p>
          <button onClick={onRequestClose} className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white">
            Close
          </button>
        </div>
      ) : (
        <div ref={modalRef} className="w-full">
          <div className="flex items-center justify-between bg-[#E9F0FF] p-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-[#003F9F] font-semibold text-white">
                {transaction.user.firstName.charAt(0).toUpperCase()}
              </div>
              <p className="text-xl font-semibold text-[#2a2f4b]">Transaction Details</p>
            </div>
            <button onClick={onRequestClose} className="cursor-pointer text-gray-600 hover:text-gray-800">
              <MdClose size={24} />
            </button>
          </div>

          <div className="flex w-full flex-col items-center justify-center bg-gray-50 p-4">
            <p className="text-sm text-gray-800">
              <span className="font-bold">
                {transaction.currency.ticker} {transaction.amount}
              </span>{" "}
              {transaction.type.label.toLowerCase()}
            </p>
            <p className="mt-1 text-sm text-gray-500">{formatDateTime(transaction.createdAt)}</p>
            <div
              style={getStatusStyle(transaction.status.label)}
              className="mt-2 inline-block text-sm font-medium capitalize"
            >
              {transaction.status.label}
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Transaction ID:</p>
              <p className="text-gray-800">{transaction.reference}</p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Type:</p>
              <p className="capitalize text-gray-800">{transaction.type.label.toLowerCase()}</p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Amount:</p>
              <p className="text-gray-800">
                {transaction.currency.ticker} {transaction.amount}
              </p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">User:</p>
              <p className="text-gray-800">
                {transaction.user.firstName} {transaction.user.lastName}
              </p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Channel:</p>
              <p className="text-gray-800">{transaction.channel}</p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Status:</p>
              <div
                style={getStatusStyle(transaction.status.label)}
                className="inline-block text-sm font-medium capitalize"
              >
                {transaction.status.label}
              </div>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Date:</p>
              <p className="text-gray-800">{formatDateTime(transaction.createdAt)}</p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Comment:</p>
              <p className="text-gray-800">{transaction.comment}</p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Can Refund:</p>
              <p className="text-gray-800">{transaction.canRefund ? "Yes" : "No"}</p>
            </div>

            {transaction.utility && (
              <div className="pt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-600">Utility Details</h4>
                <div className="space-y-2 rounded-md bg-gray-50 p-3">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Reference:</p>
                    <p className="text-gray-800">{transaction.utility.reference}</p>
                  </div>
                  {transaction.utility.token && (
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-600">Token:</p>
                      <p className="text-gray-800">{transaction.utility.token}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {transaction.vasPayload && (
              <div className="pt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-600">VAS Details</h4>
                <div className="space-y-2 rounded-md bg-gray-50 p-3">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Customer:</p>
                    <p className="text-gray-800">{transaction.vasPayload.customerName}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Phone:</p>
                    <p className="text-gray-800">{transaction.vasPayload.customerPhone}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Biller:</p>
                    <p className="text-gray-800">{transaction.vasPayload.billerId}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <ButtonModule
                variant="outline"
                size="md"
                icon={<PdfFile />}
                iconPosition="start"
                onClick={handleDownloadPDF}
                className="border-gray-300 hover:bg-gray-50"
              >
                Download Pdf
              </ButtonModule>
              <ButtonModule
                variant="outline"
                size="md"
                icon={<PdfFile />}
                iconPosition="start"
                onClick={handlePrint}
                className="border-gray-300 hover:bg-gray-50"
              >
                Print
              </ButtonModule>
            </div>

            {transaction.canRefund && !refundedTransactions.has(transaction.id) && (
              <div className="mt-4 flex justify-center">
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleRefund}
                  disabled={isRefunding}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isRefunding ? "Processing Refund..." : "Refund Transaction"}
                </ButtonModule>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

interface RefundModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm: (reference: string) => void
  loading: boolean
  transactionReference: string
  transactionAmount: number
  transactionCurrency: string
}

const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading,
  transactionReference,
  transactionAmount,
  transactionCurrency,
}) => {
  const handleConfirm = () => {
    onConfirm(transactionReference)
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex h-auto w-[400px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[350px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      ariaHideApp={false}
    >
      <div className="w-full">
        <div className="flex items-center justify-between bg-[#E9F0FF] p-4">
          <p className="text-lg font-semibold text-[#2a2f4b]">Confirm Refund</p>
          <button onClick={onRequestClose} className="cursor-pointer text-gray-600 hover:text-gray-800">
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-lg font-medium text-gray-800">Are you sure you want to refund this transaction?</p>
            <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>
          </div>

          <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Reference:</span>
              <span className="text-gray-800">{transactionReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Amount:</span>
              <span className="text-gray-800">
                {transactionCurrency} {transactionAmount}
              </span>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <ButtonModule
              variant="outline"
              size="md"
              onClick={onRequestClose}
              disabled={loading}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </ButtonModule>
            <ButtonModule
              variant="primary"
              size="md"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Refund"}
            </ButtonModule>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const FilterDropdown = ({
  isOpen,
  onClose,
  onFilterChange,
  activeFilters,
}: {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filter: string) => void
  activeFilters: string[]
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filterOptions = [
    { value: "Withdraw", label: "Withdrawal" },
    { value: "TopUp", label: "Deposit" },
    { value: "Utility", label: "Utility" },
    { value: "ElectronicLevy", label: "Electronic Levy" },
  ]

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm font-medium text-gray-700">Filter by transaction type</div>
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

const DateRangeFilter = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: {
  startDate: Date | null
  endDate: Date | null
  setStartDate: (date: Date | null) => void
  setEndDate: (date: Date | null) => void
}) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-md bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">From:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="rounded-md border border-gray-300 p-2 text-sm"
          placeholderText="Start date"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">To:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate as Date | undefined}
          className="rounded-md border border-gray-300 p-2 text-sm"
          placeholderText="End date"
        />
      </div>
      <button
        onClick={() => {
          setStartDate(null)
          setEndDate(null)
        }}
        className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
      >
        Clear Dates
      </button>
    </div>
  )
}

const AllTransactionTable: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [referenceSearch, setReferenceSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null)
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [transactionToRefund, setTransactionToRefund] = useState<Transaction | null>(null)
  const [refundedTransactions, setRefundedTransactions] = useState<Set<number>>(new Set())

  const { data, isLoading, isError } = useGetTransactionsQuery({
    pageNumber: currentPage,
    pageSize,
    startDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
    endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
    reference: referenceSearch || undefined,
  })

  const [refundTransaction] = useRefundTransactionMutation()

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleFilterChange = (filter: string) => {
    setCurrentPage(1)
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const filteredTransactions = data?.data || []

  const getInitial = (name: string) => {
    if (!name || name.length === 0) return ""
    return name.charAt(0).toUpperCase()
  }

  const getPaymentStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "pending":
      case "processing":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "failed":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return {}
    }
  }

  const dotStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return { backgroundColor: "#589E67" }
      case "pending":
      case "processing":
        return { backgroundColor: "#D28E3D" }
      case "failed":
        return { backgroundColor: "#AF4B4B" }
      default:
        return {}
    }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const handleCancelReferenceSearch = () => {
    setReferenceSearch("")
    setCurrentPage(1)
  }

  const handleDeleteClick = (transaction: Transaction) => {
    setOrderToDelete(transaction)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (reason: string) => {
    setIsDeleting(true)
    try {
      console.log("Deleting transaction:", orderToDelete?.reference, "Reason:", reason)
      setIsDeleteModalOpen(false)
      setOrderToDelete(null)
    } catch (error) {
      console.error("Error deleting transaction:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransactionId(transaction.id)
    setIsOrderDetailModalOpen(true)
  }

  const handleOpenRefundModal = (transaction: Transaction) => {
    setTransactionToRefund(transaction)
    setIsRefundModalOpen(true)
  }

  const handleConfirmRefund = async (reference: string) => {
    setIsRefunding(true)
    try {
      const result = await refundTransaction({ reference }).unwrap()

      if (result.isSuccess) {
        notify("success", "Refund Processed!", {
          description: "Transaction refund has been processed successfully.",
          duration: 3000,
        })

        // Mark transaction as refunded to hide refund button
        if (transactionToRefund?.id) {
          setRefundedTransactions((prev) => new Set(prev).add(transactionToRefund.id))
        }

        setIsRefundModalOpen(false)
        setTransactionToRefund(null)
      } else {
        notify("error", "Refund Failed", {
          description: result.message || "Unable to process refund at this time.",
          duration: 4000,
        })
      }
    } catch (error: any) {
      console.error("Error processing refund:", error)
      notify("error", "Refund Failed", {
        description:
          error.data?.message || error.message || "An unexpected error occurred while processing the refund.",
        duration: 4000,
      })
    } finally {
      setIsRefunding(false)
    }
  }

  const handleRefundFromDetailModal = async (transactionId: number, reference: string) => {
    setIsRefunding(true)
    try {
      const result = await refundTransaction({ reference }).unwrap()

      if (result.isSuccess) {
        notify("success", "Refund Processed!", {
          description: "Transaction refund has been processed successfully.",
          duration: 3000,
        })

        // Mark transaction as refunded to hide refund button
        setRefundedTransactions((prev) => new Set(prev).add(transactionId))

        setIsOrderDetailModalOpen(false)
      } else {
        notify("error", "Refund Failed", {
          description: result.message || "Unable to process refund at this time.",
          duration: 4000,
        })
      }
    } catch (error: any) {
      console.error("Error processing refund:", error)
      notify("error", "Refund Failed", {
        description:
          error.data?.message || error.message || "An unexpected error occurred while processing the refund.",
        duration: 4000,
      })
    } finally {
      setIsRefunding(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
    return date.toLocaleString("en-US", options)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="h-8 w-48 rounded bg-gray-200"></div>
          <div className="flex gap-4">
            <div className="h-10 w-64 rounded bg-gray-200"></div>
            <div className="h-10 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <DateRangeFilter startDate={null} endDate={null} setStartDate={() => {}} setEndDate={() => {}} />
        <TableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#f9f9f9]">
        <p className="text-base font-bold text-[#202B3C]">Error loading transactions. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-medium max-sm:pb-3 md:text-xl">Recent Transactions</p>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex gap-4">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by name or comment"
            />
            <div className="relative">
              <SearchModule
                value={referenceSearch}
                onChange={(e) => setReferenceSearch(e.target.value)}
                onCancel={handleCancelReferenceSearch}
                placeholder="Search by reference"
              />
            </div>
          </div>
          <div className="relative">
            <ButtonModule variant="black" size="md" icon={<Filtericon />} iconPosition="start" onClick={toggleFilter}>
              <p className="max-sm:hidden">Filter</p>
              {activeFilters.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-500 px-2 py-1 text-xs font-bold leading-none text-white">
                  {activeFilters.length}
                </span>
              )}
            </ButtonModule>
            {isFilterOpen && (
              <FilterDropdown
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* Standalone Date Range Filter */}
      <DateRangeFilter startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />

      {filteredTransactions.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#f9f9f9]">
          <EmptyState />
          <p className="text-base font-bold text-[#202B3C]">No transactions found.</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto border-l border-r bg-[#ffffff]">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("reference")}
                  >
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                    Reference ID <RxCaretSort />
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("user")}
                  >
                    <div className="flex items-center gap-2">
                      User <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("type")}
                  >
                    <div className="flex items-center gap-2">
                      Type <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center gap-2">
                      Amount <RxCaretSort />
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
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Date <RxCaretSort />
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
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                        {transaction.reference}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-[#EDF0F4]">
                          <p>{getInitial(transaction.user.firstName)}</p>
                        </div>
                        {transaction.user.firstName} {transaction.user.lastName}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 rounded-full py-1">{transaction.type.label}</div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(transaction.status.label)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <span className="text-grey-400">{transaction.currency.ticker}</span>
                          {transaction.amount}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getPaymentStyle(transaction.status.label)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <span className="size-2 rounded-full" style={dotStyle(transaction.status.label)}></span>
                          {transaction.status.label}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{transaction.channel}</td>
                    <td className="border-b py-1 text-sm">
                      <div className="flex gap-2">
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          icon={<PdfFile />}
                          iconPosition="start"
                          className="border-gray-300 hover:bg-gray-50"
                          onClick={() => handleViewDetails(transaction)}
                        >
                          View Detail
                        </ButtonModule>
                        {transaction.canRefund && !refundedTransactions.has(transaction.id) && (
                          <ButtonModule variant="primary" size="sm" onClick={() => handleOpenRefundModal(transaction)}>
                            Refund
                          </ButtonModule>
                        )}
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
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, data?.totalCount || 0)} of{" "}
              {data?.totalCount || 0} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
              >
                <MdOutlineArrowBackIosNew />
              </button>

              {Array.from({ length: Math.min(5, data?.totalPages || 1) }).map((_, index) => {
                let pageNum
                if (data?.totalPages && data.totalPages <= 5) {
                  pageNum = index + 1
                } else if (currentPage <= 3) {
                  pageNum = index + 1
                } else if (currentPage >= (data?.totalPages || 0) - 2) {
                  pageNum = (data?.totalPages || 0) - 4 + index
                } else {
                  pageNum = currentPage - 2 + index
                }

                return (
                  <button
                    key={index}
                    onClick={() => paginate(pageNum)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-[#003F9F] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {data?.totalPages && data.totalPages > 5 && currentPage < data.totalPages - 2 && (
                <span className="px-2">...</span>
              )}

              {data?.totalPages && data.totalPages > 5 && currentPage < data.totalPages - 1 && (
                <button
                  onClick={() => paginate(data.totalPages)}
                  className={`flex size-8 items-center justify-center rounded-md text-sm ${
                    currentPage === data.totalPages
                      ? "bg-[#003F9F] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {data.totalPages}
                </button>
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === data?.totalPages}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === data?.totalPages
                    ? "cursor-not-allowed text-gray-400"
                    : "text-[#003F9F] hover:bg-gray-100"
                }`}
              >
                <MdOutlineArrowForwardIos />
              </button>
            </div>
          </div>
        </>
      )}

      <TransactionDetailModal
        isOpen={isOrderDetailModalOpen}
        transactionId={selectedTransactionId}
        onRequestClose={() => {
          setIsOrderDetailModalOpen(false)
          setSelectedTransactionId(null)
        }}
        onRefund={handleRefundFromDetailModal}
        isRefunding={isRefunding}
        refundedTransactions={refundedTransactions}
      />

      <RefundModal
        isOpen={isRefundModalOpen}
        onRequestClose={() => {
          setIsRefundModalOpen(false)
          setTransactionToRefund(null)
        }}
        onConfirm={handleConfirmRefund}
        loading={isRefunding}
        transactionReference={transactionToRefund?.reference || ""}
        transactionAmount={transactionToRefund?.amount || 0}
        transactionCurrency={transactionToRefund?.currency.ticker || ""}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => {
          setIsDeleteModalOpen(false)
          setOrderToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        businessName={orderToDelete?.reference || "this transaction"}
      />
    </div>
  )
}

export default AllTransactionTable
