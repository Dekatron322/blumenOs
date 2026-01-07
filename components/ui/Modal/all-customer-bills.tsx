"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { VscEye } from "react-icons/vsc"
import { ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearMyBillsStatus, getMyBills } from "lib/redux/customersDashboardSlice"
import { ButtonModule } from "components/ui/Button/Button"

enum BillStatus {
  Draft = 0,
  Generated = 1,
  Finalized = 2,
}

enum AdjustmentStatus {
  None = 0,
  Pending = 1,
  Approved = 2,
}

enum BillCategory {
  Residential = 1,
  Commercial = 2,
}

// Bill interface matching API response
interface Bill {
  id: number
  name: string
  period: string
  billingPeriodId: number
  billingPeriod: {
    id: number
    year: number
    month: number
    periodKey: string
    displayName: string
    status: number
    latestGeneratedBillHistory: {
      id: number
      billingPeriodId: number
      generatedBillCount: number
      finalizedBillCount: number
      generatedAtUtc: string
    }
    createdAt: string
    lastUpdated: string
  }
  category: number
  status: number
  adjustmentStatus: number
  customerId: number
  customerName: string
  customerAccountNumber: string
  publicReference: string
  distributionSubstationId: number
  distributionSubstationCode: string
  feederId: number
  feederName: string
  areaOfficeId: number
  areaOfficeName: string
  meterReadingId: number
  feederEnergyCapId: number
  tariffPerKwh: number
  vatRate: number
  openingBalance: number
  paymentsPrevMonth: number
  consumptionKwh: number
  chargeBeforeVat: number
  vatAmount: number
  currentBillAmount: number
  adjustedOpeningBalance: number
  totalDue: number
  forecastConsumptionKwh: number
  forecastChargeBeforeVat: number
  forecastVatAmount: number
  forecastBillAmount: number
  forecastTotalDue: number
  isEstimated: boolean
  estimatedConsumptionKwh: number
  estimatedBillAmount: number
  actualConsumptionKwh: number
  actualBillAmount: number
  consumptionVarianceKwh: number
  billingVarianceAmount: number
  isMeterReadingFlagged: boolean
  meterReadingValidationStatus: number
  openDisputeCount: number
  activeDispute: {
    id: number
    status: number
    reason: string
    raisedAtUtc: string
  } | null
  customer: any
  createdAt: string
  lastUpdated: string
  ledgerEntries: Array<{
    id: number
    type: number
    amount: number
    code: string
    memo: string
    effectiveAtUtc: string
    referenceId: number
  }>
}

interface ActionDropdownProps {
  bill: Bill
  onViewDetails: (bill: Bill) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ bill, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
                  console.log("Update bill:", bill.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Bill
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
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5">
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
              {[...Array(11)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(11)].map((_, cellIndex) => (
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
          <div className="size-8 rounded bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200"></div>
          ))}
          <div className="size-8 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}

interface AllBillsProps {
  customerId?: number
  billingPeriodId?: number
  customerName?: string
  accountNumber?: string
  status?: number
  adjustmentStatus?: number
  category?: number
  areaOfficeId?: number
  feederId?: number
  distributionSubstationId?: number
  serviceCenterId?: number
  feederEnergyCapId?: number
  customerIsMD?: boolean
  customerIsUrban?: boolean
  customerProvinceId?: number
}

const AllBills: React.FC<AllBillsProps> = ({
  customerId,
  billingPeriodId,
  customerName,
  accountNumber,
  status,
  adjustmentStatus,
  category,
  areaOfficeId,
  feederId,
  distributionSubstationId,
  serviceCenterId,
  feederEnergyCapId,
  customerIsMD,
  customerIsUrban,
  customerProvinceId,
}) => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // Redux state
  const myBillsList = useSelector((state: RootState) => state.customersDashboard.myBillsList)
  const myBillsPagination = useSelector((state: RootState) => state.customersDashboard.myBillsPagination)
  const isLoadingMyBills = useSelector((state: RootState) => state.customersDashboard.isLoadingMyBills)
  const myBillsError = useSelector((state: RootState) => state.customersDashboard.myBillsError)

  // Local state
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Filter dropdown states
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)
  const [isAdjustmentStatusFilterOpen, setIsAdjustmentStatusFilterOpen] = useState(false)
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)

  // Filter values
  const [filters, setFilters] = useState({
    status: "",
    adjustmentStatus: "",
    category: "",
  })

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
  })

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: BillStatus.Draft.toString(), label: "Draft" },
    { value: BillStatus.Generated.toString(), label: "Generated" },
    { value: BillStatus.Finalized.toString(), label: "Finalized" },
  ]

  const adjustmentStatusOptions = [
    { value: "", label: "All Adjustment Status" },
    { value: AdjustmentStatus.None.toString(), label: "None" },
    { value: AdjustmentStatus.Pending.toString(), label: "Pending" },
    { value: AdjustmentStatus.Approved.toString(), label: "Approved" },
  ]

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: BillCategory.Residential.toString(), label: "Residential" },
    { value: BillCategory.Commercial.toString(), label: "Commercial" },
  ]

  const handleViewBillDetails = (bill: Bill) => {
    router.push(`/customer-dashboard/bills/bill-details/${bill.id}`)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (!target.closest('[data-dropdown-root="status-filter"]')) {
        setIsStatusFilterOpen(false)
      }

      if (!target.closest('[data-dropdown-root="adjustment-status-filter"]')) {
        setIsAdjustmentStatusFilterOpen(false)
      }

      if (!target.closest('[data-dropdown-root="category-filter"]')) {
        setIsCategoryFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Fetch bills when filters, search, or pagination changes
  useEffect(() => {
    const fetchBills = () => {
      const requestParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        customerId,
        billingPeriodId,
        customerName,
        accountNumber,
        status: filters.status ? parseInt(filters.status) : undefined,
        adjustmentStatus: filters.adjustmentStatus ? parseInt(filters.adjustmentStatus) : undefined,
        category: filters.category ? parseInt(filters.category) : undefined,
        areaOfficeId,
        feederId,
        distributionSubstationId,
        serviceCenterId,
        feederEnergyCapId,
        customerIsMD,
        customerIsUrban,
        customerProvinceId,
      }

      // Remove undefined values
      const cleanParams = Object.fromEntries(Object.entries(requestParams).filter(([_, value]) => value !== undefined))

      dispatch(getMyBills(cleanParams as any))
    }

    fetchBills()
  }, [
    dispatch,
    pagination.currentPage,
    pagination.pageSize,
    searchText,
    filters.status,
    filters.adjustmentStatus,
    filters.category,
    customerId,
    billingPeriodId,
    customerName,
    accountNumber,
    areaOfficeId,
    feederId,
    distributionSubstationId,
    serviceCenterId,
    feederEnergyCapId,
    customerIsMD,
    customerIsUrban,
    customerProvinceId,
  ])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearMyBillsStatus())
    }
  }, [dispatch])

  const getStatusStyle = (status: number) => {
    switch (status) {
      case BillStatus.Finalized:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          dotColor: "#589E67",
        }
      case BillStatus.Generated:
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          dotColor: "#D97706",
        }
      case BillStatus.Draft:
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          dotColor: "#AF4B4B",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          dotColor: "#6B7280",
        }
    }
  }

  const getAdjustmentStatusStyle = (adjustmentStatus: number) => {
    switch (adjustmentStatus) {
      case AdjustmentStatus.Approved:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case AdjustmentStatus.Pending:
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case AdjustmentStatus.None:
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

  const getCategoryStyle = (category: number) => {
    switch (category) {
      case BillCategory.Residential:
        return {
          backgroundColor: "#F0F9FF",
          color: "#0C4A6E",
        }
      case BillCategory.Commercial:
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setShowMobileSearch(false)
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status }))
    setIsStatusFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleAdjustmentStatusFilterChange = (adjustmentStatus: string) => {
    setFilters((prev) => ({ ...prev, adjustmentStatus }))
    setIsAdjustmentStatusFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleCategoryFilterChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category }))
    setIsCategoryFilterOpen(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      adjustmentStatus: "",
      category: "",
    })
    setSearchText("")
    setShowMobileSearch(false)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const paginate = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }))
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value)
    setPagination({ currentPage: 1, pageSize: newPageSize })
  }

  const getPageItems = (): (number | string)[] => {
    const total = myBillsPagination?.totalPages || 1
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    // Always show first page
    items.push(1)

    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      // Close to the start: show first few pages
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      // Close to the end: show ellipsis then last few pages
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      // In the middle: show ellipsis, surrounding pages, then ellipsis
      items.push("...", current - 1, current, current + 1, "...")
    }

    // Always show last page
    if (!items.includes(total)) {
      items.push(total)
    }

    return items
  }

  const getMobilePageItems = (): (number | string)[] => {
    const total = myBillsPagination?.totalPages || 1
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 4) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    // Example for early pages on mobile: 1,2,3,...,last
    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    // Middle pages: 1, ..., current, ..., last
    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    // Near the end: 1, ..., last-2, last-1, last
    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= (myBillsPagination?.totalPages || 1)) {
      setPagination((prev) => ({ ...prev, currentPage: page }))
    }
  }

  if (isLoadingMyBills) return <LoadingSkeleton />

  const currentBills = myBillsList || []
  const totalRecords = myBillsPagination?.totalCount || 0
  const totalPages = myBillsPagination?.totalPages || 1
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Bills</p>
          <p className="text-sm text-gray-600">View and manage all customer bills</p>
        </div>
      </motion.div>

      {/* Header with Search and Mobile Search Toggle */}
      <motion.div
        className="flex flex-col py-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Mobile search input revealed when icon is tapped */}
        {showMobileSearch && (
          <div className="mb-3 sm:hidden">
            <SearchModule
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by reference, customer name or account number"
              className="w-full"
            />
          </div>
        )}

        {/* Filters Section */}
        <motion.div
          className="mt-2 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Status Filter Dropdown */}
          <div className="hidden sm:block">
            <SearchModule
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by reference, customer name or account number"
              className="w-full max-w-full md:max-w-[300px]"
            />
          </div>

          {/* Adjustment Status Filter Dropdown */}
          <div className="relative" data-dropdown-root="adjustment-status-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm md:text-base"
              onClick={() => setIsAdjustmentStatusFilterOpen((open) => !open)}
            >
              <IoMdFunnel className="size-4 md:size-5" />
              <span>
                {filters.adjustmentStatus === AdjustmentStatus.None.toString()
                  ? "None"
                  : filters.adjustmentStatus === AdjustmentStatus.Pending.toString()
                  ? "Pending"
                  : filters.adjustmentStatus === AdjustmentStatus.Approved.toString()
                  ? "Approved"
                  : "All Adjustment Status"}
              </span>
              <ChevronDown
                className={`size-3 text-gray-500 transition-transform md:size-4 ${
                  isAdjustmentStatusFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isAdjustmentStatusFilterOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.adjustmentStatus === "" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleAdjustmentStatusFilterChange("")}
                  >
                    All Adjustment Status
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.adjustmentStatus === AdjustmentStatus.None.toString() ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleAdjustmentStatusFilterChange(AdjustmentStatus.None.toString())}
                  >
                    None
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.adjustmentStatus === AdjustmentStatus.Pending.toString() ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleAdjustmentStatusFilterChange(AdjustmentStatus.Pending.toString())}
                  >
                    Pending
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.adjustmentStatus === AdjustmentStatus.Approved.toString() ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleAdjustmentStatusFilterChange(AdjustmentStatus.Approved.toString())}
                  >
                    Approved
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative" data-dropdown-root="category-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm md:text-base"
              onClick={() => setIsCategoryFilterOpen((open) => !open)}
            >
              <IoMdFunnel className="size-4 md:size-5" />
              <span>
                {filters.category === BillCategory.Residential.toString()
                  ? "Residential"
                  : filters.category === BillCategory.Commercial.toString()
                  ? "Commercial"
                  : "All Categories"}
              </span>
              <ChevronDown
                className={`size-3 text-gray-500 transition-transform md:size-4 ${
                  isCategoryFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoryFilterOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.category === "" ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange("")}
                  >
                    All Categories
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.category === BillCategory.Residential.toString() ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange(BillCategory.Residential.toString())}
                  >
                    Residential
                  </button>
                  <button
                    className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                      filters.category === BillCategory.Commercial.toString() ? "bg-gray-50" : ""
                    }`}
                    onClick={() => handleCategoryFilterChange(BillCategory.Commercial.toString())}
                  >
                    Commercial
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={handlePageSizeChange} className="button-oulined text-sm md:text-base">
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filters.status || filters.adjustmentStatus || filters.category || searchText) && (
            <motion.button
              onClick={clearFilters}
              className="button-oulined text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All Filters
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Error Message */}
      {myBillsError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
          <p>Error loading bills: {myBillsError}</p>
        </div>
      )}

      {currentBills.length === 0 ? (
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
            {searchText || filters.status || filters.adjustmentStatus || filters.category
              ? "No matching bills found"
              : "No bills available"}
          </motion.p>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {searchText || filters.status || filters.adjustmentStatus || filters.category
              ? "Try adjusting your search or filters"
              : "Bills will appear here once they are generated"}
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
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      Reference
                    </div>
                  </th>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("totalDue")}
                  >
                    <div className="flex items-center gap-2">
                      Amount <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("customerName")}
                  >
                    <div className="flex items-center gap-2">
                      Customer <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("period")}
                  >
                    <div className="flex items-center gap-2">
                      Period <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("category")}
                  >
                    <div className="flex items-center gap-2">
                      Category <RxCaretSort />
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
                    onClick={() => toggleSort("adjustmentStatus")}
                  >
                    <div className="flex items-center gap-2">
                      Adj. Status <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("consumptionKwh")}
                  >
                    <div className="flex items-center gap-2">
                      Consumption (kWh) <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Created Date <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("areaOfficeName")}
                  >
                    <div className="flex items-center gap-2">
                      Area Office <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentBills.map((bill, index) => (
                    <motion.tr
                      key={bill.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                        {bill.publicReference || `BILL-${bill.id}`}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-semibold">
                        {formatCurrency(bill.totalDue)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{bill.customerName || "-"}</div>
                          <div className="text-xs text-gray-500">{bill.customerAccountNumber || ""}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div>
                          <div className="font-medium">{bill.period || "-"}</div>
                          <div className="text-xs text-gray-500">{bill.billingPeriod?.displayName || ""}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getCategoryStyle(bill.category)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {bill.category === BillCategory.Residential
                            ? "Residential"
                            : bill.category === BillCategory.Commercial
                            ? "Commercial"
                            : "Unknown"}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getStatusStyle(bill.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: getStatusStyle(bill.status).dotColor,
                            }}
                          ></span>
                          {bill.status === BillStatus.Draft
                            ? "Draft"
                            : bill.status === BillStatus.Generated
                            ? "Generated"
                            : bill.status === BillStatus.Finalized
                            ? "Finalized"
                            : "Unknown"}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getAdjustmentStatusStyle(bill.adjustmentStatus)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {bill.adjustmentStatus === AdjustmentStatus.None
                            ? "None"
                            : bill.adjustmentStatus === AdjustmentStatus.Pending
                            ? "Pending"
                            : bill.adjustmentStatus === AdjustmentStatus.Approved
                            ? "Approved"
                            : "Unknown"}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {bill.consumptionKwh?.toLocaleString() || "-"}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{formatDate(bill.createdAt)}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{bill.areaOfficeName || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ButtonModule
                          size="sm"
                          variant="outline"
                          icon={<VscEye />}
                          onClick={() => router.push(`/customer-portal/bills/${bill.id}`)}
                        >
                          View
                        </ButtonModule>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          <motion.div
            className="mt-4 flex w-full flex-row items-center justify-between gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-sm md:text-base">Show rows</p>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="bg-[#F2F2F2] p-1 text-sm md:text-base"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start md:gap-3">
              <button
                className={`px-2 py-1 md:px-3 md:py-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <MdOutlineArrowBackIosNew className="size-4 md:size-5" />
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                <div className="hidden items-center gap-1 md:flex md:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-6 items-center justify-center rounded-md text-xs md:h-7 md:w-8 md:text-sm ${
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

                <div className="flex items-center gap-1 md:hidden">
                  {getMobilePageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-6 items-center justify-center rounded-md text-xs md:w-8 ${
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
                className={`px-2 py-1 md:px-3 md:py-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <MdOutlineArrowForwardIos className="size-4 md:size-5" />
              </button>
            </div>
            <p className="text-sm max-sm:hidden md:text-base">
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

export default AllBills
