"use client"

import React, { Suspense, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearDebtRecoveryState,
  fetchDebtRecovery,
  fetchRecoveryPolicies,
  selectDebtRecovery,
  selectDebtRecoveryError,
  selectDebtRecoveryLoading,
  selectDebtRecoveryPagination,
} from "lib/redux/debtManagementSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { UserIcon } from "components/Icons/Icons"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

interface DebtRecoveryItem {
  id: number
  customerId: number
  customerName: string
  accountNumber: string
  paymentTransactionId: number
  paymentReference: string
  policyId: number
  policyName: string
  bucketName: string
  ageDays: number
  incomingAmount: number
  recoveryAmount: number
  outstandingBefore: number
  outstandingAfter: number
  recoveryPeriodKey: string
  recoveryType: number
  recoveryValue: number
  triggerThresholdAmount: number
  appliedBeforeBill: boolean
  ledgerEntryId: number
  createdAt: string
}

interface ActionDropdownProps {
  item: DebtRecoveryItem
  onViewDetails: (item: DebtRecoveryItem) => void
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface FilterState {
  customerId: number | undefined
  policyId: number | undefined
  fromUtc: string | undefined
  toUtc: string | undefined
  sortBy: string | undefined
  sortOrder: "asc" | "desc" | undefined
}

interface MobileFilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  localFilters: FilterState
  handleFilterChange: (key: string, value: string | number | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  policyOptions: { value: string; label: string }[]
  customerOptions: { value: string; label: string }[]
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
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
                onClick={() => {}}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Receipt
              </motion.button>

              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {}}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Download Report
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
      className="container mt-5 flex w-full flex-col rounded-md border bg-white p-3 sm:p-5"
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
          <div className="mb-2 h-8 w-40 rounded bg-gray-200 sm:w-48"></div>
          <div className="h-4 w-56 rounded bg-gray-200 sm:w-64"></div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-48"></div>
          <div className="h-10 w-24 rounded bg-gray-200 sm:w-28"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(9)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-3 sm:p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(9)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-3 py-2 sm:px-4 sm:py-3">
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section Skeleton */}
      <div className="flex flex-col items-center justify-between gap-3 border-t py-3 sm:flex-row">
        <div className="h-6 w-48 rounded bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200"></div>
          ))}
          <div className="size-8 rounded bg-gray-200"></div>
        </div>
        <div className="h-6 w-32 rounded bg-gray-200"></div>
      </div>
    </motion.div>
  )
}

// Mobile & All Screens Filter Sidebar Component (up to 2xl)
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  policyOptions,
  customerOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
}: MobileFilterSidebarProps) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-filter-sidebar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            key="mobile-filter-content"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex h-full w-full max-w-sm flex-col bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="flex shrink-0 items-center justify-between border-b bg-white p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">Filters & Sorting</h2>
                </div>
              </div>
              <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
                Clear All
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Customer Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                  <FormSelectModule
                    name="customerId"
                    value={localFilters.customerId?.toString() || ""}
                    onChange={(e) =>
                      handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={customerOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Policy Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Policy</label>
                  <FormSelectModule
                    name="policyId"
                    value={localFilters.policyId?.toString() || ""}
                    onChange={(e) =>
                      handleFilterChange("policyId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={policyOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                  <input
                    type="datetime-local"
                    name="fromUtc"
                    value={localFilters.fromUtc || ""}
                    onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                  <input
                    type="datetime-local"
                    name="toUtc"
                    value={localFilters.toUtc || ""}
                    onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSortExpanded((prev) => !prev)}
                    className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
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

            {/* Fixed Bottom Action Buttons */}
            <div className="shrink-0 border-t bg-white p-4">
              <div className="flex gap-3">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Wrapper component to handle search params with Suspense
const AllDebtRecovery: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllDebtRecoveryContent />
    </Suspense>
  )
}

const AllDebtRecoveryContent: React.FC = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    debtRecovery: recoveryData,
    loading,
    error,
    debtRecoveryPagination,
  } = useAppSelector((state) => ({
    debtRecovery: selectDebtRecovery(state),
    loading: selectDebtRecoveryLoading(state),
    error: selectDebtRecoveryError(state),
    debtRecoveryPagination: selectDebtRecoveryPagination(state),
  }))
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { feeders } = useAppSelector((state) => state.feeders)
  const { billingPeriods } = useAppSelector((state) => state.billingPeriods)
  const { recoveryPolicies } = useAppSelector((state) => state.debtManagement)
  const { customers } = useAppSelector((state) => state.customers)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedItem, setSelectedItem] = useState<DebtRecoveryItem | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    policyId: undefined as number | undefined,
    fromUtc: undefined as string | undefined,
    toUtc: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    customerId: undefined as number | undefined,
    policyId: undefined as number | undefined,
    fromUtc: undefined as string | undefined,
    toUtc: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  // Get pagination values from debt recovery state
  const currentPage = debtRecoveryPagination.currentPage
  const pageSize = debtRecoveryPagination.pageSize
  const totalRecords = debtRecoveryPagination.totalCount
  const totalPages = debtRecoveryPagination.totalPages || 1

  // Fetch debt recovery data on component mount and when search/pagination/appliedFilters change
  useEffect(() => {
    // Ensure valid pagination parameters
    const validPageNumber = Math.max(1, currentPage)
    const validPageSize = Math.max(1, pageSize)

    const fetchParams: any = {
      PageNumber: validPageNumber,
      PageSize: validPageSize,
      ...(appliedFilters.customerId && { CustomerId: appliedFilters.customerId }),
      ...(appliedFilters.policyId && { PolicyId: appliedFilters.policyId }),
      ...(appliedFilters.fromUtc && { FromUtc: appliedFilters.fromUtc }),
      ...(appliedFilters.toUtc && { ToUtc: appliedFilters.toUtc }),
    }

    dispatch(fetchDebtRecovery(fetchParams))
  }, [dispatch, currentPage, pageSize, appliedFilters])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearDebtRecoveryState())
    }
  }, [dispatch])

  const getRecoveryTypeStyle = (recoveryType: number) => {
    switch (recoveryType) {
      case 1:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case 2:
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case 3:
        return {
          backgroundColor: "#F4EDF7",
          color: "#954BAF",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    // Reset to first page when searching
    // Note: Search functionality might need to be implemented based on API capabilities
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
      // Reset to first page when searching
    }
  }

  // Fetch recovery policies on component mount
  useEffect(() => {
    dispatch(fetchRecoveryPolicies({ PageNumber: 1, PageSize: 100 }))
  }, [dispatch])

  // Fetch customers on component mount
  useEffect(() => {
    dispatch(fetchCustomers({ pageNumber: 1, pageSize: 100 }))
  }, [dispatch])

  // Generate policy options from recovery policies
  const generatePolicyOptions = () => {
    const options: { value: string; label: string }[] = [{ value: "", label: "All Policies" }]

    // Add actual recovery policies
    recoveryPolicies.forEach((policy) => {
      options.push({
        value: policy.id.toString(),
        label: policy.name,
      })
    })

    return options
  }

  // Generate customer options from customers
  const generateCustomerOptions = () => {
    const options: { value: string; label: string }[] = [{ value: "", label: "All Customers" }]

    // Add actual customers
    customers.forEach((customer) => {
      options.push({
        value: customer.id.toString(),
        label: `${customer.fullName} (${customer.accountNumber})`,
      })
    })

    return options
  }

  const policyOptions = generatePolicyOptions()
  const customerOptions = generateCustomerOptions()

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
    { label: "Account No Asc", value: "accountNumber", order: "asc" },
    { label: "Account No Desc", value: "accountNumber", order: "desc" },
    { label: "Recovery Amount Low-High", value: "recoveryAmount", order: "asc" },
    { label: "Recovery Amount High-Low", value: "recoveryAmount", order: "desc" },
    { label: "Age Days Asc", value: "ageDays", order: "asc" },
    { label: "Age Days Desc", value: "ageDays", order: "desc" },
    { label: "Newest", value: "createdAt", order: "desc" },
    { label: "Oldest", value: "createdAt", order: "asc" },
  ]

  // Handle individual filter changes (local state)
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  // Apply all filters at once
  const applyFilters = () => {
    setAppliedFilters({
      customerId: localFilters.customerId,
      policyId: localFilters.policyId,
      fromUtc: localFilters.fromUtc,
      toUtc: localFilters.toUtc,
      sortBy: localFilters.sortBy,
      sortOrder: localFilters.sortOrder,
    })
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      policyId: undefined,
      fromUtc: undefined,
      toUtc: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setAppliedFilters({
      customerId: undefined,
      policyId: undefined,
      fromUtc: undefined,
      toUtc: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setSearchText("")
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.customerId) count++
    if (localFilters.policyId) count++
    if (localFilters.fromUtc) count++
    if (localFilters.toUtc) count++
    if (localFilters.sortBy) count++
    return count
  }

  // Sync local filters with appliedFilters on mount
  useEffect(() => {
    setLocalFilters({
      customerId: appliedFilters.customerId,
      policyId: appliedFilters.policyId,
      fromUtc: appliedFilters.fromUtc,
      toUtc: appliedFilters.toUtc,
      sortBy: appliedFilters.sortBy || "",
      sortOrder: (appliedFilters.sortOrder as "asc" | "desc") || "asc",
    })
  }, []) // Only on mount

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      // Ensure valid pagination parameters
      const validPageNumber = Math.max(1, page)
      const validPageSize = Math.max(1, pageSize)

      // Update the current page in the component state
      // This will trigger the useEffect to fetch new data
      window.scrollTo(0, 0)
      // We need to trigger a re-fetch with the new page number
      const fetchParams: any = {
        PageNumber: validPageNumber,
        PageSize: validPageSize,
        ...(appliedFilters.customerId && { CustomerId: appliedFilters.customerId }),
        ...(appliedFilters.policyId && { PolicyId: appliedFilters.policyId }),
        ...(appliedFilters.fromUtc && { FromUtc: appliedFilters.fromUtc }),
        ...(appliedFilters.toUtc && { ToUtc: appliedFilters.toUtc }),
      }
      dispatch(fetchDebtRecovery(fetchParams))
    }
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    // Ensure valid pagination parameters
    const validPageNumber = 1
    const validPageSize = Math.max(1, newPageSize)

    // Reset to first page when changing page size
    const fetchParams: any = {
      PageNumber: validPageNumber,
      PageSize: validPageSize,
      ...(appliedFilters.customerId && { CustomerId: appliedFilters.customerId }),
      ...(appliedFilters.policyId && { PolicyId: appliedFilters.policyId }),
      ...(appliedFilters.fromUtc && { FromUtc: appliedFilters.fromUtc }),
      ...(appliedFilters.toUtc && { ToUtc: appliedFilters.toUtc }),
    }
    dispatch(fetchDebtRecovery(fetchParams))
  }

  const handleViewItemDetails = (item: DebtRecoveryItem) => {
    router.push(`/debt-recovery/${item.id}`)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
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

  if (loading)
    return (
      <div className="flex items-center justify-center px-3 2xl:container sm:px-4 md:px-6 2xl:px-16">
        <LoadingSkeleton />
      </div>
    )
  if (error) return <div className="p-4 text-red-500">Error loading bills data: {error}</div>

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6   2xl:mt-5 2xl:flex-row ">
        {/* Main Content - Bills Table */}
        <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="items-center justify-between border-b py-2 md:flex md:py-4"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
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

              <div>
                <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Debt Recovery</p>
                <p className="text-sm text-gray-600">Manage and monitor all debt recovery activities</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-64 md:w-[380px]">
                <SearchModule
                  value={searchInput}
                  onChange={handleSearch}
                  onCancel={handleCancelSearch}
                  onSearch={handleManualSearch}
                  placeholder="Search by customer, account or reference..."
                  className="w-full"
                  bgClassName="bg-white"
                />
              </div>

              {/* Hide/Show Filters button - Desktop only (2xl and above) */}
              <button
                type="button"
                onClick={() => setShowDesktopFilters((prev) => !prev)}
                className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
              >
                {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                {showDesktopFilters ? "Hide filters" : "Show filters"}
                {getActiveFilterCount() > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          {recoveryData.length === 0 ? (
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
                {searchText ? "No matching recovery records found" : "No recovery records available"}
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
                <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                  <thead>
                    <tr>
                      <th
                        className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("customerName")}
                      >
                        <div className="flex items-center gap-2">
                          Customer <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("policyName")}
                      >
                        <div className="flex items-center gap-2">
                          Policy <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("recoveryAmount")}
                      >
                        <div className="flex items-center gap-2">
                          Recovery Amount <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("recoveryType")}
                      >
                        <div className="flex items-center gap-2">
                          Recovery Type <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("createdAt")}
                      >
                        <div className="flex items-center gap-2">
                          Recovery Date <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("ageDays")}
                      >
                        <div className="flex items-center gap-2">
                          Age Days <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("incomingAmount")}
                      >
                        <div className="flex items-center gap-2">
                          Payment Details <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("recoveryValue")}
                      >
                        <div className="flex items-center gap-2">
                          Recovery Rate <RxCaretSort />
                        </div>
                      </th>
                      {/* <th className="shadow-[ -4px_0_8px_-2px_rgba(0,0,0,0.1)] sticky right-0 z-10 whitespace-nowrap border-b bg-white p-4 text-sm">
                        <div className="flex items-center gap-2">Actions</div>
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {recoveryData.map((item: DebtRecoveryItem, index: number) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="whitespace-nowrap border-b px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-gray-100">
                              <UserIcon />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.customerName}</div>
                              <div className="text-xs text-gray-500">{item.accountNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.policyName}</div>
                            <div className="text-xs text-gray-500">{item.paymentReference}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatCurrency(item.recoveryAmount)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                          <motion.div
                            style={getRecoveryTypeStyle(item.recoveryType)}
                            className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor: getRecoveryTypeStyle(item.recoveryType).color,
                              }}
                            ></span>
                            {item.bucketName}
                          </motion.div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                          <div className="text-sm font-medium text-gray-900">{item.ageDays} days</div>
                          <div className="text-xs text-gray-500">{item.recoveryPeriodKey}</div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(item.incomingAmount)}</div>
                          <div className="text-xs text-gray-500">
                            Outstanding: {formatCurrency(item.outstandingAfter)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                          <div>
                            <div className="font-medium">{item.recoveryValue}%</div>
                            <div className="text-xs text-gray-500">
                              Applied: {item.appliedBeforeBill ? "Before Bill" : "After Bill"}
                            </div>
                          </div>
                        </td>
                        {/* <td className="shadow-[ -4px_0_8px_-2px_rgba(0,0,0,0.1)] sticky right-0 z-10 whitespace-nowrap border-b bg-white px-4 py-2 text-sm shadow-md">
                          <div className="flex items-center gap-2">
                            <ButtonModule
                              size="sm"
                              icon={<VscEye />}
                              iconPosition="start"
                              onClick={() => handleViewItemDetails(item)}
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              <span className="hidden sm:inline">View</span>
                              <span className="sm:hidden">View</span>
                            </ButtonModule>
                          </div>
                        </td> */}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                <div className="flex items-center gap-1 max-sm:hidden">
                  <p className="text-xs sm:text-sm">Show rows</p>
                  <select value={pageSize} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1 text-xs sm:text-sm">
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
                            className={`flex size-6 items-center justify-center rounded-md text-xs sm:h-7 sm:w-8 sm:text-sm ${
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
                            className={`flex size-6 items-center justify-center rounded-md text-xs ${
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
                  Page {currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()} total entries)
                  {searchText.trim() && " - filtered"}
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Desktop Filters Sidebar (2xl and above) - Toggleable */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full flex-col rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:flex 2xl:w-80 2xl:self-start"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-3 md:pb-4">
              <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
              >
                <X className="size-3 md:size-4" />
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                <FormSelectModule
                  name="customerId"
                  value={localFilters.customerId?.toString() || ""}
                  onChange={(e) =>
                    handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={customerOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Policy Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Policy</label>
                <FormSelectModule
                  name="policyId"
                  value={localFilters.policyId?.toString() || ""}
                  onChange={(e) => handleFilterChange("policyId", e.target.value ? Number(e.target.value) : undefined)}
                  options={policyOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                <input
                  type="datetime-local"
                  name="fromUtc"
                  value={localFilters.fromUtc || ""}
                  onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                <input
                  type="datetime-local"
                  name="toUtc"
                  value={localFilters.toUtc || ""}
                  onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
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
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 shrink-0 space-y-3 border-t pt-4">
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
            <div className="mt-4 shrink-0 rounded-lg bg-gray-50 p-3 md:mt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{totalRecords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {currentPage} / {totalPages || 1}
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
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        policyOptions={policyOptions}
        customerOptions={customerOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </>
  )
}

export default AllDebtRecovery
