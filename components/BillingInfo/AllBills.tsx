"use client"

import React, { Suspense, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearError, clearFilters, fetchPostpaidBills, setFilters, setPagination } from "lib/redux/postpaidSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearFeeders, fetchFeeders } from "lib/redux/feedersSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { MapIcon, UserIcon } from "components/Icons/Icons"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, Printer, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { VscEye } from "react-icons/vsc"
import PostpaidBillDetailsModal from "components/ui/Modal/postpaid-bill-modal"

export enum BillStatus {
  Draft = 0,
  Published = 1,
  Reversed = 2,
}

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
  openingBalance?: number
  netAreas?: number
  closingBalance?: number
}

interface Bill {
  id: number
  customerName: string
  accountNumber: string
  billingCycle: string
  name: string
  amount: string
  status: BillStatus
  dueDate: string
  issueDate: string
  customerType: "Residential" | "Commercial" | "Industrial"
  location: string
  consumption: string
  tariff: string
  openingBalance: string
  netAreas: string
  closingBalance: string
  energyKwh: string
}

interface AllBillsProps {
  onViewBillDetails?: (bill: Bill) => void
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface FilterState {
  billingPeriodId: number | undefined
  status: number | undefined
  category: number | undefined
  areaOfficeId: number | undefined
  feederId: number | undefined
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
  billingPeriodOptions: { value: string; label: string }[]
  statusOptions: { value: string | number; label: string }[]
  categoryOptions: { value: string | number; label: string }[]
  areaOfficeOptions: { value: string; label: string }[]
  feederOptions: { value: string; label: string }[]
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
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
              {[...Array(10)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-3 sm:p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(10)].map((_, cellIndex) => (
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
  billingPeriodOptions,
  statusOptions,
  categoryOptions,
  areaOfficeOptions,
  feederOptions,
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
                {/* Billing Period Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Billing Period</label>
                  <FormSelectModule
                    name="billingPeriodId"
                    value={localFilters.billingPeriodId?.toString() || ""}
                    onChange={(e) =>
                      handleFilterChange("billingPeriodId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={billingPeriodOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => {
                        const statusValue = Number(option.value)
                        return (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "status",
                                localFilters.status === statusValue ? undefined : statusValue
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.status === statusValue
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOptions
                      .filter((opt) => opt.value !== "")
                      .map((option) => {
                        const categoryValue = Number(option.value)
                        return (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleFilterChange(
                                "category",
                                localFilters.category === categoryValue ? undefined : categoryValue
                              )
                            }
                            className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                              localFilters.category === categoryValue
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                  </div>
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
const AllBillsWithSearchParams: React.FC<AllBillsProps> = (props) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllBillsContent {...props} />
    </Suspense>
  )
}

const AllBillsContent: React.FC<AllBillsProps> = ({ onViewBillDetails }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { bills, loading, error, pagination, filters } = useAppSelector((state) => state.postpaidBilling)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { feeders } = useAppSelector((state) => state.feeders)
  const { billingPeriods } = useAppSelector((state) => state.billingPeriods)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchTrigger, setSearchTrigger] = useState(0)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // State for PostpaidBillDetailsModal
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [modalBill, setModalBill] = useState<PostpaidBill | null>(null)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    billingPeriodId: undefined as number | undefined,
    status: undefined as number | undefined,
    category: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    billingPeriodId: undefined as number | undefined,
    status: undefined as number | undefined,
    category: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  // Get pagination values from Redux state
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize
  const totalRecords = pagination.totalCount
  const totalPages = pagination.totalPages || 1

  // Fetch area offices, feeders, and billing periods on component mount for filter dropdowns
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

    dispatch(
      fetchBillingPeriods({
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

  // Fetch bills on component mount and when search/pagination/appliedFilters change
  // Note: searchText only updates local state, search triggers when button is clicked
  useEffect(() => {
    const fetchParams: any = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(searchText && { accountNumber: searchText }),
      ...(appliedFilters.billingPeriodId && { billingPeriodId: appliedFilters.billingPeriodId }),
      ...(appliedFilters.status !== undefined && { status: appliedFilters.status }),
      ...(appliedFilters.category !== undefined && { category: appliedFilters.category }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.feederId && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    dispatch(fetchPostpaidBills(fetchParams))
  }, [dispatch, currentPage, pageSize, appliedFilters, searchTrigger])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const getStatusStyle = (status: BillStatus) => {
    switch (status) {
      case BillStatus.Draft:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      case BillStatus.Published:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case BillStatus.Reversed:
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
  }

  const handleManualSearch = () => {
    if (searchText.trim()) {
      dispatch(setFilters({ accountNumber: searchText.trim() }))
    } else {
      dispatch(clearFilters())
    }
    // Reset to first page when searching
    dispatch(setPagination({ page: 1, pageSize }))
    setSearchTrigger((prev) => prev + 1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(clearFilters())
    // Reset to first page when clearing search
    dispatch(setPagination({ page: 1, pageSize }))
    setSearchTrigger((prev) => prev + 1)
  }

  const generateBillingPeriodOptions = () => {
    const options: { value: string; label: string }[] = [{ value: "", label: "All Periods" }]

    billingPeriods.forEach((period) => {
      options.push({
        value: period.id.toString(),
        label: period.displayName || period.periodKey,
      })
    })

    return options
  }

  const billingPeriodOptions = generateBillingPeriodOptions()

  // Status options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: BillStatus.Draft, label: "Draft" },
    { value: BillStatus.Published, label: "Published" },
    { value: BillStatus.Reversed, label: "Reversed" },
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
      value: office.id.toString(),
      label: `${office.nameOfNewOAreaffice} (${office.newKaedcoCode})`,
    })),
  ]

  // Feeder options
  const feederOptions = [
    { value: "", label: "All Feeders" },
    ...feeders.map((feeder) => ({
      value: feeder.id.toString(),
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
    setAppliedFilters({
      billingPeriodId: localFilters.billingPeriodId,
      status: localFilters.status,
      category: localFilters.category,
      areaOfficeId: localFilters.areaOfficeId,
      feederId: localFilters.feederId,
      sortBy: localFilters.sortBy,
      sortOrder: localFilters.sortOrder,
    })
    dispatch(setPagination({ page: 1, pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      billingPeriodId: undefined,
      status: undefined,
      category: undefined,
      areaOfficeId: undefined,
      feederId: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setAppliedFilters({
      billingPeriodId: undefined,
      status: undefined,
      category: undefined,
      areaOfficeId: undefined,
      feederId: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setSearchText("")
    dispatch(clearFilters())
    dispatch(setPagination({ page: 1, pageSize }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.billingPeriodId) count++
    if (localFilters.status !== undefined) count++
    if (localFilters.category !== undefined) count++
    if (localFilters.areaOfficeId) count++
    if (localFilters.feederId) count++
    if (localFilters.sortBy) count++
    return count
  }

  // Sync local filters with appliedFilters on mount
  useEffect(() => {
    setLocalFilters({
      billingPeriodId: appliedFilters.billingPeriodId,
      status: appliedFilters.status,
      category: appliedFilters.category,
      areaOfficeId: appliedFilters.areaOfficeId,
      feederId: appliedFilters.feederId,
      sortBy: appliedFilters.sortBy || "",
      sortOrder: (appliedFilters.sortOrder as "asc" | "desc") || "asc",
    })
  }, []) // Only on mount

  // Handle URL search parameters for billing period filtering
  useEffect(() => {
    const billingPeriodIdParam = searchParams.get("billingPeriodId")
    if (billingPeriodIdParam && Number(billingPeriodIdParam) !== filters.billingPeriodId) {
      dispatch(setFilters({ billingPeriodId: Number(billingPeriodIdParam) }))
    }
  }, [searchParams, dispatch, filters.billingPeriodId])

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

  const handlePrintBills = () => {
    // Get the first 10 bills (or all bills if less than 10)
    const billsToPrint = bills.slice(0, 10)

    if (billsToPrint.length === 0) {
      alert("No bills available to print")
      return
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups to print bills")
      return
    }

    // Helper functions for formatting
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const formatShortDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    }

    const getCustomerStatusLabel = (code?: string | null) => {
      switch (code) {
        case "02":
          return "Active"
        case "04":
          return "Suspended"
        case "05":
          return "PPM"
        case "07":
          return "Inactive"
        default:
          return code || "Unknown"
      }
    }

    // Generate barcode data URL for the account number
    const generateBarcodeDataURL = (accountNumber: string) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return ""

      const value = String(accountNumber || "")

      // Canvas sizing for crisp lines
      const width = 220
      const height = 60
      canvas.width = width
      canvas.height = height

      // Background
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, width, height)

      // Basic hash from the value to vary bar patterns
      let hash = 0
      for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0
      }

      const barWidth = 2
      const totalBars = Math.floor(width / barWidth)

      for (let i = 0; i < totalBars; i++) {
        // Derive a pseudo-random pattern from the hash and index
        const bit = (hash >> i % 32) & 1
        if (bit === 1) {
          ctx.fillStyle = "#000000"
          ctx.fillRect(i * barWidth, 4, barWidth, height - 16)
        }
      }

      // Draw the human-readable value below the bars
      ctx.fillStyle = "#000000"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText(value, width / 2, height - 2)

      return canvas.toDataURL()
    }

    const billsHtml = billsToPrint
      .map((bill, index) => {
        const pageBreak = index < billsToPrint.length - 1 ? '<div style="page-break-after: always;"></div>' : ""
        const barcodeDataURL = generateBarcodeDataURL(bill.customerAccountNumber)

        return `
        <div class="a5-container">
          <div class="relative flex-1 overflow-y-auto print:overflow-visible">
            <div class="a5-content relative z-10 p-8 print:p-4">
              <div class="w-full print:p-0">
                <!-- Header - A5 Optimized -->
                <div class="a5-header mb-3 flex items-center justify-between print:mb-2">
                  <div class="w-24 text-center print:w-20">
                    <img src="/kad.svg" alt="KAD-ELEC Logo" class="h-10 print:hidden" />
                  </div>

                  <div class="flex flex-1 justify-center">
                    <img src="${barcodeDataURL}" alt="Barcode for ${
                      bill.customerAccountNumber
                    }" class="h-12 w-40 print:h-10 print:w-36" />
                  </div>

                  <div class="w-24 text-center print:w-20">
                    <h1 class="mb-1 text-[9pt] font-bold text-gray-900 print:hidden">KAD-ELEC.</h1>
                    <div class="bg-[#6EAD2A] p-1 text-xs font-semibold text-white print:bg-white print:py-0.5 print:text-[7pt] print:text-black">
                      #${bill.customerAccountNumber}
                    </div>
                  </div>
                </div>

                <!-- Billing Information -->
                <div class="a5-section">
                  <div class="print:bg-white print:text-black flex w-full items-center justify-center bg-[#004B23] p-1.5 text-xs font-semibold text-white">
                    <p></p>
                  </div>

                  <div class="print-no-border flex w-full border border-gray-300 bg-white text-[8pt] print:text-[7pt]">
                    <div class="print-no-border-r w-3/5 space-y-0.5 border-r border-gray-300">
                      <div class="print-bg-light-green print-white-text flex w-full items-center justify-between bg-[#6CAD2B] px-2 py-1 font-semibold">
                        <p class="print-hide-label"></p>
                        <div class="flex items-center justify-center bg-white px-4 text-center print:flex-grow print:justify-end">
                          <p class="print-show-value text-black">
                            ${bill.areaOfficeName || "-"}
                          </p>
                        </div>
                      </div>

                      <div class="space-y-2 px-2 ">
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Bill #:</span>
                          <span class="print-show-value px-2 font-semibold">${bill.id}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Bill Month:</span>
                          <span class="print-show-value px-2 font-semibold">${bill.name || bill.period}</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Customer Account:</span>
                          <span class="print-show-value px-2 font-semibold">${bill.customerAccountNumber}</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Account Name:</span>
                          <span class="print-show-value px-2 font-semibold">${bill.customerName}</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Address:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Phone Number:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class=" flex justify-between">
                          <span class="print-hide-label font-semibold">City:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                      </div>
                    </div>

                    <div class="w-2/5 space-y-0.5">
                      <div class="print-white-text flex w-full items-center justify-between bg-[#008001] px-2 py-1 font-semibold print:bg-white print:text-black">
                        <p class="print:invisible"></p>
                        <div class="flex items-center justify-center bg-white px-4 print:flex-grow print:justify-end">
                          <p class="print-show-value text-[7pt] text-black">-</p>
                        </div>
                      </div>

                      <div class="space-y-2 px-2">
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">State:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">11KV Feeder:</span>
                          <span class="print-show-value px-2 font-semibold">${bill.feederName || "-"}</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">33KV Feeder:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">DT Name:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Sales Rep:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Meter:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Multiplier:</span>
                          <span class="print-show-value px-2 font-semibold">1.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Billing Charges -->
                <div class="a5-section -mt-2">
                  <div class="print-bg-green print-white-text flex w-full items-center justify-center bg-[#004B23] p-1.5 text-xs font-semibold text-white print:bg-white print:text-black">
                    <p class="print:invisible"></p>
                  </div>

                  <div class="print-no-border flex w-full border border-gray-300 bg-white text-[8pt] print:text-[7pt]">
                    <div class="print-no-border-r w-3/5 space-y-0.5 border-r border-gray-300">
                      <div class="print-bg-light-green print-white-text flex w-full items-center justify-between bg-[#6CAD2B] px-2 py-1 font-semibold">
                        <p class="print-hide-label">CHARGES</p>
                        <p class="print-hide-label">TOTAL</p>
                      </div>

                      <div class="space-y-2 px-2 ">
                        <div class="mt-2 flex justify-between">
                          <span class="print-hide-label font-semibold">Last Payment Date:</span>
                          <span class="print-show-value px-2 font-semibold">
                            ${formatShortDate(bill.createdAt || new Date().toISOString())}
                          </span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Last Payment Amount:</span>
                          <span class="print-show-value px-2 font-semibold">₦0.00</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">ADC:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Present Reading:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Previous Reading:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Consumption:</span>
                          <span class="print-show-value px-2 font-semibold">${bill.consumptionKwh || 0}kwh</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Tariff Rate:</span>
                          <span class="print-show-value px-2 font-semibold">${bill.tariffPerKwh || 0}</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Tariff Class:</span>
                          <span class="print-show-value px-2 font-semibold">-</span>
                        </div>
                      </div>
                    </div>

                    <div class="w-2/5 space-y-0.5">
                      <div class="print-white-text flex w-full items-center justify-between bg-[#008001] px-2 py-1 font-semibold print:bg-white print:text-black">
                        <p class="print-hide-label">CHARGES</p>
                        <p class="print-hide-label">TOTAL</p>
                      </div>

                      <div class="space-y-2 px-2 ">
                        <div class="mt-2 flex justify-between">
                          <span class="print-hide-label font-semibold">Status Code:</span>
                          <span class="print-show-value px-2 font-semibold">Active</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Opening Balance:</span>
                          <span class="print-show-value px-2 font-semibold">₦0.00</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Adjustment:</span>
                          <span class="print-show-value px-2 font-semibold">₦0.00</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Total Payment Amt:</span>
                          <span class="print-show-value px-2 font-semibold">${formatCurrency(bill.totalDue)}</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Net Arrears:</span>
                          <span class="print-show-value px-2 font-semibold">₦0.00</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Energy Charged:</span>
                          <span class="print-show-value px-2 font-semibold">${formatCurrency(bill.totalDue)}</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">Fixed Charge:</span>
                          <span class="print-show-value px-2 font-semibold">₦0.00</span>
                        </div>
                        <div class="mt-1 flex justify-between">
                          <span class="print-hide-label font-semibold">VAT:</span>
                          <span class="print-show-value px-2 font-semibold">₦0.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Total Due -->
                <div class="print-no-border flex w-full border border-gray-300">
                  <div class="print-bg-light-green w-3/5 bg-[#6CAD2B]">
                    <div class="px-2 py-1.5">&nbsp;</div>
                  </div>

                  <div class="w-2/5 bg-[#E1E1E1]">
                    <div class="print-white-text flex w-full items-center justify-between bg-[#008001] px-2 py-1.5 font-semibold print:bg-white print:text-black">
                      <p class="text-[8pt] print:invisible"></p>
                      <div class="flex items-center justify-center bg-white px-4 print:-mt-5 print:flex-grow print:justify-end">
                        <p class="print-show-value text-[8pt] font-bold text-black">
                          ${formatCurrency(bill.totalDue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Payment Notice -->
                <div class="flex">
                  <div class="a5-small-text print-no-border mb-3 mt-1 w-[60%] border border-gray-300 p-2 text-[6pt] print:text-[5pt]">
                    <p class=" font-semibold print:text-[5pt]">IMPORTANT PAYMENT INFORMATION</p>
                    <p class="font-semibold print:text-[5pt]">
                      PAY ON OR BEFORE DUE DATE TO AVOID DISCONNECTION | PAY AT ANY OF OUR OFFICES OR TO OUR SALES REPS USING OUR POSes OR ALTERNATIVE PAYMENT CHANNELS | <b>ALWAYS DEMAND FOR RECEIPT AFTER PAYMENT IS MADE</b>
                    </p>
                  </div>
                  <div class="w-[40%]"></div>
                </div>

                <!-- Summary Section -->
                <div class="a5-small-text print-no-border flex w-full border border-gray-300 bg-white text-[7pt]">
                  <div class="print-no-border-r w-2/3 border-r border-gray-300">
                    <div class="print-bg-light-green print-white-text flex w-full items-center justify-between bg-[#6CAD2B] px-2 py-1 font-semibold">
                      <p class="print:invisible"></p>
                      <div class="flex items-center justify-center bg-white px-4 py-0.5 print:flex-grow print:justify-end">
                        <p class="print-show-value text-black">
                          ${bill.areaOfficeName || "-"}
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 px-2">
                      <div class="space-y-2">
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Bill #:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            ${bill.id}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Bill Month:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">${
                            bill.name || bill.period
                          }</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Customer Account:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            ${bill.customerAccountNumber}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Account Name:</span>
                          <span class="print-show-value px-2 text-right font-semibold print:text-[5pt]">
                            ${bill.customerName}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Address:</span>
                          <span class="print-show-value px-2 text-right font-semibold print:text-[5pt]">
                            -
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Consumption:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            ${bill.consumptionKwh || 0}kwh
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Opening Balance:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            ₦0.00
                          </span>
                        </div>
                      </div>

                      <div class="space-y-2 pl-2">
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Adjustment:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            ₦0.00
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Total Payments:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            ${formatCurrency(bill.totalDue)}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Net Arrears:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            ₦0.00
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Meter:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            -
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Tariff:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            -
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">Rate:</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            ${bill.tariffPerKwh || 0}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="print-hide-label font-semibold">ADC</span>
                          <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                            -
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="w-1/3">
                    <div
                      class="print-white-text flex w-full items-center justify-between bg-[#008001] px-2 py-1 font-semibold print:bg-white print:text-black"
                      style="background-color: #008001"
                    >
                      <p class="print-hide-label">SERVICE CENTER:</p>
                      <div class="flex items-center justify-center bg-white px-4 py-0.5 print:flex-grow print:justify-end">
                        <p class="print-show-value text-black">-</p>
                      </div>
                    </div>

                    <div class="space-y-2 px-2 ">
                      <div class="flex justify-between">
                        <span class="print-hide-label font-semibold">Present Reading:</span>
                        <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                          -
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="print-hide-label font-semibold">Previous Reading:</span>
                        <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                          -
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="print-hide-label font-semibold">Fixed Charge:</span>
                        <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                          ₦0.00
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="print-hide-label font-semibold">Current Bill:</span>
                        <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                          ${formatCurrency(bill.totalDue)}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="print-hide-label font-semibold">VAT:</span>
                        <span class="print-show-value px-2 font-semibold print:text-[5pt]">
                          ₦0.00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer Total -->
                <div class="print-no-border flex w-full border border-gray-300 ">
                  <div class="print-bg-light-green w-2/3 bg-[#6CAD2B]">
                    <div class="px-2 py-1">&nbsp;</div>
                  </div>

                  <div class="w-1/3 bg-[#E1E1E1]">
                    <div
                      class="print-white-text flex w-full items-center justify-between bg-[#008001]  px-6 py-1 font-semibold print:-m-3 print:bg-white print:text-black"
                      style="background-color: #008001"
                    >
                      <p class="text-[8pt] print:invisible"></p>
                      <div class="flex items-center justify-center bg-white  print:flex-grow print:justify-end">
                        <p class="print-show-value text-[8pt] font-bold text-black">
                          ${formatCurrency(bill.totalDue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

               
                
            </div>
          </div>
        </div>
        ${pageBreak}
      `
      })
      .join("")

    // Complete HTML document with print styles matching the modal exactly
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Bills - KAD-ELEC</title>
        <style>
          /* Exact same print styles as the modal */
          @media print {
            @page {
              size: A5;
              margin: 0;
            }

            body {
              margin: 0;
              padding: 0;
              width: 420pt;
              height: 595pt;
              background: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-hide {
              display: none !important;
            }

            .a5-container {
              width: 420pt !important;
              height: 595pt !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              background: white !important;
            }

            .a5-content {
              padding: 10pt !important;
              font-size: 8pt !important;
            }

            .a5-small-text {
              font-size: 7pt !important;
            }

            .a5-header {
              height: 30pt !important;
            }

            .a5-section {
              margin-bottom: 8pt !important;
            }

            .a5-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 4pt !important;
            }

            .a5-col {
              padding: 4pt !important;
            }

            .force-black-white {
              color: black !important;
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-bg-green {
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-bg-light-green {
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-white-text {
              color: black !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-hide-label {
              display: none !important;
            }

            .print-show-value {
              display: block !important;
              text-align: right !important;
              font-weight: normal !important;
              justify-content: flex-end !important;
              margin-left: auto !important;
              width: 100% !important;
            }

            .print-show-value > * {
              text-align: right !important;
              justify-content: flex-end !important;
            }

            .bg-white .print-show-value {
              text-align: right !important;
              justify-content: flex-end !important;
              margin-left: auto !important;
              width: 100% !important;
            }

            [style*="background-color"] {
              background-color: white !important;
            }

            .print-no-border {
              border: none !important;
            }

            .print-no-border-r {
              border-right: none !important;
            }

            .print-no-border-t {
              border-top: none !important;
            }

            .print-no-border-b {
              border-bottom: none !important;
            }

            .print-no-border-l {
              border-left: none !important;
            }
          }

          /* Screen styles for preview */
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
          }

          .a5-container {
            width: 420pt;
            height: 595pt;
            margin: 0 auto 20px auto;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            page-break-inside: avoid;
          }

          .a5-content {
            padding: 10pt;
            font-size: 8pt;
          }

          .a5-small-text {
            font-size: 7pt;
          }

          .a5-header {
            height: 30pt;
          }

          .a5-section {
            margin-bottom: 8pt;
          }

          .flex {
            display: flex;
          }

          .items-center {
            align-items: center;
          }

          .justify-between {
            justify-content: space-between;
          }

          .justify-center {
            justify-content: center;
          }

          .w-full {
            width: 100%;
          }

          .flex-1 {
            flex: 1;
          }

          .w-24 {
            width: 6rem;
          }

          .w-20 {
            width: 5rem;
          }

          .w-40 {
            width: 10rem;
          }

          .w-36 {
            width: 9rem;
          }

          .w-3\\/5 {
            width: 60%;
          }

          .w-2\\/5 {
            width: 40%;
          }

          .w-2\\/3 {
            width: 66.666%;
          }

          .w-1\\/3 {
            width: 33.333%;
          }

          .w-60\\% {
            width: 60%;
          }

          .w-40\\% {
            width: 40%;
          }

          .h-10 {
            height: 2.5rem;
          }

          .h-12 {
            height: 3rem;
          }

          .bg-white {
            background-color: white;
          }

          .bg-\\[\\#6CAD2B\\] {
            background-color: #6CAD2B;
          }

          .bg-\\[\\#004B23\\] {
            background-color: #004B23;
          }

          .bg-\\[\\#008001\\] {
            background-color: #008001;
          }

          .bg-\\[\\#E1E1E1\\] {
            background-color: #E1E1E1;
          }

          .bg-gray-200 {
            background-color: #e5e7eb;
          }

          .text-white {
            color: white;
          }

          .text-black {
            color: black;
          }

          .text-gray-900 {
            color: #111827;
          }

          .text-gray-600 {
            color: #4b5563;
          }

          .text-xs {
            font-size: 0.75rem;
          }

          .text-sm {
            font-size: 0.875rem;
          }

          .text-\\[7pt\\] {
            font-size: 7pt;
          }

          .text-\\[8pt\\] {
            font-size: 8pt;
          }

          .text-\\[9pt\\] {
            font-size: 9pt;
          }

          .text-\\[5pt\\] {
            font-size: 5pt;
          }

          .text-\\[6pt\\] {
            font-size: 6pt;
          }

          .font-bold {
            font-weight: bold;
          }

          .font-semibold {
            font-weight: 600;
          }

          .font-mono {
            font-family: monospace;
          }

          .border {
            border: 1px solid #d1d5db;
          }

          .border-gray-300 {
            border-color: #d1d5db;
          }

          .border-r {
            border-right: 1px solid #d1d5db;
          }

          .border-t {
            border-top: 1px solid #d1d5db;
          }

          .p-1 {
            padding: 0.25rem;
          }

          .p-1\\.5 {
            padding: 0.375rem;
          }

          .p-2 {
            padding: 0.5rem;
          }

          .p-4 {
            padding: 1rem;
          }

          .p-8 {
            padding: 2rem;
          }

          .py-0\\.5 {
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
          }

          .py-1 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }

          .py-1\\.5 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }

          .py-2 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }

          .pt-1 {
            padding-top: 0.25rem;
          }

          .pt-4 {
            padding-top: 1rem;
          }

          .px-2 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }

          .px-4 {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .mb-1 {
            margin-bottom: 0.25rem;
          }

          .mb-2 {
            margin-bottom: 0.5rem;
          }

          .mb-4 {
            margin-bottom: 1rem;
          }

          .mb-6 {
            margin-bottom: 1.5rem;
          }

          .mt-1 {
            margin-top: 0.25rem;
          }

          .mt-2 {
            margin-top: 0.5rem;
          }

          .mt-3 {
            margin-top: 0.75rem;
          }

          .mt-4 {
            margin-top: 1rem;
          }

          .space-y-0\\.5 > * + * {
            margin-top: 0.125rem;
          }

          .space-y-2 > * + * {
            margin-top: 0.5rem;
          }

          .gap-2 {
            gap: 0.5rem;
          }

          .gap-4 {
            gap: 1rem;
          }

          .text-center {
            text-align: center;
          }

          .text-right {
            text-align: right;
          }

          .hidden {
            display: none;
          }

          .print\\:hidden {
            display: none;
          }

          .print\\:mb-2 {
            margin-bottom: 0.5rem;
          }

          .print\\:w-20 {
            width: 5rem;
          }

          .print\\:w-36 {
            width: 9rem;
          }

          .print\\:h-10 {
            height: 2.5rem;
          }

          .print\\:py-0\\.5 {
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
          }

          .print\\:text-\\[7pt\\] {
            font-size: 7pt;
          }

          .print\\:text-black {
            color: black;
          }

          .print\\:bg-white {
            background-color: white;
          }

          .print\\:flex-grow {
            flex-grow: 1;
          }

          .print\\:justify-end {
            justify-content: flex-end;
          }

          .print\\:-mt-5 {
            margin-top: -1.25rem;
          }

          .print\\:overflow-visible {
            overflow: visible;
          }

          .print\\:rounded-none {
            border-radius: 0;
          }

          .print\\:shadow-none {
            box-shadow: none;
          }

          .print\\:w-\\[420px\\] {
            width: 420px;
          }

          .print\\:h-\\[595px\\] {
            height: 595px;
          }

          .print\\:max-w-none {
            max-width: none;
          }

          .print\\:bg-white {
            background-color: white;
          }

          .print\\:backdrop-blur-0 {
            backdrop-filter: blur(0);
          }

          .grid {
            display: grid;
          }

          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pl-2 {
            padding-left: 0.5rem;
          }

          .-m-3 {
            margin: -0.75rem;
          }
        </style>
      </head>
      <body>
        ${billsHtml}
      </body>
      </html>
    `

    // Write the HTML to the new window
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    console.log(htmlContent)

    // Wait for the content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
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
      let status: BillStatus = BillStatus.Draft

      // Map your API status to component status
      if (apiBill.status === 0) status = BillStatus.Draft
      else if (apiBill.status === 1) status = BillStatus.Published
      else if (apiBill.status === 2) status = BillStatus.Reversed
      else status = BillStatus.Draft // Default to Draft

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
        tariff: `₦${apiBill.tariffPerKwh || 0.0}/kWh`,
        openingBalance: `₦${(apiBill.openingBalance || 0.0).toLocaleString()}`,
        netAreas: `₦${(apiBill.netArrears || 0.0).toLocaleString()}`,
        closingBalance: `₦${(apiBill.closingBalance || 0.0).toLocaleString()}`,
        energyKwh: `${apiBill.consumptionKwh || 0.0} kWh`,
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
      <div className="flex items-center justify-center px-3 2xl:container sm:px-4 md:px-6 2xl:px-16">
        <LoadingSkeleton />
      </div>
    )
  if (error) return <div className="p-4 text-red-500">Error loading bills data: {error}</div>

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 px-3 sm:px-4 md:px-6 2xl:mt-5 2xl:flex-row 2xl:px-16">
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
                  onSearch={handleManualSearch}
                  placeholder="enter account number to search."
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

              {/* Print Bills button */}
              <button
                type="button"
                onClick={handlePrintBills}
                disabled={bills.length === 0}
                className="flex items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
              >
                <Printer className="size-4" />
                Print Bills (1-10)
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
                <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
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
                          Bill Amount <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("openingBalance")}
                      >
                        <div className="flex items-center gap-2">
                          Opening Balance <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("netAreas")}
                      >
                        <div className="flex items-center gap-2">
                          Net Areas <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("closingBalance")}
                      >
                        <div className="flex items-center gap-2">
                          Closing Balance <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("energyKwh")}
                      >
                        <div className="flex items-center gap-2">
                          Energy kWh <RxCaretSort />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                        onClick={() => toggleSort("issueDate")}
                      >
                        <div className="flex items-center gap-2">
                          Date Created <RxCaretSort />
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
                      <th className="shadow-[ -4px_0_8px_-2px_rgba(0,0,0,0.1)] sticky right-0 z-10 whitespace-nowrap border-b bg-white p-4 text-sm">
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
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatCurrency(bill.openingBalance)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatCurrency(bill.netAreas)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatCurrency(bill.closingBalance)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">{bill.energyKwh}</td>
                        <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                          {formatDate(bill.issueDate)}
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
                            {Object.values(BillStatus)[bill.status] || "Unknown"}
                          </motion.div>
                        </td>
                        <td className="shadow-[ -4px_0_8px_-2px_rgba(0,0,0,0.1)] sticky right-0 z-10 whitespace-nowrap border-b bg-white px-4 py-2 text-sm shadow-md">
                          <div className="flex items-center gap-2">
                            <ButtonModule
                              size="sm"
                              icon={<VscEye />}
                              iconPosition="start"
                              onClick={() => handleViewBillDetails(bill)}
                              variant="outline"
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
              {/* Billing Period Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Billing Period</label>
                <FormSelectModule
                  name="billingPeriodId"
                  value={localFilters.billingPeriodId?.toString() || ""}
                  onChange={(e) =>
                    handleFilterChange("billingPeriodId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={billingPeriodOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions
                    .filter((opt) => opt.value !== "")
                    .map((option) => {
                      const statusValue = Number(option.value)
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.status === statusValue
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions
                    .filter((opt) => opt.value !== "")
                    .map((option) => {
                      const categoryValue = Number(option.value)
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange(
                              "category",
                              localFilters.category === categoryValue ? undefined : categoryValue
                            )
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.category === categoryValue
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                </div>
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
        billingPeriodOptions={billingPeriodOptions}
        statusOptions={statusOptions}
        categoryOptions={categoryOptions}
        areaOfficeOptions={areaOfficeOptions}
        feederOptions={feederOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </>
  )
}

export default AllBillsWithSearchParams
