"use client"

import React, { Suspense, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearError, clearFilters, fetchPostpaidBills, setFilters, setPagination } from "lib/redux/postpaidSlice"
import { fetchAreaOffices, fetchFeeders } from "lib/redux/formDataSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { MapIcon, UserIcon } from "components/Icons/Icons"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { VscEye } from "react-icons/vsc"
import PostpaidBillDetailsModal from "components/ui/Modal/postpaid-bill-modal"
import BillPreviewModal from "components/ui/Modal/bill-preview-modal"
import EmptySearchState from "components/ui/EmptySearchState"

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

export interface Bill {
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
  customerStatusCode?: string
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
  areaOfficeSearch: string
  feederSearch: string
  handleAreaOfficeSearchChange: (searchValue: string) => void
  handleFeederSearchChange: (searchValue: string) => void
  handleAreaOfficeSearchClick: () => void
  handleFeederSearchClick: () => void
  areaOfficesLoading: boolean
  feedersLoading: boolean
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
  areaOfficeSearch,
  feederSearch,
  handleAreaOfficeSearchChange,
  handleFeederSearchChange,
  handleAreaOfficeSearchClick,
  handleFeederSearchClick,
  areaOfficesLoading,
  feedersLoading,
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
            className="flex size-full max-w-sm flex-col bg-white"
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
                    searchable={true}
                    searchTerm={areaOfficeSearch}
                    onSearchChange={handleAreaOfficeSearchChange}
                    onSearchClick={handleAreaOfficeSearchClick}
                    loading={areaOfficesLoading}
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
                    searchable={true}
                    searchTerm={feederSearch}
                    onSearchChange={handleFeederSearchChange}
                    onSearchClick={handleFeederSearchClick}
                    loading={feedersLoading}
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
                  className="button-outlined flex w-full items-center justify-center gap-2 text-sm md:text-base"
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
  const { areaOffices, areaOfficesLoading } = useAppSelector((state) => state.formData)
  const { feeders, feedersLoading } = useAppSelector((state) => state.formData)
  const { billingPeriods } = useAppSelector((state) => state.billingPeriods)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchTrigger, setSearchTrigger] = useState(0)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Search states for dropdowns
  const [areaOfficeSearch, setAreaOfficeSearch] = useState("")
  const [feederSearch, setFeederSearch] = useState("")

  // State for PostpaidBillDetailsModal
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [modalBill, setModalBill] = useState<PostpaidBill | null>(null)

  // State for BillPreviewModal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewCurrentIndex, setPreviewCurrentIndex] = useState(0)

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

  // Search handlers for dropdowns - only update search term state
  const handleAreaOfficeSearchChange = (searchValue: string) => {
    setAreaOfficeSearch(searchValue)
  }

  const handleFeederSearchChange = (searchValue: string) => {
    setFeederSearch(searchValue)
  }

  // Search button handlers - trigger API calls
  const handleAreaOfficeSearchClick = () => {
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100, Search: areaOfficeSearch }))
  }

  const handleFeederSearchClick = () => {
    dispatch(fetchFeeders({ PageNumber: 1, PageSize: 100, Search: feederSearch }))
  }

  // Handle refresh
  const handleRefresh = () => {
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
  }

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
        PageNumber: 1,
        PageSize: 100,
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
      // formDataSlice doesn't have clear functions, data will be cached
    }
  }, [dispatch])

  // Fetch bills on component mount and when search/pagination/appliedFilters change
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
      label: office.name,
    })),
  ]

  // Feeder options
  const feederOptions = [
    { value: "", label: "All Feeders" },
    ...feeders.map((feeder) => ({
      value: feeder.id.toString(),
      label: feeder.name,
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

  const handlePreviewBill = (bill: Bill) => {
    // Find the index of the current bill in the displayBills array
    const index = displayBills.findIndex((b) => b.id === bill.id)
    if (index !== -1) {
      setPreviewCurrentIndex(index)
      setIsPreviewModalOpen(true)
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
        customerStatusCode: apiBill.customerStatusCode,
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

  // Loading state
  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading bills...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center px-3 py-16  sm:px-4 md:px-6 ">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <X className="size-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load bills</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
          <ButtonModule variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </ButtonModule>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 px-3 sm:px-4 md:px-6 2xl:mt-5 2xl:flex-row ">
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
            className="border-b py-2 md:py-4"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-3 flex w-full flex-wrap items-center justify-between gap-3">
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
                  <p className="text-lg font-medium max-sm:pb-3 md:text-xl">All Bills</p>
                  <p className="text-sm text-gray-600">
                    {totalRecords.toLocaleString()} total bills • Page {pagination.currentPage} of {totalPages || 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
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

                {/* Refresh button */}
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                >
                  <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="w-full">
              <SearchModule
                prominent
                prominentTitle="Search Bills"
                prominentDescription="Find bills quickly by account number, customer, billing cycle, or status."
                value={searchText}
                onChange={handleSearch}
                onCancel={handleCancelSearch}
                onSearch={handleManualSearch}
                placeholder="Enter account number to search."
                height="h-14"
                className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm md:!w-full [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
                bgClassName="bg-white"
              />
            </div>
          </motion.div>

          {displayBills.length === 0 ? (
            <motion.div
              className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F6F6F9]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <EmptySearchState title={searchText ? "No matching bills found" : "No bills available"} />
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
                      <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
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
                        className="hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap border-b px-4 py-2">
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
                        <td className="whitespace-nowrap border-b px-4 py-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{bill.name}</div>
                            <div className="text-xs text-gray-500">{bill.billingCycle}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm  text-gray-900">
                          {formatCurrency(bill.amount)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm  text-gray-900">
                          {formatCurrency(bill.openingBalance)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm  text-gray-900">
                          {formatCurrency(bill.netAreas)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm  text-gray-900">
                          {formatCurrency(bill.closingBalance)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm text-gray-600">{bill.energyKwh}</td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm text-gray-600">
                          {formatDate(bill.issueDate)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
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
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
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
                            <ButtonModule
                              size="sm"
                              icon={<FileText />}
                              iconPosition="start"
                              onClick={() => handlePreviewBill(bill)}
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              <span className="hidden sm:inline">Preview</span>
                              <span className="sm:hidden">Preview</span>
                            </ButtonModule>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Pagination */}
              {displayBills.length > 0 && totalPages > 1 && (
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
                      className={`inline-flex size-8 items-center justify-center rounded-md border ${
                        pagination.currentPage === 1
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => changePage(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <BiSolidLeftArrow className="size-3" />
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageItems().map((item, index) => (
                        <button
                          key={index}
                          className={`inline-flex size-8 items-center justify-center rounded-md text-sm ${
                            item === pagination.currentPage
                              ? "bg-black text-white"
                              : item === "..."
                              ? "cursor-default bg-transparent text-gray-400"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => (typeof item === "number" ? changePage(item) : null)}
                          disabled={item === "..." || item === pagination.currentPage}
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    <button
                      className={`inline-flex size-8 items-center justify-center rounded-md border ${
                        pagination.currentPage === totalPages || totalPages === 0
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => changePage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === totalPages || totalPages === 0}
                    >
                      <BiSolidRightArrow className="size-3" />
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-600 sm:text-right sm:text-sm">
                    Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.pageSize, totalRecords)} of {totalRecords} entries
                    {searchText.trim() && " - filtered"}
                  </p>
                </div>
              )}
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
                  searchable={true}
                  searchTerm={areaOfficeSearch}
                  onSearchChange={handleAreaOfficeSearchChange}
                  onSearchClick={handleAreaOfficeSearchClick}
                  loading={areaOfficesLoading}
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
                  searchable={true}
                  searchTerm={feederSearch}
                  onSearchChange={handleFeederSearchChange}
                  onSearchClick={handleFeederSearchClick}
                  loading={feedersLoading}
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
                className="button-outlined flex w-full items-center justify-center gap-2 text-sm md:text-base"
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
        areaOfficeSearch={areaOfficeSearch}
        feederSearch={feederSearch}
        handleAreaOfficeSearchChange={handleAreaOfficeSearchChange}
        handleFeederSearchChange={handleFeederSearchChange}
        handleAreaOfficeSearchClick={handleAreaOfficeSearchClick}
        handleFeederSearchClick={handleFeederSearchClick}
        areaOfficesLoading={areaOfficesLoading}
        feedersLoading={feedersLoading}
      />

      {/* Bill Preview Modal */}
      <BillPreviewModal
        isOpen={isPreviewModalOpen}
        onRequestClose={() => setIsPreviewModalOpen(false)}
        bills={displayBills}
        currentIndex={previewCurrentIndex}
        setCurrentIndex={setPreviewCurrentIndex}
      />
    </>
  )
}

export default AllBillsWithSearchParams
