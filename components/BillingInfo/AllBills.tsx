"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearError, clearFilters, fetchPostpaidBills, setFilters, setPagination } from "lib/redux/postpaidSlice"
import { fetchAreaOffices, clearAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchFeeders, clearFeeders } from "lib/redux/feedersSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { AddCustomerIcon, MapIcon, UserIcon } from "components/Icons/Icons"
import { PlusCircle, ArrowLeft, Filter, X, SortAsc, SortDesc } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

interface ActionDropdownProps {
  bill: Bill
  onViewDetails: (bill: Bill) => void
  onUpdateBill: (billId: number) => void
}

// Use the PostpaidBill interface from your slice and transform to our Bill interface
interface PostpaidBill {
  id: number
  customerName: string
  customerAccountNumber: string
  period: string
  name?: string
  totalDue: number
  status: number
  dueDate?: string
  createdAt?: string
  category: number
  feederName?: string
  areaOfficeName?: string
  consumptionKwh?: number
  tariffPerKwh?: number
}

interface Bill {
  id: number
  customerName: string
  accountNumber: string
  billingCycle: string
  name: string
  amount: string
  status: "Paid" | "Pending" | "Overdue" | "Cancelled"
  dueDate: string
  issueDate: string
  customerType: "Residential" | "Commercial" | "Industrial"
  location: string
  consumption: string
  tariff: string
}

interface AllBillsProps {
  onViewBillDetails?: (bill: Bill) => void
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ bill, onViewDetails, onUpdateBill }) => {
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
    onViewDetails(bill)
    setIsOpen(false)
  }

  const handleUpdateBill = (e: React.MouseEvent) => {
    e.preventDefault()
    onUpdateBill(bill.id)
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
                onClick={handleUpdateBill}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Bill
              </motion.button>

              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {}}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Download PDF
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
  periodOptions,
  statusOptions,
  categoryOptions,
  areaOfficeOptions,
  feederOptions,
  sortOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  periodOptions: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string | number; label: string }>
  categoryOptions: Array<{ value: string | number; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  feederOptions: Array<{ value: string | number; label: string }>
  sortOptions: SortOption[]
}) => {
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
            className="flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-3">
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

            {/* Filter Content */}
            <div className="space-y-4 pb-20">
              {/* Period Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Period</label>
                <FormSelectModule
                  name="period"
                  value={localFilters.period || ""}
                  onChange={(e) => handleFilterChange("period", e.target.value || undefined)}
                  options={periodOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="status"
                  value={localFilters.status !== undefined ? localFilters.status : ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value === "" ? undefined : Number(e.target.value))
                  }
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Category</label>
                <FormSelectModule
                  name="category"
                  value={localFilters.category !== undefined ? localFilters.category : ""}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value === "" ? undefined : Number(e.target.value))
                  }
                  options={categoryOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Area Office Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                <FormSelectModule
                  name="areaOfficeId"
                  value={localFilters.areaOfficeId || ""}
                  onChange={(e) => handleFilterChange("areaOfficeId", e.target.value || undefined)}
                  options={areaOfficeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Feeder Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder</label>
                <FormSelectModule
                  name="feederId"
                  value={localFilters.feederId || ""}
                  onChange={(e) => handleFilterChange("feederId", e.target.value || undefined)}
                  options={feederOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
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
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="sticky bottom-0 border-t bg-white p-4 shadow-xl 2xl:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const AllBills: React.FC<AllBillsProps> = ({ onViewBillDetails }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { bills, loading, error, pagination, filters } = useAppSelector((state) => state.postpaidBilling)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { feeders } = useAppSelector((state) => state.feeders)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    period: "",
    status: undefined as number | undefined,
    category: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Get pagination values from Redux state
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize
  const totalRecords = pagination.totalCount
  const totalPages = pagination.totalPages || 1

  // Fetch area offices and feeders on component mount for filter dropdowns
  useEffect(() => {
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )

    dispatch(
      fetchFeeders({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Cleanup function to clear states when component unmounts
    return () => {
      dispatch(clearAreaOffices())
      dispatch(clearFeeders())
    }
  }, [dispatch])

  // Fetch bills on component mount and when search/pagination/filters change
  useEffect(() => {
    const fetchParams: any = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(searchText && { accountNumber: searchText }),
      ...(filters.period && { period: filters.period }),
      ...(filters.status !== undefined && { status: filters.status }),
      ...(filters.category !== undefined && { category: filters.category }),
      ...(filters.areaOfficeId && { areaOfficeId: filters.areaOfficeId }),
      ...(filters.feederId && { feederId: filters.feederId }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
    }

    dispatch(fetchPostpaidBills(fetchParams))
  }, [dispatch, currentPage, pageSize, searchText, filters])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const getStatusStyle = (status: Bill["status"]) => {
    switch (status) {
      case "Paid":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "Pending":
        return {
          backgroundColor: "#EDF2FE",
          color: "#4976F4",
        }
      case "Overdue":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "Cancelled":
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

  const getCustomerTypeStyle = (type: Bill["customerType"]) => {
    switch (type) {
      case "Residential":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "Commercial":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "Industrial":
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
    setSearchText(value)
    if (value.trim()) {
      dispatch(setFilters({ accountNumber: value.trim() }))
    } else {
      dispatch(clearFilters())
    }
    // Reset to first page when searching
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(clearFilters())
    // Reset to first page when clearing search
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const generatePeriodOptions = () => {
    const options: { value: string; label: string }[] = [{ value: "", label: "All Periods" }]

    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    })

    // Include current month + next 12 months
    for (let i = 0; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const value = `${year}-${month}`
      const label = formatter.format(date)

      options.push({ value, label })
    }

    const existingPeriods = Array.from(new Set(bills.map((bill) => bill.period)))
    existingPeriods.forEach((period) => {
      const alreadyExists = options.some((opt) => opt.value === period)
      if (!alreadyExists && period) {
        let label = period
        const match = /^([0-9]{4})-([0-9]{2})$/.exec(period)
        if (match && match[1] && match[2]) {
          const year = parseInt(match[1], 10)
          const monthIndex = parseInt(match[2], 10) - 1
          const date = new Date(year, monthIndex, 1)
          label = formatter.format(date)
        }
        options.push({ value: period, label })
      }
    })

    return options
  }

  const periodOptions = generatePeriodOptions()

  // Status options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: 1, label: "Paid" },
    { value: 2, label: "Pending" },
    { value: 3, label: "Overdue" },
    { value: 4, label: "Cancelled" },
  ]

  // Category options
  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: 1, label: "Residential" },
    { value: 2, label: "Commercial" },
    { value: 3, label: "Industrial" },
  ]

  // Area office options
  const areaOfficeOptions = [
    { value: "", label: "All Area Offices" },
    ...areaOffices.map((office) => ({
      value: office.id,
      label: `${office.nameOfNewOAreaffice} (${office.newKaedcoCode})`,
    })),
  ]

  // Feeder options
  const feederOptions = [
    { value: "", label: "All Feeders" },
    ...feeders.map((feeder) => ({
      value: feeder.id,
      label: `${feeder.name} (${feeder.kaedcoFeederCode})`,
    })),
  ]

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
    { label: "Account No Asc", value: "customerAccountNumber", order: "asc" },
    { label: "Account No Desc", value: "customerAccountNumber", order: "desc" },
    { label: "Amount Low-High", value: "totalDue", order: "asc" },
    { label: "Amount High-Low", value: "totalDue", order: "desc" },
    { label: "Due Date Asc", value: "dueDate", order: "asc" },
    { label: "Due Date Desc", value: "dueDate", order: "desc" },
    { label: "Newest", value: "createdAt", order: "desc" },
    { label: "Oldest", value: "createdAt", order: "asc" },
    { label: "Period Asc", value: "period", order: "asc" },
    { label: "Period Desc", value: "period", order: "desc" },
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
    dispatch(
      setFilters({
        period: localFilters.period || undefined,
        status: localFilters.status,
        category: localFilters.category,
        areaOfficeId: localFilters.areaOfficeId,
        feederId: localFilters.feederId,
        sortBy: localFilters.sortBy || undefined,
        sortOrder: localFilters.sortOrder || undefined,
      })
    )
    dispatch(setPagination({ page: 1, pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      period: "",
      status: undefined,
      category: undefined,
      areaOfficeId: undefined,
      feederId: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setSearchText("")
    dispatch(clearFilters())
    dispatch(setPagination({ page: 1, pageSize }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.period) count++
    if (localFilters.status !== undefined) count++
    if (localFilters.category !== undefined) count++
    if (localFilters.areaOfficeId) count++
    if (localFilters.feederId) count++
    if (localFilters.sortBy) count++
    return count
  }

  // Sync local filters with Redux filters on mount
  useEffect(() => {
    setLocalFilters({
      period: filters.period || "",
      status: filters.status,
      category: filters.category,
      areaOfficeId: filters.areaOfficeId,
      feederId: filters.feederId,
      sortBy: filters.sortBy || "",
      sortOrder: (filters.sortOrder as "asc" | "desc") || "asc",
    })
  }, []) // Only on mount

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      setPagination({
        page: 1,
        pageSize: newPageSize,
      })
    )
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      dispatch(
        setPagination({
          page,
          pageSize: pagination.pageSize,
        })
      )
    }
  }

  const handleViewBillDetails = (bill: Bill) => {
    router.push(`/billing/bills/${bill.id}`)
    onViewBillDetails?.(bill)
  }

  const handleUpdateBill = (billId: number) => {
    router.push(`/billing/bills/update/${billId}`)
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

  const formatCurrency = (amount: string) => {
    // If amount already has ₦ symbol, return as is
    if (amount.includes("₦")) return amount

    // Otherwise try to parse as number
    const num = parseFloat(amount.replace(/[^0-9.-]+/g, ""))
    if (isNaN(num)) return amount

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(num)
  }

  // Transform API PostpaidBill data to component Bill format
  const transformApiBillsToTableBills = (): Bill[] => {
    if (!bills || bills.length === 0) {
      return []
    }

    return bills.map((apiBill) => {
      // Determine status based on bill data
      let status: "Paid" | "Pending" | "Overdue" | "Cancelled" = "Pending"

      // Map your API status to component status
      if (apiBill.status === 1) status = "Paid"
      else if (apiBill.status === 2) status = "Pending"
      else if (apiBill.status === 3) status = "Overdue"
      else if (apiBill.status === 4) status = "Cancelled"

      // Determine customer type based on category
      let customerType: "Residential" | "Commercial" | "Industrial" = "Residential"
      if (apiBill.category === 1) customerType = "Residential"
      else if (apiBill.category === 2) customerType = "Commercial"
      else if (apiBill.category === 3) customerType = "Industrial"

      // Format amount
      const amount = `₦${(apiBill.totalDue || 0).toLocaleString()}`

      // Format consumption
      const consumption = `${apiBill.consumptionKwh || 0} kWh`

      // Use feeder name or area office as location
      const location = apiBill.feederName || apiBill.areaOfficeName || "Unknown"

      // Format dates - ensure we always return a string, never undefined
      const formatApiDate = (dateString?: string) => {
        try {
          const date = new Date(dateString ?? new Date())
          return date.toISOString().split("T")[0]
        } catch {
          return new Date().toISOString().split("T")[0]
        }
      }

      return {
        id: apiBill.id,
        customerName: apiBill.customerName || "Unknown Customer",
        accountNumber: apiBill.customerAccountNumber || "N/A",
        billingCycle: apiBill.period || "Unknown Period",
        name: apiBill.name || "Unnamed Bill",
        amount,
        status,
        dueDate: formatApiDate(apiBill.dueDate),
        issueDate: formatApiDate(apiBill.createdAt),
        customerType,
        location,
        consumption,
        tariff: `₦${apiBill.tariffPerKwh || 0}/kWh`,
      } as Bill
    })
  }

  const tableBills = transformApiBillsToTableBills()

  // Bills to display in the table (API data only)
  const displayBills = tableBills

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = pagination.currentPage
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
    const current = pagination.currentPage
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
      <div className="container flex items-center justify-center px-3 xl:px-16">
        <LoadingSkeleton />
      </div>
    )
  if (error) return <div className="p-4 text-red-500">Error loading bills data: {error}</div>

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 px-3 xl:px-16 2xl:mt-5 2xl:flex-row">
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
                <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">All Bills</p>
                <p className="text-sm text-gray-600">Manage and monitor all customer bills and payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-64 md:w-[380px]">
                <SearchModule
                  value={searchText}
                  onChange={handleSearch}
                  onCancel={handleCancelSearch}
                  placeholder="Search by customer, account or period..."
                  className="w-full"
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
          </motion.div>

          {displayBills.length === 0 ? (
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
                {searchText ? "No matching bills found" : "No bills available"}
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
                        onClick={() => toggleSort("billingCycle")}
                      >
                        <div className="flex items-center gap-2">
                          Billing Cycle <RxCaretSort />
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
                        onClick={() => toggleSort("dueDate")}
                      >
                        <div className="flex items-center gap-2">
                          Due Date <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("customerType")}
                      >
                        <div className="flex items-center gap-2">
                          Customer Type <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("location")}
                      >
                        <div className="flex items-center gap-2">
                          Location <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("consumption")}
                      >
                        <div className="flex items-center gap-2">
                          Consumption <RxCaretSort />
                        </div>
                      </th>
                      <th className="whitespace-nowrap border-b p-4 text-sm">
                        <div className="flex items-center gap-2">Actions</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBills.map((bill: Bill, index: number) => (
                      <motion.tr
                        key={bill.id}
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
                              <div className="text-sm font-medium text-gray-900">{bill.customerName}</div>
                              <div className="text-xs text-gray-500">{bill.accountNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{bill.name}</div>
                            <div className="text-xs text-gray-500">{bill.billingCycle}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatCurrency(bill.amount)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                          <motion.div
                            style={getStatusStyle(bill.status)}
                            className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor: getStatusStyle(bill.status).color,
                              }}
                            ></span>
                            {bill.status}
                          </motion.div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                          {formatDate(bill.dueDate)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                          <motion.div
                            style={getCustomerTypeStyle(bill.customerType)}
                            className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            {bill.customerType}
                          </motion.div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapIcon />
                            {bill.location}
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                          <div>
                            <div className="font-medium">{bill.consumption}</div>
                            <div className="text-xs text-gray-500">{bill.tariff}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <ButtonModule
                              size="sm"
                              onClick={() => handleViewBillDetails(bill)}
                              variant="primary"
                              className="text-xs sm:text-sm"
                            >
                              <span className="hidden sm:inline">View</span>
                              <span className="sm:hidden">View</span>
                            </ButtonModule>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

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
                      pagination.currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                    }`}
                    onClick={() => changePage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
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
                              pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
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
                              pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
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
                      pagination.currentPage === totalPages || totalPages === 0
                        ? "cursor-not-allowed text-gray-400"
                        : "text-[#000000]"
                    }`}
                    onClick={() => changePage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === totalPages || totalPages === 0}
                  >
                    <BiSolidRightArrow className="size-4 sm:size-5" />
                  </button>
                </div>

                <p className="text-center text-xs text-gray-600 sm:text-right sm:text-sm">
                  Page {pagination.currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()} total entries)
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
            className="hidden w-full rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:block 2xl:w-80"
          >
            <div className="mb-4 flex items-center justify-between border-b pb-3 md:pb-4">
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
              {/* Period Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Period</label>
                <FormSelectModule
                  name="period"
                  value={localFilters.period || ""}
                  onChange={(e) => handleFilterChange("period", e.target.value || undefined)}
                  options={periodOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="status"
                  value={localFilters.status !== undefined ? localFilters.status : ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value === "" ? undefined : Number(e.target.value))
                  }
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Category</label>
                <FormSelectModule
                  name="category"
                  value={localFilters.category !== undefined ? localFilters.category : ""}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value === "" ? undefined : Number(e.target.value))
                  }
                  options={categoryOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Area Office Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                <FormSelectModule
                  name="areaOfficeId"
                  value={localFilters.areaOfficeId || ""}
                  onChange={(e) => handleFilterChange("areaOfficeId", e.target.value || undefined)}
                  options={areaOfficeOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Feeder Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder</label>
                <FormSelectModule
                  name="feederId"
                  value={localFilters.feederId || ""}
                  onChange={(e) => handleFilterChange("feederId", e.target.value || undefined)}
                  options={feederOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Sort By</label>
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3 border-t pt-4">
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
            <div className="mt-4 rounded-lg bg-gray-50 p-3 md:mt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{totalRecords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {pagination.currentPage} / {totalPages || 1}
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
        periodOptions={periodOptions}
        statusOptions={statusOptions}
        categoryOptions={categoryOptions}
        areaOfficeOptions={areaOfficeOptions}
        feederOptions={feederOptions}
        sortOptions={sortOptions}
      />
    </>
  )
}

export default AllBills
