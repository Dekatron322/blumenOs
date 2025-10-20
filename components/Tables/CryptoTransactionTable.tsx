"use client"
import React, { useRef, useState } from "react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import PdfFile from "public/pdf-file"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useGetCryptoTransactionsQuery, useSettleTransactionByReferenceMutation } from "lib/redux/transactionSlice"
import { API_CONFIG, API_ENDPOINTS } from "lib/config/api"
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
      </div>
    </div>
  )
}

interface TransactionDetailModalProps {
  isOpen: boolean
  transactionId: number | null
  onRequestClose: () => void
  onSettleTransaction: (transactionReference: string) => Promise<void>
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  transactionId,
  onRequestClose,
  onSettleTransaction,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError } = useGetCryptoTransactionsQuery(
    {
      pageNumber: 1,
      pageSize: 10,
    },
    {
      selectFromResult: ({ data, isLoading, isError }) => ({
        data: data?.data.find((tx) => tx.id === transactionId),
        isLoading,
        isError,
      }),
    }
  )

  const transaction = data

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

      pdf.save(`CryptoTransaction_${transaction?.reference}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusStyle = (confirmed: boolean, settled: boolean) => {
    if (confirmed && settled) {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
        padding: "0.25rem 0.5rem",
        borderRadius: "0.375rem",
        fontSize: "0.875rem",
        fontWeight: "500",
      }
    } else if (confirmed && !settled) {
      return {
        backgroundColor: "#FBF4EC",
        color: "#D28E3D",
        padding: "0.25rem 0.5rem",
        borderRadius: "0.375rem",
        fontSize: "0.875rem",
        fontWeight: "500",
      }
    } else {
      return {
        backgroundColor: "#F7EDED",
        color: "#AF4B4B",
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

  const handleSettleTransaction = async () => {
    if (!transaction?.reference) return

    try {
      await onSettleTransaction(transaction.reference)
      onRequestClose()
    } catch (error) {
      console.error("Failed to settle transaction:", error)
    }
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
                {transaction.quidaxUser.firstName.charAt(0).toUpperCase()}
              </div>
              <p className="text-xl font-semibold text-[#2a2f4b]">Crypto Transaction Details</p>
            </div>
            <button onClick={onRequestClose} className="cursor-pointer text-gray-600 hover:text-gray-800">
              <MdClose size={24} />
            </button>
          </div>

          <div className="flex w-full flex-col items-center justify-center bg-gray-50 p-4">
            <p className="text-sm text-gray-800">
              <span className="font-bold">
                {transaction.fromAmount} {transaction.fromCurrency}
              </span>{" "}
              to{" "}
              <span className="font-bold">
                {transaction.toAmount} {transaction.toCurrency}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-500">{formatDateTime(transaction.updatedAt)}</p>
            <div
              style={getStatusStyle(transaction.confirmed, transaction.settled)}
              className="mt-2 inline-block text-sm font-medium capitalize"
            >
              {transaction.confirmed ? (transaction.settled ? "Completed" : "Processing") : "Failed"}
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
              <p className="font-medium text-gray-600">From:</p>
              <p className="text-gray-800">
                {transaction.fromAmount} {transaction.fromCurrency}
              </p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">To:</p>
              <p className="text-gray-800">
                {transaction.toAmount} {transaction.toCurrency}
              </p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Exchange Rate:</p>
              <p className="text-gray-800">
                1 {transaction.fromCurrency} = {transaction.quotedPrice} {transaction.toCurrency}
              </p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">User:</p>
              <p className="text-gray-800">
                {transaction.quidaxUser.firstName} {transaction.quidaxUser.lastName}
              </p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Status:</p>
              <div
                style={getStatusStyle(transaction.confirmed, transaction.settled)}
                className="inline-block text-sm font-medium capitalize"
              >
                {transaction.confirmed ? (transaction.settled ? "Completed" : "Processing") : "Failed"}
              </div>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Date:</p>
              <p className="text-gray-800">{formatDateTime(transaction.updatedAt)}</p>
            </div>
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Profit:</p>
              <p className="text-gray-800">
                {transaction.profit} {transaction.toCurrency}
              </p>
            </div>

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

            {/* Settle Button - Only show if transaction is not settled */}
            {transaction.confirmed && !transaction.settled && (
              <div className="mt-4 flex justify-center">
                <ButtonModule variant="primary" size="md" onClick={handleSettleTransaction} className="w-full">
                  Settle Transaction
                </ButtonModule>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

const CryptoTransactionTable: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [referenceSearch, setReferenceSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null)
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false)

  const { data, isLoading, isError, error, refetch } = useGetCryptoTransactionsQuery({
    pageNumber: currentPage,
    pageSize,
    startDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
    endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
    reference: referenceSearch || undefined,
  })

  const [settleTransaction, { isLoading: isSettling }] = useSettleTransactionByReferenceMutation()

  const handleSettleTransaction = async (transactionReference: string) => {
    try {
      const result = await settleTransaction({ transactionReference }).unwrap()

      if (result.isSuccess) {
        notify("success", "Transaction settled successfully!")
        // Refetch the transactions to update the UI
        refetch()
      } else {
        notify("error", result.message || "Failed to settle transaction")
      }
    } catch (error: any) {
      console.error("Failed to settle transaction:", error)
      notify("error", error.data?.message || error.message || "Failed to settle transaction")
      throw error
    }
  }

  const getInitial = (name: string) => {
    if (!name || name.length === 0) return ""
    return name.charAt(0).toUpperCase()
  }

  const getStatusStyle = (confirmed: boolean, settled: boolean) => {
    if (confirmed && settled) {
      return { backgroundColor: "#EEF5F0", color: "#589E67" }
    } else if (confirmed && !settled) {
      return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    } else {
      return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
    }
  }

  const dotStyle = (confirmed: boolean, settled: boolean) => {
    if (confirmed && settled) {
      return { backgroundColor: "#589E67" }
    } else if (confirmed && !settled) {
      return { backgroundColor: "#D28E3D" }
    } else {
      return { backgroundColor: "#AF4B4B" }
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

  const handleViewDetails = (transactionId: number) => {
    setSelectedTransactionId(transactionId)
    setIsOrderDetailModalOpen(true)
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
        <TableSkeleton />
      </div>
    )
  }

  if (isError) {
    console.error("Crypto transactions error:", error)
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#f9f9f9]">
        <p className="text-base font-bold text-[#202B3C]">Error loading crypto transactions. Please try again.</p>
        <p className="text-sm text-red-600">
          {error && "data" in error ? JSON.stringify(error.data) : "Network error"}
        </p>
      </div>
    )
  }

  return (
    <div className="">
      {/* Header */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-medium max-sm:pb-3 md:text-xl">Crypto Transactions</p>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex gap-4">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by user name"
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
        </div>
      </div>

      {/* Date Range Filter */}
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

      {!data || data?.data.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#f9f9f9]">
          <EmptyState />
          <p className="text-base font-bold text-[#202B3C]">No crypto transactions found.</p>
          <p className="text-sm text-gray-600">
            {!data ? "No data received from API" : `API returned ${data.data.length} transactions`}
          </p>
          <p className="text-xs text-gray-500">
            Total count: {data?.totalCount || "N/A"} | Current page: {currentPage}
          </p>
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
                    onClick={() => toggleSort("profit")}
                  >
                    <div className="flex items-center gap-2">
                      Profit <RxCaretSort />
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
                    onClick={() => toggleSort("updatedAt")}
                  >
                    <div className="flex items-center gap-2">
                      Date <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                        {transaction.reference}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-[#EDF0F4]">
                          <p>{getInitial(transaction.quidaxUser.firstName)}</p>
                        </div>
                        {transaction.quidaxUser.firstName} {transaction.quidaxUser.lastName}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 rounded-full py-1">{transaction.type.label}</div>
                    </td>

                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div className="flex items-center justify-center gap-1 rounded-full px-2 py-1">
                          {transaction.fromAmount} {transaction.fromCurrency} → {transaction.toAmount}{" "}
                          {transaction.toCurrency}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex items-center gap-1 rounded-full py-1">
                        <p className="uppercase">{transaction.profitCurrency}</p> {transaction.profit}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      <div className="flex">
                        <div
                          style={getStatusStyle(transaction.confirmed, transaction.settled)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                        >
                          <span
                            className="size-2 rounded-full"
                            style={dotStyle(transaction.confirmed, transaction.settled)}
                          ></span>
                          {transaction.confirmed ? (transaction.settled ? "Completed" : "Processing") : "Failed"}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="flex gap-2 whitespace-nowrap border-b px-4 py-1 text-sm">
                      <ButtonModule
                        variant="outline"
                        size="sm"
                        icon={<PdfFile />}
                        iconPosition="start"
                        className="border-gray-300 hover:bg-gray-50"
                        onClick={() => handleViewDetails(transaction.id)}
                      >
                        View Detail
                      </ButtonModule>
                      {transaction.confirmed && !transaction.settled && (
                        <ButtonModule
                          variant="primary"
                          size="sm"
                          onClick={() => handleSettleTransaction(transaction.reference)}
                          disabled={isSettling}
                        >
                          {isSettling ? "Settling..." : "Settle"}
                        </ButtonModule>
                      )}
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
        onSettleTransaction={handleSettleTransaction}
      />
    </div>
  )
}

export default CryptoTransactionTable
