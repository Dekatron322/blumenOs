"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { BillsIcon, CycleIcon, DateIcon, RevenueGeneratedIcon, StatusIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { BillingPeriod, fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearFeeders, fetchFeeders } from "lib/redux/feedersSlice"
import { ArrowLeft, Filter, PlusIcon, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { CreateBillingPeriodModal } from "components/ui/Modal/create-billing-period-modal"

// Check if user has specific privilege
const hasPrivilege = (user: any, key: string, action?: string): boolean => {
  if (!user?.privileges) return false

  const privilege = user.privileges.find((p: any) => p.key === key)
  if (!privilege) return false

  if (action) {
    return privilege.actions.includes(action)
  }
  return true
}

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface BillingCycle {
  id: number
  name: string
  period: string
  status: "Completed" | "In Progress" | "Scheduled"
  startDate: string
  endDate: string
  billsGenerated: string
  totalAmount: string
  approvedBy?: string
  createdAt: string
  latestGeneratedBillHistory?: {
    id: number
    billingPeriodId: number
    generatedBillCount: number
    finalizedBillCount: number
    generatedAtUtc: string
  }
}

interface BillingCyclesProps {
  onStartNewCycle?: () => void
  onViewDetails?: (cycle: BillingCycle) => void
}

// Responsive Skeleton Components
const BillingCycleCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 shadow-sm"
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
    <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
      <div className="flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="size-5 rounded-full bg-gray-200"></div>
          <div className="h-5 w-40 rounded bg-gray-200 sm:w-48"></div>
          <div className="h-6 w-20 rounded-full bg-gray-200"></div>
          <div className="h-6 w-24 rounded-full bg-gray-200"></div>
        </div>
        <div className="space-y-1">
          <div className="h-4 w-56 rounded bg-gray-200 sm:w-64"></div>
          <div className="h-3 w-40 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
        <div className="h-5 w-20 rounded bg-gray-200"></div>
        <div className="h-3 w-16 rounded bg-gray-200"></div>
        <div className="h-9 w-24 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200 sm:size-5"></div>
          <div className="space-y-1">
            <div className="h-3 w-16 rounded bg-gray-200 sm:w-20"></div>
            <div className="h-4 w-12 rounded bg-gray-200 sm:w-16"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const MobileBillingCycleCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3"
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
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200"></div>
          <div className="h-5 w-32 rounded bg-gray-200"></div>
        </div>
        <div className="mt-1 h-4 w-20 rounded-full bg-gray-200"></div>
        <div className="mt-2 space-y-1">
          <div className="h-3 w-40 rounded bg-gray-200"></div>
          <div className="h-3 w-32 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="ml-2 flex flex-col items-end gap-1">
        <div className="h-4 w-16 rounded-full bg-gray-200"></div>
        <div className="h-8 w-20 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-gray-200"></div>
          <div className="space-y-1">
            <div className="h-2 w-12 rounded bg-gray-200"></div>
            <div className="h-3 w-8 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row"
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
    <div className="order-2 h-4 w-40 rounded bg-gray-200 sm:order-1"></div>
    <div className="order-1 flex items-center gap-2 sm:order-2">
      <div className="size-8 rounded bg-gray-200"></div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-7 rounded bg-gray-200"></div>
        ))}
      </div>
      <div className="size-8 rounded bg-gray-200"></div>
    </div>
    <div className="order-3 hidden h-4 w-24 rounded bg-gray-200 sm:block"></div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="mb-6"
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
    <div className="mb-2 h-7 w-32 rounded bg-gray-200 sm:h-8 sm:w-40"></div>
    <div className="h-12 w-full rounded-lg bg-gray-200 sm:w-96"></div>
  </motion.div>
)

// Mobile Filter Sidebar Component
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  billingPeriodOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  billingPeriodOptions: Array<{ value: string; label: string }>
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
            className="flex h-full w-full max-w-sm flex-col bg-white p-4 shadow-xl"
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
            <div className="flex-1 space-y-4">
              {/* Billing Period Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Billing Period</label>
                <FormSelectModule
                  name="billingPeriod"
                  value={localFilters.billingPeriod || ""}
                  onChange={(e) => handleFilterChange("billingPeriod", e.target.value || undefined)}
                  options={billingPeriodOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="button-filled flex flex-1 items-center justify-center"
                >
                  Apply Filters
                </button>
                <button onClick={onClose} className="button-oulined flex flex-1 items-center justify-center">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const BillingCycles: React.FC<BillingCyclesProps> = ({ onStartNewCycle, onViewDetails }) => {
  const [searchText, setSearchText] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    billingPeriod: undefined as string | undefined,
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    billingPeriod: undefined as string | undefined,
  })

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Get state from Redux store
  const { billingPeriods, loading, error, success } = useAppSelector((state) => state.billingPeriods)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { feeders } = useAppSelector((state) => state.feeders)
  const { user } = useAppSelector((state) => state.auth)

  // Check if user has write access to billing-postpaid
  const canWriteBillingPostpaid = !!user?.privileges?.some(
    (p) => p.key === "billing-postpaid" && p.actions?.includes("W")
  )

  // Separate state for all available billing periods (for filter dropdown)
  const [allBillingPeriods, setAllBillingPeriods] = useState<BillingPeriod[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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

  // Fetch all billing periods on component mount (for filter dropdown)
  useEffect(() => {
    const fetchAllPeriods = async () => {
      const result = await dispatch(
        fetchBillingPeriods({
          pageNumber: 1,
          pageSize: 100,
        })
      ) // Fetch all periods without filters
      // Store the complete list for filter dropdown
      if (result.payload && Array.isArray(result.payload)) {
        setAllBillingPeriods(result.payload as BillingPeriod[])
      }
    }

    fetchAllPeriods()
  }, [dispatch])

  // Fetch billing periods when appliedFilters change (for display)
  useEffect(() => {
    const fetchBills = async () => {
      const requestParams: any = {
        PageNumber: currentPage,
        PageSize: pageSize,
      }

      // Parse billing period to get year and month
      if (appliedFilters.billingPeriod) {
        // Parse periodKey to extract year and month (assuming format like "2024-01")
        const match = /^([0-9]{4})-([0-9]{2})$/.exec(appliedFilters.billingPeriod)
        if (match) {
          requestParams.year = parseInt(match[1]!, 10)
          requestParams.month = parseInt(match[2]!, 10)
        }
      }

      // Add search parameter if provided
      if (searchText.trim()) {
        requestParams.search = searchText.trim()
      }

      await dispatch(fetchBillingPeriods(requestParams))
    }

    // Always fetch - if no filter applied, it will fetch all periods
    // If filter applied, it will fetch filtered periods
    fetchBills()
  }, [dispatch, searchText, appliedFilters, currentPage, pageSize])

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1) // Reset to first page when clearing search
  }

  // Generate billing period options from all available periods (for filter dropdown)
  const billingPeriodOptions = [
    { label: "All Periods", value: "" },
    ...allBillingPeriods.map((period) => ({
      value: period.periodKey,
      label: period.displayName,
    })),
  ]

  // Handle individual filter changes (local state)
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Apply all filters at once
  const applyFilters = () => {
    setAppliedFilters({
      billingPeriod: localFilters.billingPeriod,
    })
    setCurrentPage(1) // Reset to first page when applying filters
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      billingPeriod: undefined,
    })
    setAppliedFilters({
      billingPeriod: undefined,
    })
    setSearchText("")
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.billingPeriod !== undefined) count++
    return count
  }

  // Transform billing periods to component format
  const transformBillsToCycles = (): BillingCycle[] => {
    if (!billingPeriods || billingPeriods.length === 0) {
      console.log("No billing periods to transform")
      return []
    }

    console.log("Transforming billing periods to cycles, count:", billingPeriods.length)

    // Transform to BillingCycle format
    return billingPeriods.map((period) => {
      // Determine status based on period status
      let status: "Completed" | "In Progress" | "Scheduled" = "Scheduled"
      if (period.status === 1) {
        status = "In Progress"
      } else if (period.status === 2) {
        status = "Completed"
      }

      // Generate dates based on year and month with fallbacks
      const year = period.year ?? new Date().getFullYear()
      const month = period.month ?? new Date().getMonth() + 1

      const startDate: string = new Date(year, month - 1, 1).toISOString().split("T")[0] ?? ""
      const endDate: string = new Date(year, month, 0).toISOString().split("T")[0] ?? ""

      return {
        id: period.id,
        name: period.displayName,
        period: period.periodKey,
        status,
        startDate,
        endDate,
        billsGenerated: period.latestGeneratedBillHistory?.generatedBillCount?.toString() || "0",
        totalAmount: period.latestGeneratedBillHistory?.finalizedBillCount
          ? `${period.latestGeneratedBillHistory.finalizedBillCount} bills`
          : "Pending",
        approvedBy: period.status === 2 ? "System" : undefined,
        createdAt: period.createdAt,
        latestGeneratedBillHistory: period.latestGeneratedBillHistory,
      }
    })
  }

  const billingCycles = transformBillsToCycles()
  console.log("Transformed billing cycles:", billingCycles)

  // Only show fallback if no data and not loading
  const shouldShowFallback = !loading && billingCycles.length === 0

  const displayCycles = billingCycles

  // Get pagination data from Redux store or calculate from local data
  const totalPages = billingPeriods?.length > 0 ? Math.ceil(billingPeriods.length / pageSize) : 0
  const totalRecords = billingPeriods?.length || 0
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCycles = displayCycles.slice(startIndex, endIndex)

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value)
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i += 1) {
          items.push(i)
        }
        items.push("...")
        items.push(total)
      } else if (current >= total - 3) {
        items.push(1)
        items.push("...")
        for (let i = total - 4; i <= total; i += 1) {
          items.push(i)
        }
      } else {
        items.push(1)
        items.push("...")
        for (let i = current - 1; i <= current + 1; i += 1) {
          items.push(i)
        }
        items.push("...")
        items.push(total)
      }
    }

    return items
  }

  const getMobilePageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
    const items: (number | string)[] = []

    if (total <= 5) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 3; i += 1) {
          items.push(i)
        }
        items.push("...")
        items.push(total)
      } else if (current >= total - 2) {
        items.push(1)
        items.push("...")
        for (let i = total - 2; i <= total; i += 1) {
          items.push(i)
        }
      } else {
        items.push(1)
        items.push("...")
        items.push(current)
        items.push("...")
        items.push(total)
      }
    }

    return items
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Scheduled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCycleTypeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "In Progress":
        return "bg-purple-100 text-purple-800"
      case "Scheduled":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAmountColor = (amount: string) => {
    if (amount === "Pending" || amount === "-") {
      return "text-yellow-600"
    }
    return "text-green-600"
  }

  const handleViewDetails = (cycle: BillingCycle) => {
    const matchingPeriod = billingPeriods?.find((period) => period.periodKey === cycle.period)

    if (matchingPeriod) {
      router.push(`/billing/bills?period=${matchingPeriod.periodKey}`)
      onViewDetails?.(cycle)
    } else {
      console.warn("No matching billing period found for cycle period", cycle)
    }
  }

  const BillingCycleCard = ({ cycle }: { cycle: BillingCycle }) => (
    <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 transition-shadow duration-200 hover:shadow-sm sm:p-4">
      <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="text-gray-600">
              <DateIcon />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{cycle.name}</h4>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cycle.status)}`}>
              {cycle.status}
            </span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCycleTypeColor(cycle.status)}`}>
              Monthly Cycle
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 sm:text-base">
            {formatDate(cycle.startDate)} to {formatDate(cycle.endDate)}
          </p>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            {cycle.approvedBy ? `Approved by: ${cycle.approvedBy}` : "Pending approval"}
          </p>
        </div>
        <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
          {/* <p className={`text-sm font-semibold sm:text-base ${getAmountColor(cycle.totalAmount)}`}>
            {cycle.totalAmount}
          </p> */}
          <p className="text-xs text-gray-500 sm:text-sm">
            {cycle.status === "Completed"
              ? formatDate(cycle.endDate)
              : cycle.status === "In Progress"
              ? "In Progress"
              : `Starts: ${formatDate(cycle.startDate)}`}
          </p>
          <ButtonModule
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(cycle)}
            icon={<VscEye className="size-3 sm:size-4" />}
            iconPosition="start"
            className="mt-1 bg-white text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">View</span>
            <span className="sm:hidden">View</span>
          </ButtonModule>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 text-xs sm:gap-4 sm:text-sm">
        <div className="flex items-center gap-2">
          <BillsIcon />
          <div>
            <p className="text-gray-500">Bills Generated</p>
            <p className={`font-medium ${getAmountColor(cycle.billsGenerated)}`}>{cycle.billsGenerated}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RevenueGeneratedIcon />

          <div>
            <p className="text-gray-500">Bills Finalized</p>
            <p
              className={`font-medium ${
                cycle.status === "Completed"
                  ? "text-green-600"
                  : cycle.status === "In Progress"
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {cycle.latestGeneratedBillHistory?.finalizedBillCount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon />
          <div>
            <p className="text-gray-500">Approval</p>
            <p className={`font-medium ${cycle.approvedBy ? "text-green-600" : "text-yellow-600"}`}>
              {cycle.approvedBy ? "Approved" : "Pending"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CycleIcon />
          <div>
            <p className="text-gray-500">Created At</p>
            <p className="font-medium">{formatDate(cycle.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const MobileBillingCycleCard = ({ cycle }: { cycle: BillingCycle }) => (
    <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-gray-600">
              <DateIcon />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">{cycle.name}</h4>
          </div>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cycle.status)}`}
          >
            {cycle.status}
          </span>
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-gray-900">
              {formatDate(cycle.startDate)} to {formatDate(cycle.endDate)}
            </p>
            <p className="text-xs text-gray-600">
              {cycle.approvedBy ? `Approved by: ${cycle.approvedBy}` : "Pending approval"}
            </p>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCycleTypeColor(cycle.status)}`}>
            Monthly
          </span>
          <ButtonModule
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(cycle)}
            icon={<VscEye />}
            iconPosition="start"
            className="bg-white text-xs"
          >
            View
          </ButtonModule>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
        <div className="flex items-center gap-1">
          <BillsIcon />
          <div>
            <p className="text-gray-500">Bills</p>
            <p className={`font-medium ${getAmountColor(cycle.billsGenerated)}`}>{cycle.billsGenerated}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CycleIcon />
          <div>
            <p className="text-gray-500">Status</p>
            <p
              className={`font-medium ${
                cycle.status === "Completed"
                  ? "text-green-600"
                  : cycle.status === "In Progress"
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {cycle.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon />
          <div>
            <p className="text-gray-500">Approval</p>
            <p className={`font-medium ${cycle.approvedBy ? "text-green-600" : "text-yellow-600"}`}>
              {cycle.approvedBy ? "Yes" : "No"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <RevenueGeneratedIcon />
          <div>
            <p className="text-gray-500">Revenue</p>
            <p className={`font-medium ${getAmountColor(cycle.totalAmount)} text-xs`}>
              {cycle.totalAmount.includes("M") ? cycle.totalAmount.replace("₦", "") : cycle.totalAmount}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading && billingCycles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="rounded-lg border bg-white p-4 sm:p-6">
          <HeaderSkeleton />

          <div className="space-y-3 sm:space-y-4">
            {isMobileView ? (
              <>
                <MobileBillingCycleCardSkeleton />
                <MobileBillingCycleCardSkeleton />
                <MobileBillingCycleCardSkeleton />
              </>
            ) : (
              <>
                <BillingCycleCardSkeleton />
                <BillingCycleCardSkeleton />
                <BillingCycleCardSkeleton />
              </>
            )}
          </div>

          <PaginationSkeleton />
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Billing Cycles */}
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
          <div className="mb-4 sm:mb-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold sm:text-xl">Billing Cycles</h3>
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

                {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                <div className="flex items-center gap-2">
                  {canWriteBillingPostpaid ? (
                    <ButtonModule
                      variant="outline"
                      size="sm"
                      icon={<PlusIcon size={14} />}
                      iconPosition="start"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Add Billing Cycles
                    </ButtonModule>
                  ) : null}
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
            </div>
          </div>

          {/* Billing Cycles List */}
          <div className="space-y-3 sm:space-y-4">
            {paginatedCycles.map((cycle) =>
              isMobileView ? (
                <MobileBillingCycleCard key={cycle.id} cycle={cycle} />
              ) : (
                <BillingCycleCard key={cycle.id} cycle={cycle} />
              )
            )}
          </div>

          {/* Pagination */}
          {paginatedCycles.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t pt-4 sm:mt-6 sm:flex-row">
              <div className="flex items-center gap-1 max-sm:hidden">
                <p className="text-xs sm:text-sm">Show rows</p>
                <select value={pageSize} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1 text-xs sm:text-sm">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  className={`${
                    currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <BiSolidLeftArrow className="size-3 sm:size-4" />
                </button>
                <div className="flex items-center gap-1">
                  {getPageItems().map((item, index) => (
                    <button
                      key={index}
                      className={`h-6 w-6 rounded text-xs sm:h-7 sm:w-7 sm:text-sm ${
                        item === currentPage
                          ? "bg-[#000000] text-white"
                          : item === "..."
                          ? "cursor-default bg-transparent text-gray-400"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                      onClick={() => (typeof item === "number" ? changePage(item) : null)}
                      disabled={item === "..." || item === currentPage}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button
                  className={`${
                    currentPage === totalPages || totalPages === 0
                      ? "cursor-not-allowed text-gray-400"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <BiSolidRightArrow className="size-3 sm:size-4" />
                </button>
              </div>

              <p className="text-center text-xs text-gray-600 sm:text-right sm:text-sm">
                Page {currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()} total cycles)
                {searchText.trim() && " - filtered"}
              </p>
            </div>
          )}

          {/* Empty State */}
          {paginatedCycles.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 sm:size-16">
                  <CyclesIcon />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No Billing Cycles Found</h3>
                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                  {getActiveFilterCount() > 0 || searchText.trim()
                    ? "Try adjusting your search criteria or filters"
                    : "No billing cycles available for the selected period"}
                </p>
              </div>
            </div>
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
                  name="billingPeriod"
                  value={localFilters.billingPeriod || ""}
                  onChange={(e) => handleFilterChange("billingPeriod", e.target.value || undefined)}
                  options={billingPeriodOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
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
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        billingPeriodOptions={billingPeriodOptions}
      />

      {/* Create Billing Period Modal */}
      <CreateBillingPeriodModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  )
}

export default BillingCycles
