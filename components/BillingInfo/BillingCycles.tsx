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
import { ArrowLeft, Filter, Loader2, PlusIcon, RefreshCw, X } from "lucide-react"
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

// Table Skeleton Component
const TableSkeleton = () => (
  <div className="w-full">
    <div className="mb-4 flex items-center justify-between">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
      <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
    </div>
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[...Array(7)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(7)].map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
    </div>
  </div>
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
                <button onClick={onClose} className="button-outlined flex flex-1 items-center justify-center">
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
      )
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
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1) // Reset to first page when clearing search
  }

  // Handle refresh
  const handleRefresh = () => {
    const requestParams: any = {
      PageNumber: currentPage,
      PageSize: pageSize,
    }

    if (appliedFilters.billingPeriod) {
      const match = /^([0-9]{4})-([0-9]{2})$/.exec(appliedFilters.billingPeriod)
      if (match) {
        requestParams.year = parseInt(match[1]!, 10)
        requestParams.month = parseInt(match[2]!, 10)
      }
    }

    if (searchText.trim()) {
      requestParams.search = searchText.trim()
    }

    dispatch(fetchBillingPeriods(requestParams))
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
      return []
    }

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

  // Get pagination data from Redux store or calculate from local data
  const totalPages = billingPeriods?.length > 0 ? Math.ceil(billingPeriods.length / pageSize) : 0
  const totalRecords = billingPeriods?.length || 0
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCycles = billingCycles.slice(startIndex, endIndex)

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "Invalid Date"
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "—"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Scheduled":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <span className="size-1.5 rounded-full bg-emerald-500"></span>
      case "In Progress":
        return <span className="size-1.5 rounded-full bg-blue-500"></span>
      case "Scheduled":
        return <span className="size-1.5 rounded-full bg-amber-500"></span>
      default:
        return <span className="size-1.5 rounded-full bg-gray-500"></span>
    }
  }

  const getAmountColor = (amount: string) => {
    if (amount === "Pending" || amount === "-") {
      return "text-amber-600"
    }
    return "text-emerald-600"
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

  // Loading state
  if (loading && billingCycles.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full">
        <TableSkeleton />
      </motion.div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <X className="size-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load billing cycles</p>
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
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Billing Cycles Table */}
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
          {/* Header with Search and Actions */}
          <div className="mb-6">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Billing Cycles</h3>
                <p className="text-sm text-gray-500">
                  {totalRecords} cycle(s) found • Page {currentPage} of {totalPages || 1}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="w-full sm:w-64">
                  <SearchModule
                    value={searchText}
                    onChange={handleSearch}
                    onCancel={handleCancelSearch}
                    placeholder="Search cycles..."
                  />
                </div>

                {/* Filter Button for screens below 2xl */}
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

                {/* Desktop Actions */}
                <div className="flex items-center gap-2">
                  {canWriteBillingPostpaid && (
                    <ButtonModule
                      variant="outline"
                      size="sm"
                      icon={<PlusIcon size={14} />}
                      iconPosition="start"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Add Cycle
                    </ButtonModule>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDesktopFilters((prev) => !prev)}
                    className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                  >
                    {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                    {showDesktopFilters ? "Hide filters" : "Show filters"}
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Cycles Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Cycle Details
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Period
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Timeline
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Bills Generated
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Finalized
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedCycles.map((cycle) => (
                  <tr key={cycle.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-400">
                          <DateIcon />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cycle.name}</p>
                          <p className="text-xs text-gray-500">ID: {cycle.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(
                          cycle.status
                        )}`}
                      >
                        {getStatusIcon(cycle.status)}
                        {cycle.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="text-sm text-gray-700">{cycle.period}</span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Start: {formatDate(cycle.startDate)}</p>
                        <p className="text-xs text-gray-500">End: {formatDate(cycle.endDate)}</p>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <p className={`text-sm font-medium ${getAmountColor(cycle.billsGenerated)}`}>
                        {cycle.billsGenerated}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-sm text-gray-700">
                        {cycle.latestGeneratedBillHistory?.finalizedBillCount || "0"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-xs text-gray-500">{formatDateTime(cycle.createdAt)}</p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <ButtonModule
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(cycle)}
                        icon={<VscEye className="size-3.5" />}
                        iconPosition="start"
                        className="bg-white"
                      >
                        View Bills
                      </ButtonModule>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedCycles.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-gray-100">
                <CyclesIcon />
              </div>
              <h3 className="mt-4 text-base font-medium text-gray-900">No Billing Cycles Found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {getActiveFilterCount() > 0 || searchText.trim()
                  ? "Try adjusting your search criteria or filters"
                  : "No billing cycles available for the selected period"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {paginatedCycles.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">Show</p>
                <select
                  value={pageSize}
                  onChange={handleRowsChange}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <p className="text-sm text-gray-500">entries</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`inline-flex size-8 items-center justify-center rounded-md border ${
                    currentPage === 1
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <BiSolidLeftArrow className="size-3" />
                </button>

                <div className="flex items-center gap-1">
                  {getPageItems().map((item, index) => (
                    <button
                      key={index}
                      className={`inline-flex size-8 items-center justify-center rounded-md text-sm ${
                        item === currentPage
                          ? "bg-black text-white"
                          : item === "..."
                          ? "cursor-default bg-transparent text-gray-400"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => (typeof item === "number" ? changePage(item) : null)}
                      disabled={item === "..." || item === currentPage}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <button
                  className={`inline-flex size-8 items-center justify-center rounded-md border ${
                    currentPage === totalPages || totalPages === 0
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <BiSolidRightArrow className="size-3" />
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} entries
              </p>
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
