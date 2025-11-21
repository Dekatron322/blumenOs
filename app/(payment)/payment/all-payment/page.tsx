"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { BillsIcon, MapIcon, PhoneIcon, PlusIcon, UserIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddAgentModal from "components/ui/Modal/add-agent-modal"

import { fetchPayments, PaymentsRequestParams, clearPayments } from "lib/redux/paymentSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface Payment {
  id: number
  reference: string
  channel: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet"
  status: "Pending" | "Confirmed" | "Failed" | "Reversed"
  collectorType: "Customer" | "Agent" | "Vendor" | "Staff"
  amount: number
  amountApplied: number
  overPaymentAmount: number
  outstandingAfterPayment: number
  outstandingBeforePayment: number
  currency: string
  paidAtUtc: string
  confirmedAtUtc: string
  customerId: number
  customerName: string
  customerAccountNumber: string
  postpaidBillId: number
  postpaidBillPeriod: string
  billTotalDue: number
  vendorId: number
  vendorName: string
  agentId: number
  agentCode: string
  agentName: string
  areaOfficeName: string
  distributionSubstationCode: string
  feederName: string
  paymentTypeId: number
  paymentTypeName: string
}

interface ActionDropdownProps {
  payment: Payment
  onViewDetails: (payment: Payment) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ payment, onViewDetails }) => {
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)

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
                  console.log("Process refund:", payment.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Process Refund
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Export receipt:", payment.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Export Receipt
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
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto px-4 py-8 max-sm:px-2 lg:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Payment Management</h4>
                <p className="text-gray-600">Track and manage customer payments and transactions</p>
              </div>
            </div>
            <motion.div
              className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5"
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
                      {[...Array(8)].map((_, i) => (
                        <th key={i} className="whitespace-nowrap border-b p-4">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(8)].map((_, cellIndex) => (
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
                  <div className="h-8 w-8 rounded bg-gray-200"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded bg-gray-200"></div>
                  ))}
                  <div className="h-8 w-8 rounded bg-gray-200"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

const AllPayments: React.FC = () => {
  const dispatch = useAppDispatch()
  const { payments, loading, error, success, pagination } = useAppSelector((state) => state.payments)

  const router = useRouter()

  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Partial<PaymentsRequestParams>>({
    pageNumber: 1,
    pageSize: 10,
  })

  const pageSize = 10

  // Fetch payments when component mounts or filters change
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        fetchPayments({
          pageNumber: currentPage,
          pageSize,
          ...(searchText && { search: searchText }),
          ...filters,
        })
      )
    }

    fetchData()
  }, [dispatch, currentPage, searchText, filters])

  // Clear payments when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPayments())
    }
  }, [dispatch])

  const getStatusStyle = (status: Payment["status"]) => {
    switch (status) {
      case "Confirmed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "Pending":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "Failed":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "Reversed":
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getPaymentMethodStyle = (channel: Payment["channel"]) => {
    switch (channel) {
      case "BankTransfer":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "Cash":
        return {
          backgroundColor: "#F3E8FF",
          color: "#9333EA",
        }
      case "Pos":
        return {
          backgroundColor: "#FFFBEB",
          color: "#D97706",
        }
      case "Card":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "VendorWallet":
        return {
          backgroundColor: "#FEF2F2",
          color: "#DC2626",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getCollectorTypeStyle = (collectorType: Payment["collectorType"]) => {
    switch (collectorType) {
      case "Customer":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "Agent":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "Vendor":
        return {
          backgroundColor: "#FFFBEB",
          color: "#D97706",
        }
      case "Staff":
        return {
          backgroundColor: "#F3E8FF",
          color: "#9333EA",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const handleAddPaymentSuccess = async () => {
    setIsAddPaymentModalOpen(false)
    // Refresh data after adding payment
    dispatch(
      fetchPayments({
        pageNumber: currentPage,
        pageSize,
        ...(searchText && { search: searchText }),
        ...filters,
      })
    )
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="p-4 text-red-600">Error loading payments: {error}</div>

  return (
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto px-4 py-8 max-sm:px-2 lg:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Payment Management</h4>
                <p className="text-gray-600">Track and manage customer payments and transactions</p>
              </div>

              <motion.div
                className="flex items-center justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  icon={<PlusIcon />}
                  onClick={() => setIsAddPaymentModalOpen(true)}
                >
                  Process Payment
                </ButtonModule>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Payment Table Container */}
              <div className="w-full">
                <motion.div
                  className="w-full rounded-lg border bg-white p-4 lg:p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold">Payment Directory</h3>
                    <div className="max-w-md">
                      <SearchModule
                        placeholder="Search customers or references..."
                        value={searchText}
                        onChange={handleSearch}
                        onCancel={handleCancelSearch}
                      />
                    </div>
                  </div>

                  {payments.length === 0 ? (
                    <motion.div
                      className="flex h-60 flex-col items-center justify-center gap-2 rounded-lg bg-[#F6F6F9]"
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
                        {searchText ? "No matching payments found" : "No payments available"}
                      </motion.p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Table Container with Max Width and Scroll */}
                      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                        <div className="max-w-full overflow-x-auto">
                          <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <MdOutlineCheckBoxOutlineBlank className="text-lg text-gray-400" />
                                    Customer
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("amount")}
                                >
                                  <div className="flex items-center gap-2">
                                    Amount <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("status")}
                                >
                                  <div className="flex items-center gap-2">
                                    Status <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("channel")}
                                >
                                  <div className="flex items-center gap-2">
                                    Payment Method <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("reference")}
                                >
                                  <div className="flex items-center gap-2">
                                    Reference <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("paidAtUtc")}
                                >
                                  <div className="flex items-center gap-2">
                                    Timestamp <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("collectorType")}
                                >
                                  <div className="flex items-center gap-2">
                                    Collector Type <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("areaOfficeName")}
                                >
                                  <div className="flex items-center gap-2">
                                    Location <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <AnimatePresence>
                                {payments.map((payment, index) => (
                                  <motion.tr
                                    key={payment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                                      <div className="flex items-center gap-2">
                                        <UserIcon />
                                        <div>
                                          <div className="font-medium text-gray-900">{payment.customerName}</div>
                                          <div className="text-xs text-gray-500">{payment.customerAccountNumber}</div>
                                          {payment.postpaidBillPeriod && (
                                            <div className="text-xs text-blue-600">{payment.postpaidBillPeriod}</div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                                      {formatCurrency(payment.amount, payment.currency)}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getStatusStyle(payment.status)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        <span
                                          className="size-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              payment.status === "Confirmed"
                                                ? "#589E67"
                                                : payment.status === "Pending"
                                                ? "#D97706"
                                                : payment.status === "Failed"
                                                ? "#AF4B4B"
                                                : "#6B7280",
                                          }}
                                        ></span>
                                        {payment.status}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getPaymentMethodStyle(payment.channel)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {payment.channel}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {payment.reference}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {formatDate(payment.paidAtUtc)}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getCollectorTypeStyle(payment.collectorType)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {payment.collectorType}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <MapIcon />
                                        {payment.areaOfficeName}
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <ActionDropdown
                                        payment={payment}
                                        onViewDetails={(payment) =>
                                          router.push(`/payment/payment-detail/${payment.id}`)
                                        }
                                      />
                                    </td>
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      <motion.div
                        className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <div className="text-sm text-gray-700">
                          Showing {(currentPage - 1) * pageSize + 1} to{" "}
                          {Math.min(currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount} entries
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center rounded-md p-2 ${
                              currentPage === 1
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#003F9F] hover:bg-gray-100"
                            }`}
                            whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                            whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                          >
                            <MdOutlineArrowBackIosNew size={16} />
                          </motion.button>

                          {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, index) => {
                            let pageNum
                            if (pagination.totalPages <= 5) {
                              pageNum = index + 1
                            } else if (currentPage <= 3) {
                              pageNum = index + 1
                            } else if (currentPage >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + index
                            } else {
                              pageNum = currentPage - 2 + index
                            }

                            return (
                              <motion.button
                                key={index}
                                onClick={() => paginate(pageNum)}
                                className={`flex size-8 items-center justify-center rounded-md text-sm ${
                                  currentPage === pageNum
                                    ? "bg-[#0a0a0a] text-white"
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

                          {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                            <span className="px-1 text-gray-500">...</span>
                          )}

                          {pagination.totalPages > 5 && currentPage < pagination.totalPages - 1 && (
                            <motion.button
                              onClick={() => paginate(pagination.totalPages)}
                              className={`flex size-8 items-center justify-center rounded-md text-sm ${
                                currentPage === pagination.totalPages
                                  ? "bg-[#0a0a0a] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {pagination.totalPages}
                            </motion.button>
                          )}

                          <motion.button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                            className={`flex items-center justify-center rounded-md p-2 ${
                              currentPage === pagination.totalPages
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#003F9F] hover:bg-gray-100"
                            }`}
                            whileHover={{ scale: currentPage === pagination.totalPages ? 1 : 1.1 }}
                            whileTap={{ scale: currentPage === pagination.totalPages ? 1 : 0.95 }}
                          >
                            <MdOutlineArrowForwardIos size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <AddAgentModal
        isOpen={isAddPaymentModalOpen}
        onRequestClose={() => setIsAddPaymentModalOpen(false)}
        onSuccess={handleAddPaymentSuccess}
      />
    </section>
  )
}

export default AllPayments
