"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearRetryFailedPayment,
  FailedPayment,
  FailedPaymentParams,
  fetchFailedPayments,
  retryFailedPayment,
} from "lib/redux/metersSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { VscChevronDown, VscChevronUp, VscRefresh } from "react-icons/vsc"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter, X } from "lucide-react"
import Image from "next/image"
import { formatCurrency } from "utils/formatCurrency"
import TransactionReceiptModal from "components/ui/Modal/transaction-receipt-modal"
import RetryReceiptModal from "components/MeteringInfo/RetryReceiptModal"

interface ActionDropdownProps {
  transaction: FailedPayment
  onViewDetails: (transaction: FailedPayment) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ transaction, onViewDetails }) => {
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
    onViewDetails(transaction)
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
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Receipt
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Download Tokens
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
    <motion.div
      className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="h-8 w-40 rounded bg-gray-200">
          <motion.div
            className="size-full rounded bg-gray-300"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        </div>
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                },
              }}
            />
          </div>
          <div className="h-10 w-24 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200">
                    <motion.div
                      className="size-full rounded bg-gray-300"
                      initial={{ opacity: 0.3 }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        transition: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.1,
                        },
                      }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-20 rounded bg-gray-200">
                      <motion.div
                        className="size-full rounded bg-gray-300"
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          transition: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (rowIndex * 8 + cellIndex) * 0.05,
                          },
                        }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t py-3">
        <div className="h-8 w-48 rounded bg-gray-200">
          <motion.div
            className="size-full rounded bg-gray-300"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              },
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                },
              }}
            />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-8 rounded bg-gray-200">
              <motion.div
                className="size-full rounded bg-gray-300"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8 + i * 0.1,
                  },
                }}
              />
            </div>
          ))}
          <div className="h-8 w-8 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.3,
                },
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface FailedTransactionTableProps {
  pageSize?: number
}

const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex max-h-screen w-full max-w-sm flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-shrink-0 border-b bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold">Filters</h2>
                    {getActiveFilterCount() > 0 && (
                      <p className="text-xs text-gray-500">{getActiveFilterCount()} active filter(s)</p>
                    )}
                  </div>
                </div>
                <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
                  Clear All
                </button>
              </div>
            </div>

            {/* Filter Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Payment Reference Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Payment Reference</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Enter payment reference"
                    value={localFilters.paymentReference}
                    onChange={(e) => handleFilterChange("paymentReference", e.target.value)}
                  />
                </div>

                {/* Meter Number Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Meter Number</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Enter meter number"
                    value={localFilters.meterNumber}
                    onChange={(e) => handleFilterChange("meterNumber", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons - Fixed */}
            <div className="flex-shrink-0 border-t bg-white p-4 2xl:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="button-filled flex-1"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="button-oulined flex-1"
                >
                  Reset All
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Enhanced Badge Component
interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "channel" | "status" | "collector"
  size?: "sm" | "md"
  className?: string
  style?: React.CSSProperties
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", size = "sm", className = "", style }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200"

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  }

  const variantClasses = {
    default: "bg-gray-100 text-gray-800 border border-gray-200",
    channel: "border",
    status: "border",
    collector: "border",
  }

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} rounded-full`}
      style={style}
    >
      {children}
    </span>
  )
}

const FailedTransactionTable: React.FC<FailedTransactionTableProps> = ({ pageSize: propPageSize = 10 }) => {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(propPageSize)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Filter states
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [localFilters, setLocalFilters] = useState({
    paymentReference: "",
    meterNumber: "",
  })
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showRetryModal, setShowRetryModal] = useState(false)
  const [showRetryReceiptModal, setShowRetryReceiptModal] = useState(false)
  const [transactionToRetry, setTransactionToRetry] = useState<FailedPayment | null>(null)
  const [receiptModalData, setReceiptModalData] = useState<any>(null)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const {
    failedPayments,
    error,
    failedPaymentsPagination: pagination,
    failedPaymentsLoading: loading,
    retryFailedPaymentLoading,
    retryFailedPaymentError,
    retryFailedPaymentSuccess,
    retryFailedPaymentData,
  } = useAppSelector((state) => state.meters)

  // Fetch failed payments on component mount and when search/page changes
  useEffect(() => {
    const fetchFailedPaymentsData = () => {
      const params: FailedPaymentParams = {
        pageNumber: currentPage,
        pageSize: pageSize,
      }

      // Add filters from localFilters
      if (localFilters.paymentReference) {
        params.paymentReference = localFilters.paymentReference
      }
      if (localFilters.meterNumber) {
        params.meterNumber = localFilters.meterNumber
      }

      dispatch(fetchFailedPayments(params))
    }

    fetchFailedPaymentsData()
  }, [currentPage, pageSize, localFilters.paymentReference, localFilters.meterNumber, dispatch])

  // Handle retry success
  useEffect(() => {
    if (retryFailedPaymentSuccess && retryFailedPaymentData) {
      // Close retry modal
      setShowRetryModal(false)
      // Show retry receipt modal with retry data
      setShowRetryReceiptModal(true)
      // Refresh failed payments list
      dispatch(
        fetchFailedPayments({
          pageNumber: currentPage,
          pageSize: pageSize,
          paymentReference: localFilters.paymentReference || undefined,
          meterNumber: localFilters.meterNumber || undefined,
        })
      )
    }
  }, [retryFailedPaymentSuccess, retryFailedPaymentData, currentPage, pageSize, localFilters, dispatch])

  // Clear retry state on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearRetryFailedPayment())
    }
  }, [dispatch])

  const handleCancelSearch = () => {
    setLocalFilters((prev) => ({ ...prev, paymentReference: "" }))
    setCurrentPage(1)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    setLocalFilters((prev) => ({ ...prev, paymentReference: trimmed }))
    setCurrentPage(1)
  }

  const handleRetryPayment = (transaction: FailedPayment) => {
    setTransactionToRetry(transaction)
    setShowRetryModal(true)
  }

  const handleViewReceipt = (transaction: FailedPayment) => {
    setReceiptModalData(transaction)
    setShowReceiptModal(true)
  }

  const confirmRetryPayment = () => {
    if (transactionToRetry) {
      dispatch(retryFailedPayment(transactionToRetry.paymentId))
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    if (value.length === 0 || value.length >= 3) {
      setLocalFilters((prev) => ({ ...prev, paymentReference: value }))
      setCurrentPage(1)
    }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const toggleRowExpansion = (index: number) => {
    console.log("=== TOGGLE ROW EXPANSION ===")
    console.log("Clicked row index:", index)
    console.log("Current expandedRowId:", expandedRowId)
    const shouldClose = expandedRowId === index.toString()
    console.log("Should close current:", shouldClose)
    const newExpandedId = shouldClose ? null : index.toString()
    console.log("New expandedRowId will be:", newExpandedId)
    setExpandedRowId(newExpandedId)
  }

  // Enhanced status color function with better contrast
  const getStatusStyle = (status: string) => {
    const statusStyles: { [key: string]: { backgroundColor: string; color: string; borderColor: string } } = {
      Pending: {
        backgroundColor: "#FEF3C7",
        color: "#92400E",
        borderColor: "#FCD34D",
      },
      Confirmed: {
        backgroundColor: "#D1FAE5",
        color: "#065F46",
        borderColor: "#34D399",
      },
      Failed: {
        backgroundColor: "#FEE2E2",
        color: "#991B1B",
        borderColor: "#FCA5A5",
      },
      Reversed: {
        backgroundColor: "#F3F4F6",
        color: "#374151",
        borderColor: "#D1D5DB",
      },
    }
    return (
      statusStyles[status] || {
        backgroundColor: "#F3F4F6",
        color: "#374151",
        borderColor: "#D1D5DB",
      }
    )
  }

  // Enhanced channel color function
  const getChannelStyle = (channel: string) => {
    const channelStyles: { [key: string]: { backgroundColor: string; color: string; borderColor: string } } = {
      Cash: {
        backgroundColor: "#DBEAFE",
        color: "#1E3A8A",
        borderColor: "#93C5FD",
      },
      BankTransfer: {
        backgroundColor: "#EDE9FE",
        color: "#5B21B6",
        borderColor: "#C4B5FD",
      },
      Pos: {
        backgroundColor: "#FEF3C7",
        color: "#92400E",
        borderColor: "#FCD34D",
      },
      Card: {
        backgroundColor: "#FEE2E2",
        color: "#991B1B",
        borderColor: "#FCA5A5",
      },
      VendorWallet: {
        backgroundColor: "#D1FAE5",
        color: "#065F46",
        borderColor: "#34D399",
      },
      Chaque: {
        backgroundColor: "#F3F4F6",
        color: "#374151",
        borderColor: "#D1D5DB",
      },
    }
    return (
      channelStyles[channel] || {
        backgroundColor: "#F3F4F6",
        color: "#374151",
        borderColor: "#D1D5DB",
      }
    )
  }

  // Enhanced collector type color function
  const getCollectorStyle = (collectorType: string) => {
    const collectorStyles: { [key: string]: { backgroundColor: string; color: string; borderColor: string } } = {
      Customer: {
        backgroundColor: "#FEF3C7",
        color: "#92400E",
        borderColor: "#FCD34D",
      },
      SalesRep: {
        backgroundColor: "#D1FAE5",
        color: "#065F46",
        borderColor: "#34D399",
      },
      Vendor: {
        backgroundColor: "#EDE9FE",
        color: "#5B21B6",
        borderColor: "#C4B5FD",
      },
      Staff: {
        backgroundColor: "#DBEAFE",
        color: "#1E3A8A",
        borderColor: "#93C5FD",
      },
    }
    return (
      collectorStyles[collectorType] || {
        backgroundColor: "#F3F4F6",
        color: "#374151",
        borderColor: "#D1D5DB",
      }
    )
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Apply all filters at once (for the apply button)
  const applyFilters = () => {
    // Filters are already applied via useEffect when localFilters change
    // This function is kept for consistency with the UI
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      paymentReference: "",
      meterNumber: "",
    })
    setSearchInput("")
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    Object.keys(localFilters).forEach((key) => {
      if (localFilters[key as keyof typeof localFilters]) {
        count++
      }
    })
    return count
  }

  const totalRecords = pagination.totalCount
  const totalPages = Math.ceil(totalRecords / pageSize)
  const isLoading = loading

  if (isLoading && failedPayments.length === 0) return <LoadingSkeleton />
  if (error) return <div>Error loading failed payments</div>

  return (
    <>
      <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div className="relative flex flex-col gap-6 2xl:flex-row">
          {/* Main Content - Meters Table */}
          <div className={showDesktopFilters ? "w-full 2xl:max-w-[calc(100%-356px)] 2xl:flex-1" : "w-full 2xl:flex-1"}>
            <motion.div
              className="rounded-md border bg-white p-3 md:p-5"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-b pb-4">
                <div className="mb-3 flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Filter Button for ALL screens up to 2xl */}
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
                    >
                      <Filter className="size-4" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </button>

                    <p className="whitespace-nowrap text-lg font-medium sm:text-xl md:text-2xl">Failed Payments</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mobile search icon button */}
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 sm:hidden md:size-9"
                      onClick={() => {
                        /* Handle mobile search toggle if needed */
                      }}
                      aria-label="Toggle search"
                    >
                      <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
                    </button>

                    {/* Desktop/Tablet search input */}
                    <div className="hidden sm:block">
                      <SearchModule
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onCancel={handleCancelSearch}
                        onSearch={handleManualSearch}
                        placeholder="Search by Payment Reference or Meter Number"
                        className="w-full max-w-full sm:max-w-[320px]"
                        bgClassName="bg-white"
                      />
                    </div>

                    {/* Active filters badge - Desktop only (2xl and above) */}
                    {getActiveFilterCount() > 0 && (
                      <div className="hidden items-center gap-2 2xl:flex">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                    <button
                      type="button"
                      onClick={() => setShowDesktopFilters((prev) => !prev)}
                      className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                    >
                      {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                      {showDesktopFilters ? "Hide filters" : "Show filters"}
                    </button>
                  </div>
                </div>

                {/* Mobile search input revealed when icon is tapped */}
                <div className="mb-3 sm:hidden">
                  <SearchModule
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onCancel={handleCancelSearch}
                    onSearch={handleManualSearch}
                    placeholder="Search by Payment Reference or Meter Number"
                    className="w-full"
                    bgClassName="bg-white"
                  />
                </div>
              </div>

              {loading && failedPayments.length === 0 ? (
                <LoadingSkeleton />
              ) : failedPayments.length === 0 ? (
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
                    {localFilters.paymentReference || localFilters.meterNumber
                      ? "No matching failed payments found"
                      : "No failed payments available"}
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
                    <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th className="border-b p-4 text-sm">
                            <div className="flex items-center gap-2">
                              <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                              Payment Reference
                            </div>
                          </th>
                          <th
                            className="cursor-pointer border-b p-4 text-sm"
                            onClick={() => toggleSort("customerName")}
                            style={{ width: "150px" }}
                          >
                            <div className="flex items-center gap-2">
                              Customer <RxCaretSort />
                            </div>
                          </th>
                          <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("amount")}>
                            <div className="flex items-center gap-2">
                              Amount <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer border-b p-4 text-sm"
                            onClick={() => toggleSort("paymentChannel")}
                            style={{ width: "100px" }}
                          >
                            <div className="flex items-center gap-2">
                              Channel <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer border-b p-4 text-sm"
                            onClick={() => toggleSort("paymentStatus")}
                            style={{ width: "100px" }}
                          >
                            <div className="flex items-center gap-2">
                              Status <RxCaretSort />
                            </div>
                          </th>
                          <th className="cursor-pointer border-b p-4 text-sm" onClick={() => toggleSort("paidAtUtc")}>
                            <div className="flex items-center gap-2">
                              Date <RxCaretSort />
                            </div>
                          </th>
                          <th
                            className="cursor-pointer border-b p-4 text-sm"
                            onClick={() => toggleSort("attemptCount")}
                            style={{ width: "100px" }}
                          >
                            <div className="flex items-center gap-2">
                              Attempts <RxCaretSort />
                            </div>
                          </th>
                          <th className="border-b p-4 text-sm">
                            <div className="flex items-center gap-2">Actions</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedPayments.map((transaction, index) => {
                          console.log("Transaction data:", transaction)
                          const isExpanded = expandedRowId === index.toString()
                          const uniqueKey = `${transaction.paymentReference}-${index}`

                          return (
                            <React.Fragment key={uniqueKey}>
                              <motion.tr
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="hover:bg-gray-50"
                              >
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                                  {transaction.paymentReference}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  {transaction.customerName}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                                  ₦{formatCurrency(transaction.amount)}
                                </td>
                                <td className="border-b px-4 py-2 text-sm">
                                  <Badge
                                    variant="channel"
                                    style={getChannelStyle(transaction.paymentChannel)}
                                    className="font-medium"
                                  >
                                    {transaction.paymentChannel}
                                  </Badge>
                                </td>
                                <td className="border-b px-4 py-2 text-sm">
                                  <Badge
                                    variant="status"
                                    style={getStatusStyle(transaction.paymentStatus)}
                                    className="font-medium"
                                  >
                                    {transaction.paymentStatus}
                                  </Badge>
                                </td>
                                <td className="border-b px-4 py-2 text-sm">
                                  {new Date(transaction.paidAtUtc).toLocaleDateString()}
                                </td>
                                <td className="border-b px-4 py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{transaction.attemptCount}</span>
                                    <span className="text-xs text-gray-500">/ {transaction.maxAttempts}</span>
                                  </div>
                                </td>
                                <td className="flex items-center gap-2 border-b px-4 py-2 text-sm">
                                  <motion.button
                                    className="inline-flex items-center justify-center rounded-md border border-gray-300 p-1 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                    onClick={() => {
                                      console.log("Button clicked, row index:", index)
                                      toggleRowExpansion(index)
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={expandedRowId === index.toString() ? "Hide details" : "View details"}
                                  >
                                    {expandedRowId === index.toString() ? (
                                      <VscChevronUp className="size-4" />
                                    ) : (
                                      <VscChevronDown className="size-4" />
                                    )}
                                  </motion.button>
                                </td>
                              </motion.tr>

                              {isExpanded && (
                                <motion.tr
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="hover:bg-gray-50"
                                >
                                  <td colSpan={8} className="border-b bg-gray-50 p-0">
                                    <motion.div
                                      className="p-6"
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="text-sm font-semibold text-gray-900">Payment Information</h4>
                                            <div className="mt-2 space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Payment Reference:</span>
                                                <span className="font-medium">{transaction.paymentReference}</span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Status:</span>
                                                <Badge
                                                  variant="status"
                                                  style={getStatusStyle(transaction.paymentStatus)}
                                                  className="font-medium"
                                                >
                                                  {transaction.paymentStatus}
                                                </Badge>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Channel:</span>
                                                <Badge
                                                  variant="channel"
                                                  style={getChannelStyle(transaction.paymentChannel)}
                                                  className="font-medium"
                                                >
                                                  {transaction.paymentChannel}
                                                </Badge>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="text-sm font-semibold text-gray-900">Financial Details</h4>
                                            <div className="mt-2 space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="font-medium">
                                                  {formatCurrency(transaction.amount)}
                                                </span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Meter Number:</span>
                                                <span className="font-medium">{transaction.drn}</span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Account Number:</span>
                                                <span className="font-medium">{transaction.customerAccountNumber}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="text-sm font-semibold text-gray-900">Attempt Details</h4>
                                            <div className="mt-2 space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Attempt Count:</span>
                                                <span className="font-medium">
                                                  {transaction.attemptCount} / {transaction.maxAttempts}
                                                </span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Last Attempt:</span>
                                                <span className="font-medium">
                                                  {new Date(transaction.lastAttemptAtUtc).toLocaleString()}
                                                </span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Completed At:</span>
                                                <span className="font-medium">
                                                  {transaction.completedAtUtc
                                                    ? new Date(transaction.completedAtUtc).toLocaleString()
                                                    : "N/A"}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="mt-6 flex justify-end gap-3">
                                        <ButtonModule
                                          size="sm"
                                          variant="primary"
                                          onClick={() => handleRetryPayment(transaction)}
                                          icon={<VscRefresh />}
                                          disabled={retryFailedPaymentLoading}
                                        >
                                          {retryFailedPaymentLoading ? "Retrying..." : "Retry"}
                                        </ButtonModule>
                                      </div>
                                    </motion.div>
                                  </td>
                                </motion.tr>
                              )}
                            </React.Fragment>
                          )
                        })}
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
                      {totalRecords} entries
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
                          currentPage === totalPages
                            ? "cursor-not-allowed text-gray-400"
                            : "text-[#003F9F] hover:bg-gray-100"
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
          </div>

          {/* Desktop Filters Sidebar (2xl and above) - Toggleable */}
          {showDesktopFilters && (
            <motion.div
              key="desktop-filters-sidebar"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="hidden w-full flex-col rounded-md border bg-white 2xl:flex 2xl:w-80 2xl:self-start"
            >
              <div className="flex-shrink-0 border-b bg-white p-3 md:p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters</h2>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
                  >
                    <X className="size-3 md:size-4" />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-5">
                <div className="space-y-4">
                  {/* Payment Reference Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                      Payment Reference
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs md:text-sm"
                      placeholder="Enter payment reference"
                      value={localFilters.paymentReference}
                      onChange={(e) => handleFilterChange("paymentReference", e.target.value)}
                    />
                  </div>

                  {/* Meter Number Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Meter Number</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs md:text-sm"
                      placeholder="Enter meter number"
                      value={localFilters.meterNumber}
                      onChange={(e) => handleFilterChange("meterNumber", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 space-y-3 border-t bg-white p-3 md:p-5">
                <button
                  onClick={applyFilters}
                  className="button-filled flex w-full items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Filter className="size-4" />
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="button-oulined flex w-full items-center justify-center gap-2 text-sm md:text-base"
                >
                  <X className="size-4" />
                  Reset All
                </button>
              </div>

              {/* Summary Stats */}
              <div className="flex-shrink-0 rounded-lg bg-gray-50 p-3 md:p-4">
                <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
                <div className="space-y-1 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Records:</span>
                    <span className="font-medium">{pagination.totalCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Page:</span>
                    <span className="font-medium">
                      {currentPage} / {totalPages}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Filters:</span>
                    <span className="font-medium">{getActiveFilterCount()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Mobile & All Screens Filter Sidebar (up to 2xl) */}
        <MobileFilterSidebar
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          localFilters={localFilters}
          handleFilterChange={handleFilterChange}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
          getActiveFilterCount={getActiveFilterCount}
        />
      </motion.div>

      {/* Original Receipt Modal for Failed Payments */}
      <TransactionReceiptModal
        isOpen={showReceiptModal}
        onRequestClose={() => {
          setShowReceiptModal(false)
          setReceiptModalData(null)
        }}
        transaction={receiptModalData}
      />

      {/* Retry Receipt Modal for successful retry responses */}
      <RetryReceiptModal
        isOpen={showRetryReceiptModal}
        onRequestClose={() => setShowRetryReceiptModal(false)}
        retryData={retryFailedPaymentData}
      />

      {/* Retry Confirmation Modal */}
      <AnimatePresence>
        {showRetryModal && transactionToRetry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRetryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-orange-100">
                  <VscRefresh className="size-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Retry Payment</h3>
                  <p className="text-sm text-gray-500">Confirm retry of failed payment</p>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Reference:</span>
                  <span className="font-medium">{transactionToRetry.paymentReference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium">{formatCurrency(transactionToRetry.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-medium">{transactionToRetry.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Attempts:</span>
                  <span className="font-medium">
                    {transactionToRetry.attemptCount} / {transactionToRetry.maxAttempts}
                  </span>
                </div>
              </div>

              {retryFailedPaymentError && (
                <div className="mb-4 rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-600">{retryFailedPaymentError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <ButtonModule
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRetryModal(false)}
                  disabled={retryFailedPaymentLoading}
                  className="flex-1"
                >
                  Cancel
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="sm"
                  onClick={confirmRetryPayment}
                  disabled={retryFailedPaymentLoading}
                  loading={retryFailedPaymentLoading}
                  className="flex-1"
                >
                  {retryFailedPaymentLoading ? "Retrying..." : "Confirm Retry"}
                </ButtonModule>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FailedTransactionTable
