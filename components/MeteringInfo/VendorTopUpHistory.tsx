"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendorTopUpHistory } from "lib/redux/vendorSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { VscChevronDown, VscChevronUp, VscEye } from "react-icons/vsc"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import Image from "next/image"

interface VendorTopUpHistoryItem {
  id: number
  vendorId: number
  vendorName: string
  reference: string
  amount: number
  status: "Pending" | "Confirmed" | "Failed"
  createdAtUtc: string
  confirmedAtUtc?: string
  topUpBy: "Vendor" | "Admin"
  narrative?: string
}

interface VendorTopUpHistoryResponse {
  data: VendorTopUpHistoryItem[]
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

interface ActionDropdownProps {
  item: VendorTopUpHistoryItem
  onViewDetails: (item: VendorTopUpHistoryItem) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ item, onViewDetails }) => {
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
    onViewDetails(item)
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
                  console.log("View history:", item.reference)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View History
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
              {[...Array(6)].map((_, i) => (
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
                {[...Array(6)].map((_, cellIndex) => (
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
                            delay: (rowIndex * 6 + cellIndex) * 0.05,
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

interface VendorTopUpHistoryProps {
  pageSize?: number
}

const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
}) => {
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  const sortOptions: SortOption[] = [
    { label: "Reference A-Z", value: "reference", order: "asc" },
    { label: "Reference Z-A", value: "reference", order: "desc" },
    { label: "Vendor Name A-Z", value: "vendorName", order: "asc" },
    { label: "Vendor Name Z-A", value: "vendorName", order: "desc" },
    { label: "Amount Low-High", value: "amount", order: "asc" },
    { label: "Amount High-Low", value: "amount", order: "desc" },
    { label: "Date Newest", value: "createdAtUtc", order: "desc" },
    { label: "Date Oldest", value: "createdAtUtc", order: "asc" },
  ]

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
                    <h2 className="text-lg font-semibold">Filters & Sorting</h2>
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
                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pending", "Confirmed", "Failed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange("status", localFilters.status === status ? "" : status)}
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === status
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top-up By Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Top-up By</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Vendor", "Admin"].map((topUpBy) => (
                      <button
                        key={topUpBy}
                        onClick={() => handleFilterChange("topUpBy", localFilters.topUpBy === topUpBy ? "" : topUpBy)}
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.topUpBy === topUpBy
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {topUpBy}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSortExpanded((prev) => !prev)}
                    className="mb-1.5 flex w-full items-center justify-between text-sm font-medium text-gray-700"
                    aria-expanded={isSortExpanded}
                  >
                    <span>Sort By</span>
                    {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {isSortExpanded && (
                    <div className="space-y-2">
                      {sortOptions.map((option) => (
                        <button
                          key={`${option.value}-${option.order}`}
                          onClick={() => handleSortChange(option)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{option.label}</span>
                          {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                            <span className="text-purple-600">
                              {option.order === "asc" ? (
                                <SortAsc className="size-4" />
                              ) : (
                                <SortDesc className="size-4" />
                              )}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
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

const VendorTopUpHistory: React.FC<VendorTopUpHistoryProps> = ({ pageSize: propPageSize = 10 }) => {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(propPageSize)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [selectedItem, setSelectedItem] = useState<VendorTopUpHistoryItem | null>(null)

  // Filter states
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [localFilters, setLocalFilters] = useState({
    status: "",
    topUpBy: "",
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  const dispatch = useAppDispatch()
  const { vendorTopUpHistory, vendorTopUpHistoryPagination, vendorTopUpHistoryLoading, vendorTopUpHistoryError } =
    useAppSelector((state) => state.vendors)

  // Fetch vendor top-up history on component mount and when search/page changes
  useEffect(() => {
    const fetchVendorTopUpHistoryData = () => {
      const params: any = {
        pageNumber: currentPage,
        pageSize: pageSize,
      }

      // Add search if exists
      if (searchText) {
        params.search = searchText
      }

      // Add filters from localFilters
      if (localFilters.status) {
        params.status = localFilters.status
      }
      if (localFilters.topUpBy) {
        params.topUpBy = localFilters.topUpBy
      }

      dispatch(fetchVendorTopUpHistory(params))
    }

    fetchVendorTopUpHistoryData()
  }, [dispatch, currentPage, pageSize, searchText, localFilters])

  const handleCancelSearch = () => {
    setSearchInput("")
    setSearchText("")
    setCurrentPage(1)
  }

  const handleSearch = () => {
    setSearchText(searchInput.trim())
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Helper function to get status color
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "Pending":
        return {
          backgroundColor: "#FEF3C7",
          color: "#F59E0B",
        }
      case "Failed":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  // Helper function to get top-up by style
  const getTopUpByStyle = (topUpBy: string) => {
    return {
      backgroundColor: topUpBy === "Vendor" ? "#EFF6FF" : "#F5F3FF",
      color: topUpBy === "Vendor" ? "#1E40AF" : "#5B21B6",
    }
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleViewDetails = (item: VendorTopUpHistoryItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item)
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key as keyof typeof localFilters]: value,
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
    setCurrentPage(1) // Reset to first page when sort changes
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
      status: "",
      topUpBy: "",
      sortBy: "",
      sortOrder: "asc",
    })
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.status) count++
    if (localFilters.topUpBy) count++
    if (localFilters.sortBy) count++
    return count
  }

  const totalRecords = vendorTopUpHistoryPagination.totalCount || 0
  const totalPages = Math.ceil(totalRecords / pageSize)
  const isLoading = vendorTopUpHistoryLoading

  if (isLoading && !vendorTopUpHistory?.length) return <LoadingSkeleton />
  if (vendorTopUpHistoryError) return <div>Error loading vendor top-up history: {vendorTopUpHistoryError}</div>

  return (
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
                  <p className="whitespace-nowrap text-lg font-medium sm:text-xl md:text-2xl">Vendor Top-up History</p>
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
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onCancel={handleCancelSearch}
                      onSearch={handleSearch}
                      placeholder="Search by Reference and Vendor Name"
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
                </div>
              </div>

              {/* Mobile search input revealed when icon is tapped */}
              <div className="mb-3 sm:hidden">
                <SearchModule
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onCancel={handleCancelSearch}
                  onSearch={handleSearch}
                  placeholder="Search by Reference and Vendor Name"
                  className="w-full"
                  bgClassName="bg-white"
                />
              </div>
            </div>

            {isLoading && !vendorTopUpHistory?.length ? (
              <LoadingSkeleton />
            ) : !vendorTopUpHistory?.length ? (
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
                  {searchText ? "No matching vendor top-up history found" : "No vendor top-up history available"}
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
                        <th className="whitespace-nowrap border-b p-4 text-sm">
                          <div className="flex items-center gap-2">Reference</div>
                        </th>
                        <th
                          className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                          onClick={() => toggleSort("vendorName")}
                        >
                          <div className="flex items-center gap-2">
                            Vendor Name <RxCaretSort />
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
                          onClick={() => toggleSort("topUpBy")}
                        >
                          <div className="flex items-center gap-2">
                            Top-up By <RxCaretSort />
                          </div>
                        </th>
                        <th
                          className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                          onClick={() => toggleSort("createdAtUtc")}
                        >
                          <div className="flex items-center gap-2">
                            Date <RxCaretSort />
                          </div>
                        </th>
                        <th className="whitespace-nowrap border-b p-4 text-sm">
                          <div className="flex items-center gap-2">Actions</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {vendorTopUpHistory?.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <motion.tr
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="hover:bg-gray-50"
                            >
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                                {item.reference}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{item.vendorName}</td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                {formatCurrency(item.amount)}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <motion.div
                                  style={getStatusStyle(item.status)}
                                  className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.1 }}
                                >
                                  <span
                                    className="size-2 rounded-full"
                                    style={{
                                      backgroundColor:
                                        item.status === "Confirmed"
                                          ? "#589E67"
                                          : item.status === "Pending"
                                          ? "#F59E0B"
                                          : "#AF4B4B",
                                    }}
                                  ></span>
                                  {item.status}
                                </motion.div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <motion.div
                                  style={getTopUpByStyle(item.topUpBy)}
                                  className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.1 }}
                                >
                                  {item.topUpBy}
                                </motion.div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                {formatDate(item.createdAtUtc)}
                              </td>
                              <td className="flex items-center gap-2 whitespace-nowrap border-b px-4 py-1 text-sm">
                                <ButtonModule
                                  icon={<VscEye />}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(item)}
                                >
                                  View
                                </ButtonModule>

                                <motion.button
                                  className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                  onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  title={selectedItem?.id === item.id ? "Hide details" : "View details"}
                                >
                                  {selectedItem?.id === item.id ? (
                                    <VscChevronUp className="size-4" />
                                  ) : (
                                    <VscChevronDown className="size-4" />
                                  )}
                                </motion.button>
                              </td>
                            </motion.tr>

                            <AnimatePresence>
                              {selectedItem?.id === item.id && (
                                <motion.tr
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <td colSpan={7} className="border-b bg-gray-50 p-0">
                                    <motion.div
                                      className="p-6"
                                      initial={{ opacity: 0, y: -20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -20 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="text-sm font-semibold text-gray-900">Top-up Information</h4>
                                            <div className="mt-2 space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Reference:</span>
                                                <span className="font-medium">{selectedItem.reference}</span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="font-medium">
                                                  {formatCurrency(selectedItem.amount)}
                                                </span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Status:</span>
                                                <motion.div
                                                  style={getStatusStyle(selectedItem.status)}
                                                  className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                                >
                                                  <span
                                                    className="size-2 rounded-full"
                                                    style={{
                                                      backgroundColor:
                                                        selectedItem.status === "Confirmed"
                                                          ? "#589E67"
                                                          : selectedItem.status === "Pending"
                                                          ? "#F59E0B"
                                                          : "#AF4B4B",
                                                    }}
                                                  ></span>
                                                  {selectedItem.status}
                                                </motion.div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="text-sm font-semibold text-gray-900">Vendor Information</h4>
                                            <div className="mt-2 space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Vendor Name:</span>
                                                <span className="font-medium">{selectedItem.vendorName}</span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Top-up By:</span>
                                                <motion.div
                                                  style={getTopUpByStyle(selectedItem.topUpBy)}
                                                  className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                                >
                                                  {selectedItem.topUpBy}
                                                </motion.div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="text-sm font-semibold text-gray-900">Timestamps</h4>
                                            <div className="mt-2 space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Created:</span>
                                                <span className="font-medium">
                                                  {formatDate(selectedItem.createdAtUtc)}
                                                </span>
                                              </div>
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Confirmed:</span>
                                                <span className="font-medium">
                                                  {selectedItem.confirmedAtUtc
                                                    ? formatDate(selectedItem.confirmedAtUtc)
                                                    : "N/A"}
                                                </span>
                                              </div>
                                              {selectedItem.narrative && (
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-500">Narrative:</span>
                                                  <span className="font-medium">{selectedItem.narrative}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
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
                <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
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
                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pending", "Confirmed", "Failed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange("status", localFilters.status === status ? "" : status)}
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === status
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top-up By Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Top-up By</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Vendor", "Admin"].map((topUpBy) => (
                      <button
                        key={topUpBy}
                        onClick={() => handleFilterChange("topUpBy", localFilters.topUpBy === topUpBy ? "" : topUpBy)}
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.topUpBy === topUpBy
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {topUpBy}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      /* Toggle sort expansion if needed */
                    }}
                    className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  >
                    <span>Sort By</span>
                    <ChevronDown className="size-4" />
                  </button>

                  <div className="space-y-2">
                    {[
                      { label: "Reference A-Z", value: "reference", order: "asc" },
                      { label: "Reference Z-A", value: "reference", order: "desc" },
                      { label: "Vendor Name A-Z", value: "vendorName", order: "asc" },
                      { label: "Vendor Name Z-A", value: "vendorName", order: "desc" },
                      { label: "Amount Low-High", value: "amount", order: "asc" },
                      { label: "Amount High-Low", value: "amount", order: "desc" },
                      { label: "Date Newest", value: "createdAtUtc", order: "desc" },
                      { label: "Date Oldest", value: "createdAtUtc", order: "asc" },
                    ].map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option as SortOption)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                          localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                          <span className="text-purple-600">
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
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
                  <span className="font-medium">{totalRecords.toLocaleString()}</span>
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
    </motion.div>
  )
}

export default VendorTopUpHistory
