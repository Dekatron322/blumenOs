"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { BillsIcon, CycleIcon, DateIcon, RevenueGeneratedIcon, StatusIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { FeederEnergyCap, fetchFeederEnergyCaps, setPagination } from "lib/redux/feederEnergyCapSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearFeeders, fetchFeeders } from "lib/redux/feedersSlice"
import { clearCompanies, fetchCompanies } from "lib/redux/companySlice"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, Loader2, RefreshCw, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import EmptySearchState from "components/ui/EmptySearchState"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface FeederEnergyCapsProps {
  onApplyNewCaps?: () => void
  onViewDetails?: (cap: FeederEnergyCap) => void
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
            {[...Array(8)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(8)].map((_, colIndex) => (
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
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  periodOptions,
  areaOfficeOptions,
  feederOptions,
  companyOptions,
  sortOptions,
  isSortExpanded,
  setIsSortExpanded,
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
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  feederOptions: Array<{ value: string | number; label: string }>
  companyOptions: Array<{ value: string | number; label: string }>
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
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
            {/* Header - Fixed at top */}
            <div className="shrink-0 border-b bg-white p-4">
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

                {/* Company Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Company</label>
                  <FormSelectModule
                    name="companyId"
                    value={localFilters.companyId || ""}
                    onChange={(e) => handleFilterChange("companyId", e.target.value || undefined)}
                    options={companyOptions}
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
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                              : "bg-gray-50 text-gray-700"
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

            {/* Bottom Action Buttons - Fixed at bottom */}
            <div className="shrink-0 border-t bg-white p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="button-filled flex-1"
                >
                  <Filter className="size-4" />
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="button-outlined flex-1"
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

const FeederEnergyCaps: React.FC<FeederEnergyCapsProps> = ({ onApplyNewCaps, onViewDetails }) => {
  const [searchText, setSearchText] = useState("")
  const [searchTrigger, setSearchTrigger] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(true)
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    period: "",
    areaOfficeId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    companyId: undefined as number | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    period: undefined as string | undefined,
    areaOfficeId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    companyId: undefined as number | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  // Get state from Redux store
  const { feederEnergyCaps, feederEnergyCapsLoading, feederEnergyCapsError, pagination } = useAppSelector(
    (state) => state.feederEnergyCaps
  )
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { feeders } = useAppSelector((state) => state.feeders)
  const { companies } = useAppSelector((state) => state.companies)

  // Fetch area offices, feeders, and companies on component mount for filter dropdowns
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
      fetchCompanies({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Cleanup function to clear states when component unmounts
    return () => {
      dispatch(clearAreaOffices())
      dispatch(clearFeeders())
      dispatch(clearCompanies())
    }
  }, [dispatch])

  // Fetch feeder energy caps when filters change
  useEffect(() => {
    const fetchParams: any = {
      pageNumber: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.period && { period: appliedFilters.period }),
      ...(appliedFilters.areaOfficeId !== undefined && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.feederId !== undefined && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.companyId !== undefined && { companyId: appliedFilters.companyId }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    void dispatch(fetchFeederEnergyCaps(fetchParams))
  }, [dispatch, pagination.currentPage, pagination.pageSize, appliedFilters, searchTrigger])

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text)
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
    setSearchTrigger((prev) => prev + 1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
    setSearchTrigger((prev) => prev + 1)
  }

  // Handle refresh
  const handleRefresh = () => {
    const fetchParams: any = {
      pageNumber: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.period && { period: appliedFilters.period }),
      ...(appliedFilters.areaOfficeId !== undefined && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.feederId !== undefined && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.companyId !== undefined && { companyId: appliedFilters.companyId }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    void dispatch(fetchFeederEnergyCaps(fetchParams))
  }

  // Generate period options
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

    const existingPeriods = Array.from(new Set(feederEnergyCaps.map((cap) => cap.period)))
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

  // Company options
  const companyOptions = [
    { value: "", label: "All Companies" },
    ...companies.map((company) => ({
      value: company.id,
      label: company.name,
    })),
  ]

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Feeder ID Asc", value: "feederId", order: "asc" },
    { label: "Feeder ID Desc", value: "feederId", order: "desc" },
    { label: "Period Asc", value: "period", order: "asc" },
    { label: "Period Desc", value: "period", order: "desc" },
    { label: "Energy Cap Low-High", value: "energyCapKwh", order: "asc" },
    { label: "Energy Cap High-Low", value: "energyCapKwh", order: "desc" },
    { label: "Tariff Override Low-High", value: "tariffOverridePerKwh", order: "asc" },
    { label: "Tariff Override High-Low", value: "tariffOverridePerKwh", order: "desc" },
    { label: "Captured Date Asc", value: "capturedAtUtc", order: "asc" },
    { label: "Captured Date Desc", value: "capturedAtUtc", order: "desc" },
    { label: "Captured By Asc", value: "capturedByName", order: "asc" },
    { label: "Captured By Desc", value: "capturedByName", order: "desc" },
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
      period: localFilters.period || undefined,
      areaOfficeId: localFilters.areaOfficeId,
      feederId: localFilters.feederId,
      companyId: localFilters.companyId,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      period: "",
      areaOfficeId: undefined,
      feederId: undefined,
      companyId: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      period: undefined,
      areaOfficeId: undefined,
      feederId: undefined,
      companyId: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setSearchText("")
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.period) count++
    if (localFilters.areaOfficeId !== undefined) count++
    if (localFilters.feederId !== undefined) count++
    if (localFilters.companyId !== undefined) count++
    if (localFilters.sortBy) count++
    return count
  }

  const handleViewDetails = (cap: FeederEnergyCap) => {
    router.push(`/billing/feeder-energy-caps/${cap.id}`)
    onViewDetails?.(cap)
  }

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return "—"
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "Invalid Date"
    }
  }

  const formatDateTime = (dateString?: string) => {
    try {
      if (!dateString) return "—"
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

  const formatPeriod = (period: string) => {
    try {
      const [year, month] = period.split("-")
      if (!year || !month) return period
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    } catch {
      return period
    }
  }

  const getStatusColor = (cap: FeederEnergyCap) => {
    // Determine status based on period and dates
    try {
      const currentDate = new Date()
      const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

      if (cap.period < currentPeriod) {
        return "bg-gray-100 text-gray-700 border-gray-200"
      } else if (cap.period === currentPeriod) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      } else {
        return "bg-blue-50 text-blue-700 border-blue-200"
      }
    } catch {
      return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (cap: FeederEnergyCap) => {
    try {
      const currentDate = new Date()
      const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

      if (cap.period < currentPeriod) {
        return <span className="size-1.5 rounded-full bg-gray-500"></span>
      } else if (cap.period === currentPeriod) {
        return <span className="size-1.5 rounded-full bg-emerald-500"></span>
      } else {
        return <span className="size-1.5 rounded-full bg-blue-500"></span>
      }
    } catch {
      return <span className="size-1.5 rounded-full bg-gray-500"></span>
    }
  }

  const getStatusLabel = (cap: FeederEnergyCap) => {
    try {
      const currentDate = new Date()
      const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

      if (cap.period < currentPeriod) return "Expired"
      if (cap.period === currentPeriod) return "Active"
      return "Pending"
    } catch {
      return "Unknown"
    }
  }

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || feederEnergyCaps.length || 0

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

  // Loading state
  if (feederEnergyCapsLoading && feederEnergyCaps.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full">
        <TableSkeleton />
      </motion.div>
    )
  }

  // Error state
  if (feederEnergyCapsError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <X className="size-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load energy caps</p>
            <p className="mt-1 text-sm text-gray-500">{feederEnergyCapsError}</p>
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
        {/* Main Content - Feeder Energy Caps Table */}
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
                <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Feeder Energy Caps</h3>
                <p className="text-sm text-gray-500">
                  {totalRecords} cap(s) found • Page {pagination.currentPage} of {totalPages || 1}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="w-full sm:w-64">
                  <SearchModule
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onCancel={handleCancelSearch}
                    onSearch={() => handleSearch(searchText)}
                    placeholder="Search by period or feeder..."
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
                    disabled={feederEnergyCapsLoading}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${feederEnergyCapsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feeder Energy Caps Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Feeder
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Area Office
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Period
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Energy Cap
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tariff Override
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Company
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Captured By
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {feederEnergyCaps.map((cap) => {
                  const statusLabel = getStatusLabel(cap)
                  return (
                    <tr key={cap.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="text-gray-400">
                            <CycleIcon />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {cap.feederName || `Feeder #${cap.feederId}`}
                            </p>
                            {/* <p className="text-xs text-gray-500">ID: {cap.feederId}</p> */}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm text-gray-700">{cap.areaOfficeName || "—"}</p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(
                            cap
                          )}`}
                        >
                          {getStatusIcon(cap)}
                          {statusLabel}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm text-gray-700">{formatPeriod(cap.period)}</p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {cap.energyCapKwh?.toLocaleString() || "0"} kWh
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm text-gray-700">
                          {cap.tariffOverridePerKwh
                            ? new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                                minimumFractionDigits: 2,
                              }).format(cap.tariffOverridePerKwh)
                            : "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm text-gray-700">{cap.companyName || "—"}</p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-700">{cap.capturedByName || "—"}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(cap.capturedAtUtc)}</p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(cap)}
                          icon={<VscEye className="size-3.5" />}
                          iconPosition="start"
                          className="bg-white"
                        >
                          View
                        </ButtonModule>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {feederEnergyCaps.length === 0 && !feederEnergyCapsLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-gray-100">
                <CycleIcon />
              </div>
              <h3 className="mt-4 text-base font-medium text-gray-900">No Energy Caps Found</h3>
              <EmptySearchState
                title={
                  getActiveFilterCount() > 0 || searchText.trim()
                    ? "Try adjusting your search criteria or filters"
                    : "No energy caps available"
                }
              />
            </div>
          )}

          {/* Pagination */}
          {feederEnergyCaps.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">Show</p>
                <select
                  value={pagination.pageSize}
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

              <p className="text-sm text-gray-500">
                Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.pageSize, totalRecords)} of {totalRecords} entries
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

              {/* Company Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Company</label>
                <FormSelectModule
                  name="companyId"
                  value={localFilters.companyId || ""}
                  onChange={(e) => handleFilterChange("companyId", e.target.value || undefined)}
                  options={companyOptions}
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
        periodOptions={periodOptions}
        areaOfficeOptions={areaOfficeOptions}
        feederOptions={feederOptions}
        companyOptions={companyOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </>
  )
}

export default FeederEnergyCaps
