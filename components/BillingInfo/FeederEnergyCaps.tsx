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
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
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

interface EnergyCapCycle {
  id: number
  name: string
  status: "Active" | "Expired" | "Pending"
  period: string
  feedersCount: string
  totalEnergyCap: string
  averageTariff: string
  appliedBy?: string
  appliedAt?: string
}

interface FeederEnergyCapsProps {
  onApplyNewCaps?: () => void
  onViewDetails?: (cycle: EnergyCapCycle) => void
}

// Responsive Skeleton Components
const EnergyCapCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4"
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

const MobileEnergyCapCardSkeleton = () => (
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
    <div className="mb-2 h-7 w-40 rounded bg-gray-200 sm:h-8 sm:w-48"></div>
    <div className="h-12 w-full rounded-lg bg-gray-200 sm:w-96"></div>
  </motion.div>
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

            {/* Bottom Action Buttons */}
            <div className="mt-6 border-t bg-white p-4 2xl:hidden">
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

const FeederEnergyCaps: React.FC<FeederEnergyCapsProps> = ({ onApplyNewCaps, onViewDetails }) => {
  const [searchText, setSearchText] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(false)
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
  const { feederEnergyCaps, feederEnergyCapsLoading, feederEnergyCapsError, pagination, feederEnergyCapsSuccess } =
    useAppSelector((state) => state.feederEnergyCaps)
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

  // Fetch feeder energy caps on component mount and when appliedFilters/pagination changes
  useEffect(() => {
    const fetchParams: any = {
      pageNumber: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...(appliedFilters.period && { period: appliedFilters.period }),
      ...(appliedFilters.areaOfficeId !== undefined && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.feederId !== undefined && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.companyId !== undefined && { companyId: appliedFilters.companyId }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    void dispatch(fetchFeederEnergyCaps(fetchParams))
  }, [dispatch, pagination.currentPage, pagination.pageSize, appliedFilters])

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text)
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
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

  const handleViewDetails = (cycle: EnergyCapCycle) => {
    router.push(`/billing/feeder-energy-caps/energy-cap-details/${cycle.id}`)
    onViewDetails?.(cycle)
  }

  // Transform API data to component format
  const transformCapsToCycles = (): EnergyCapCycle[] => {
    if (!feederEnergyCaps || feederEnergyCaps.length === 0) {
      return []
    }

    // Group caps by period to create energy cap cycles
    const cyclesByPeriod = feederEnergyCaps.reduce(
      (acc, cap) => {
        const period = cap.period || "Unknown"
        if (!acc[period]) {
          acc[period] = {
            caps: [],
            totalEnergyCap: 0,
            feedersCount: new Set<number>(),
            totalTariff: 0,
          }
        }
        const periodData = acc[period]!
        periodData.caps.push(cap)
        periodData.totalEnergyCap += cap.energyCapKwh || 0
        periodData.feedersCount.add(cap.feederId)
        periodData.totalTariff += cap.tariffOverridePerKwh || 0
        return acc
      },
      {} as Record<
        string,
        {
          caps: FeederEnergyCap[]
          totalEnergyCap: number
          feedersCount: Set<number>
          totalTariff: number
        }
      >
    )

    // Transform to EnergyCapCycle format
    return Object.entries(cyclesByPeriod).map(([period, data], index) => {
      // Determine status based on period date
      let status: "Active" | "Expired" | "Pending" = "Active"
      try {
        const periodDate = new Date(period + "-01")
        const currentDate = new Date()
        const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

        if (period < currentPeriod) {
          status = "Expired"
        } else if (period > currentPeriod) {
          status = "Pending"
        }
      } catch {
        status = "Active"
      }

      const feedersCount = data.feedersCount.size
      const averageTariff = data.caps.length > 0 ? data.totalTariff / data.caps.length : 0

      // Format period for display
      let periodDate
      try {
        periodDate = new Date(period + "-01")
        if (isNaN(periodDate.getTime())) {
          periodDate = new Date()
        }
      } catch {
        periodDate = new Date()
      }

      const cycleName = `${periodDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} Energy Caps`

      return {
        id: data.caps[0]?.id || index + 1,
        name: cycleName,
        status,
        period,
        feedersCount: feedersCount.toLocaleString(),
        totalEnergyCap:
          data.totalEnergyCap > 0
            ? isMobileView
              ? `${(data.totalEnergyCap / 1000).toFixed(0)}M`
              : `${(data.totalEnergyCap / 1000).toFixed(1)}M kWh`
            : "0 kWh",
        averageTariff:
          averageTariff > 0
            ? isMobileView
              ? `₦${averageTariff.toFixed(0)}`
              : `₦${averageTariff.toFixed(2)}`
            : "₦0.00",
        appliedBy: data.caps[0]?.capturedByName || "System",
        appliedAt: data.caps[0]?.capturedAtUtc,
      }
    })
  }

  const energyCapCycles = transformCapsToCycles()

  // Only show fallback if no data and not loading
  const shouldShowFallback = !feederEnergyCapsLoading && energyCapCycles.length === 0

  // Fallback data if no API data
  const fallbackCycles: EnergyCapCycle[] = [
    {
      id: 1,
      name: "January 2024 Energy Caps",
      status: "Active",
      period: "2024-01",
      feedersCount: "1,250",
      totalEnergyCap: isMobileView ? "45M" : "45.2M kWh",
      averageTariff: isMobileView ? "₦53" : "₦52.75",
      appliedBy: "Energy Manager",
      appliedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "February 2024 Energy Caps",
      status: "Pending",
      period: "2024-02",
      feedersCount: "0",
      totalEnergyCap: "Pending",
      averageTariff: "Pending",
    },
    {
      id: 3,
      name: "December 2023 Energy Caps",
      status: "Expired",
      period: "2023-12",
      feedersCount: "1,180",
      totalEnergyCap: isMobileView ? "43M" : "42.8M kWh",
      averageTariff: isMobileView ? "₦50" : "₦50.25",
      appliedBy: "Energy Manager",
      appliedAt: "2023-12-01T00:00:00Z",
    },
  ]

  const displayCycles = shouldShowFallback ? fallbackCycles : energyCapCycles

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || displayCycles.length || 0

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

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) {
        return "Invalid Date"
      }
      const date = new Date(dateString)
      return isMobileView
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "Invalid Date"
    }
  }

  const formatPeriod = (period: string) => {
    try {
      const [year, month] = period.split("-")
      if (!year || !month) {
        return period
      }
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
      return isMobileView
        ? date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    } catch {
      return period
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Expired":
        return "bg-gray-100 text-gray-800"
      case "Pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCycleTypeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800"
      case "Expired":
        return "bg-purple-100 text-purple-800"
      case "Pending":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAmountColor = (amount: string) => {
    if (amount === "Pending" || amount === "0 kWh") {
      return "text-yellow-600"
    }
    return "text-green-600"
  }

  const EnergyCapCard = ({ cycle }: { cycle: EnergyCapCycle }) => (
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
              Energy Caps
            </span>
          </div>

          <p className="text-sm font-medium text-gray-900 sm:text-base">Period: {formatPeriod(cycle.period)}</p>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            {cycle.appliedBy ? `Applied by: ${cycle.appliedBy}` : "Pending application"}
            {cycle.appliedAt && ` on ${formatDate(cycle.appliedAt)}`}
          </p>
        </div>

        <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
          <p className={`text-sm font-semibold sm:text-base ${getAmountColor(cycle.totalEnergyCap)}`}>
            {cycle.totalEnergyCap}
          </p>
          <p className="text-xs text-gray-500 sm:text-sm">
            {cycle.status === "Active" ? "Active" : cycle.status === "Expired" ? "Expired" : "Pending"}
          </p>
          <ButtonModule
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(cycle)}
            icon={<VscEye className="size-3 sm:size-4" />}
            iconPosition="start"
            className="mt-1 bg-white text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">View</span>
          </ButtonModule>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 text-xs sm:gap-4 sm:text-sm">
        <div className="flex items-center gap-2">
          <BillsIcon />
          <div>
            <p className="text-gray-500">Feeders</p>
            <p className={`font-medium ${getAmountColor(cycle.feedersCount)}`}>{cycle.feedersCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CycleIcon />
          <div>
            <p className="text-gray-500">Status</p>
            <p
              className={`font-medium ${
                cycle.status === "Active"
                  ? "text-green-600"
                  : cycle.status === "Expired"
                  ? "text-gray-600"
                  : "text-blue-600"
              }`}
            >
              {cycle.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon />
          <div>
            <p className="text-gray-500">Avg Tariff</p>
            <p className={`font-medium ${cycle.averageTariff === "Pending" ? "text-yellow-600" : "text-green-600"}`}>
              {cycle.averageTariff}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RevenueGeneratedIcon />
          <div>
            <p className="text-gray-500">Total Cap</p>
            <p className={`font-medium ${getAmountColor(cycle.totalEnergyCap)}`}>{cycle.totalEnergyCap}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const MobileEnergyCapCard = ({ cycle }: { cycle: EnergyCapCycle }) => (
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
            <p className="text-xs font-medium text-gray-900">P: {formatPeriod(cycle.period)}</p>
            <p className="text-xs text-gray-600">
              {cycle.appliedBy ? `By: ${cycle.appliedBy}` : "Pending"}
              {cycle.appliedAt && ` ${formatDate(cycle.appliedAt)}`}
            </p>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCycleTypeColor(cycle.status)}`}>Caps</span>
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
            <p className="text-gray-500">Feeders</p>
            <p className={`font-medium ${getAmountColor(cycle.feedersCount)}`}>{cycle.feedersCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CycleIcon />
          <div>
            <p className="text-gray-500">Status</p>
            <p
              className={`font-medium ${
                cycle.status === "Active"
                  ? "text-green-600"
                  : cycle.status === "Expired"
                  ? "text-gray-600"
                  : "text-blue-600"
              }`}
            >
              {cycle.status.charAt(0)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon />
          <div>
            <p className="text-gray-500">Tariff</p>
            <p className={`font-medium ${cycle.averageTariff === "Pending" ? "text-yellow-600" : "text-green-600"}`}>
              {cycle.averageTariff}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <RevenueGeneratedIcon />
          <div>
            <p className="text-gray-500">Cap</p>
            <p className={`font-medium ${getAmountColor(cycle.totalEnergyCap)} text-xs`}>{cycle.totalEnergyCap}</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (feederEnergyCapsLoading && energyCapCycles.length === 0) {
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
                <MobileEnergyCapCardSkeleton />
                <MobileEnergyCapCardSkeleton />
                <MobileEnergyCapCardSkeleton />
              </>
            ) : (
              <>
                <EnergyCapCardSkeleton />
                <EnergyCapCardSkeleton />
                <EnergyCapCardSkeleton />
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
        {/* Main Content - Energy Cap Cycles */}
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
              <h3 className="text-lg font-semibold sm:text-xl">Feeder Energy Caps</h3>
              <div className="flex items-center gap-3">
                {/* Filter Button for ALL screens up to 2xl */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white bg-white px-3 py-2 text-sm hover:bg-gray-50 2xl:hidden"
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
                <button
                  type="button"
                  onClick={() => setShowDesktopFilters((prev) => !prev)}
                  className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                >
                  {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                  {showDesktopFilters ? "Hide filters" : "Show filters"}
                </button>
              </div>
            </div>
            <div className="w-full sm:w-96">
              <SearchModule
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by period or feeder..."
                className="w-full"
              />
            </div>
            {feederEnergyCapsError && (
              <div className="mt-2 rounded-lg bg-red-50 p-2 sm:p-3">
                <p className="text-xs text-red-600 sm:text-sm">Error loading energy caps: {feederEnergyCapsError}</p>
              </div>
            )}
            {shouldShowFallback && (
              <div className="mt-2 rounded-lg bg-yellow-50 p-2 sm:p-3">
                <p className="text-xs text-yellow-600 sm:text-sm">Showing sample data - no energy caps found</p>
              </div>
            )}
          </div>

          {/* Energy Cap Cycles List */}
          <div className="space-y-3 sm:space-y-4">
            {displayCycles.map((cycle) =>
              isMobileView ? (
                <MobileEnergyCapCard key={cycle.id} cycle={cycle} />
              ) : (
                <EnergyCapCard key={cycle.id} cycle={cycle} />
              )
            )}
          </div>

          {/* Empty State */}
          {!feederEnergyCapsLoading && !feederEnergyCapsError && displayCycles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 sm:size-16">
                  <CyclesIcon />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No Energy Caps Found</h3>
                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                  {getActiveFilterCount() > 0 || searchText.trim()
                    ? "Try adjusting your search criteria or filters"
                    : "No energy caps available"}
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {displayCycles.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t pt-4 sm:mt-6 sm:flex-row">
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
                Page {pagination.currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()} total cycles)
                {(getActiveFilterCount() > 0 || searchText.trim()) && " - filtered"}
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
