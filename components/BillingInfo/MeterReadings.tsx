"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { VscEye } from "react-icons/vsc"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { ButtonModule } from "components/ui/Button/Button"
import { BillsIdIcon, CategoryIcon, CycleIcon, DateIcon, RevenueGeneratedIcon } from "components/Icons/Icons"
import PdfFile from "public/pdf-file"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  fetchMeterReadings,
  MeterReading,
  setPagination as setMeterReadingPagination,
} from "lib/redux/meterReadingSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearFeeders, fetchFeeders } from "lib/redux/feedersSlice"
import { clearDistributionSubstations, fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { clearCustomers, fetchCustomers } from "lib/redux/customerSlice"
import { ArrowLeft, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface MeterReadingsProps {
  onExport?: () => void
  onGenerateBills?: () => void
  onViewDetails?: (reading: MeterReading) => void
}

// Responsive Skeleton Components
const MeterReadingCardSkeleton = () => (
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
          <div className="h-5 w-32 rounded bg-gray-200 sm:w-40"></div>
          <div className="h-6 w-20 rounded-full bg-gray-200"></div>
        </div>
        <div className="space-y-1">
          <div className="h-4 w-40 rounded bg-gray-200 sm:w-48"></div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full bg-gray-200"></div>
            <div className="h-3 w-56 rounded bg-gray-200 sm:w-64"></div>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
        <div className="space-y-1 text-right">
          <div className="h-3 w-24 rounded bg-gray-200 sm:w-28"></div>
          <div className="h-3 w-28 rounded bg-gray-200 sm:w-32"></div>
          <div className="h-4 w-32 rounded bg-gray-200 sm:w-36"></div>
        </div>
        <div className="h-8 w-24 rounded-md border border-gray-200 bg-white"></div>
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

const MobileMeterReadingCardSkeleton = () => (
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
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-5 w-16 rounded-full bg-gray-200"></div>
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-3 w-32 rounded bg-gray-200"></div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded-full bg-gray-200"></div>
            <div className="h-3 w-40 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
      <div className="ml-2 flex flex-col items-end gap-1">
        <div className="space-y-1 text-right">
          <div className="h-2 w-20 rounded bg-gray-200"></div>
          <div className="w-22 h-2 rounded bg-gray-200"></div>
          <div className="h-3 w-24 rounded bg-gray-200"></div>
        </div>
        <div className="h-7 w-20 rounded-md border border-gray-200 bg-white"></div>
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

const HeaderSkeleton = () => (
  <motion.div
    className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
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
    <div className="h-7 w-40 rounded bg-gray-200 sm:w-48"></div>
    <div className="flex gap-2">
      <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
      <div className="h-9 w-28 rounded bg-gray-200 sm:w-32"></div>
    </div>
  </motion.div>
)

const SearchSkeleton = () => (
  <motion.div
    className="mb-6 h-12 w-full rounded-lg bg-gray-200 sm:w-96"
    initial={{ opacity: 0.6 }}
    animate={{
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  ></motion.div>
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
  customerOptions,
  areaOfficeOptions,
  feederOptions,
  distributionSubstationOptions,
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
  customerOptions: Array<{ value: string | number; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  feederOptions: Array<{ value: string | number; label: string }>
  distributionSubstationOptions: Array<{ value: string | number; label: string }>
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

              {/* Customer Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                <FormSelectModule
                  name="customerId"
                  value={localFilters.customerId || ""}
                  onChange={(e) => handleFilterChange("customerId", e.target.value || undefined)}
                  options={customerOptions}
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

              {/* Distribution Substation Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                  Distribution Substation
                </label>
                <FormSelectModule
                  name="distributionSubstationId"
                  value={localFilters.distributionSubstationId || ""}
                  onChange={(e) => handleFilterChange("distributionSubstationId", e.target.value || undefined)}
                  options={distributionSubstationOptions}
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

const MeterReadings: React.FC<MeterReadingsProps> = ({ onExport, onGenerateBills, onViewDetails }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { meterReadings, meterReadingsLoading, meterReadingsError, pagination } = useAppSelector(
    (state) => state.meterReadings
  )
  const { customers } = useAppSelector((state) => state.customers)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { feeders } = useAppSelector((state) => state.feeders)
  const { distributionSubstations } = useAppSelector((state) => state.distributionSubstations)

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    period: "",
    customerId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    distributionSubstationId: undefined as number | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    period: undefined as string | undefined,
    customerId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    feederId: undefined as number | undefined,
    distributionSubstationId: undefined as number | undefined,
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

  // Fetch customers, area offices, feeders, and distribution substations on component mount for filter dropdowns
  useEffect(() => {
    dispatch(
      fetchCustomers({
        pageNumber: 1,
        pageSize: 100,
      })
    )

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
      fetchDistributionSubstations({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Cleanup function to clear states when component unmounts
    return () => {
      dispatch(clearCustomers())
      dispatch(clearAreaOffices())
      dispatch(clearFeeders())
      dispatch(clearDistributionSubstations())
    }
  }, [dispatch])

  useEffect(() => {
    const fetchParams: any = {
      pageNumber: currentPage,
      pageSize: pagination.pageSize,
      ...(searchText && { customerId: Number(searchText) }),
      ...(appliedFilters.period && { period: appliedFilters.period }),
      ...(appliedFilters.customerId !== undefined && { customerId: appliedFilters.customerId }),
      ...(appliedFilters.areaOfficeId !== undefined && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.feederId !== undefined && { feederId: appliedFilters.feederId }),
      ...(appliedFilters.distributionSubstationId !== undefined && {
        distributionSubstationId: appliedFilters.distributionSubstationId,
      }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    void dispatch(fetchMeterReadings(fetchParams))
  }, [dispatch, currentPage, pagination.pageSize, searchText, appliedFilters])

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
    dispatch(setMeterReadingPagination({ page: 1, pageSize: pagination.pageSize }))
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

    const existingPeriods = Array.from(new Set(meterReadings.map((reading) => reading.period)))
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

  // Customer options
  const customerOptions = [
    { value: "", label: "All Customers" },
    ...customers.map((customer) => ({
      value: customer.id,
      label: `${customer.fullName} (${customer.accountNumber})`,
    })),
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

  // Distribution substation options
  const distributionSubstationOptions = [
    { value: "", label: "All Distribution Substations" },
    ...distributionSubstations.map((substation) => ({
      value: substation.id,
      label: `${substation.dssCode} (${substation.nercCode})`,
    })),
  ]

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Customer Name A-Z", value: "customerName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerName", order: "desc" },
    { label: "Period Asc", value: "period", order: "asc" },
    { label: "Period Desc", value: "period", order: "desc" },
    { label: "Consumption Low-High", value: "validConsumptionKwh", order: "asc" },
    { label: "Consumption High-Low", value: "validConsumptionKwh", order: "desc" },
    { label: "Captured Date Asc", value: "capturedAtUtc", order: "asc" },
    { label: "Captured Date Desc", value: "capturedAtUtc", order: "desc" },
    { label: "Anomaly Score Low-High", value: "anomalyScore", order: "asc" },
    { label: "Anomaly Score High-Low", value: "anomalyScore", order: "desc" },
    { label: "Status Asc", value: "isFlaggedForReview", order: "asc" },
    { label: "Status Desc", value: "isFlaggedForReview", order: "desc" },
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
      customerId: localFilters.customerId,
      areaOfficeId: localFilters.areaOfficeId,
      feederId: localFilters.feederId,
      distributionSubstationId: localFilters.distributionSubstationId,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    setCurrentPage(1)
    dispatch(setMeterReadingPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      period: "",
      customerId: undefined,
      areaOfficeId: undefined,
      feederId: undefined,
      distributionSubstationId: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      period: undefined,
      customerId: undefined,
      areaOfficeId: undefined,
      feederId: undefined,
      distributionSubstationId: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
    setSearchText("")
    setCurrentPage(1)
    dispatch(setMeterReadingPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.period) count++
    if (localFilters.customerId !== undefined) count++
    if (localFilters.areaOfficeId !== undefined) count++
    if (localFilters.feederId !== undefined) count++
    if (localFilters.distributionSubstationId !== undefined) count++
    if (localFilters.sortBy) count++
    return count
  }

  const handleViewDetails = (reading: MeterReading) => {
    // Navigate to the meter reading details page
    router.push(`/billing/meter-readings/details/${reading.id}`)
    onViewDetails?.(reading)
  }

  // No client-side filtering - using API filters
  const displayReadings = meterReadings

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    void dispatch(
      fetchMeterReadings({
        pageNumber: 1,
        pageSize: newPageSize,
      })
    )
    setCurrentPage(1)
  }

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const MeterReadingCard = ({ reading }: { reading: MeterReading }) => (
    <motion.div
      className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 hover:shadow-sm sm:p-4"
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{reading.customerName}</h4>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
              Period {reading.period}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-900 sm:text-base">{reading.customerAccountNumber}</p>
          <div className="mt-1 flex items-center gap-2">
            <DateIcon />
            <p className="text-xs text-gray-600 sm:text-sm">
              Captured: {formatDate(reading.capturedAtUtc)} by {reading.capturedByName}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
          <div className="text-right text-xs sm:text-sm">
            <p className="text-gray-500">Prev: {reading.previousReadingKwh.toLocaleString()} kWh</p>
            <p className="text-gray-500">Present: {reading.presentReadingKwh.toLocaleString()} kWh</p>
            <p className="font-semibold text-gray-900">Valid: {reading.validConsumptionKwh.toLocaleString()} kWh</p>
          </div>
          <ButtonModule
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(reading)}
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
          <BillsIdIcon />
          <div>
            <p className="text-gray-500">Reading ID</p>
            <p className="font-medium text-gray-900">{reading.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CategoryIcon />
          <div>
            <p className="text-gray-500">Anomaly Score</p>
            <p className="font-medium text-gray-900">{(reading.anomalyScore ?? 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CycleIcon />
          <div>
            <p className="text-gray-500">Flagged</p>
            <p className={`font-medium ${reading.isFlaggedForReview ? "text-red-600" : "text-green-600"}`}>
              {reading.isFlaggedForReview ? "Yes" : "No"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RevenueGeneratedIcon />
          <div>
            <p className="text-gray-500">Estimated</p>
            <p className="font-medium text-gray-900">
              {reading.estimatedConsumptionKwh != null
                ? `${reading.estimatedConsumptionKwh.toLocaleString()} kWh`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const MobileMeterReadingCard = ({ reading }: { reading: MeterReading }) => (
    <motion.div
      className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 hover:shadow-sm"
      whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{reading.customerName}</h4>
            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-800">
              P {reading.period}
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <p className="text-xs font-medium text-gray-900">{reading.customerAccountNumber}</p>
            <div className="flex items-center gap-1">
              <DateIcon />
              <p className="text-xs text-gray-600">
                {formatDate(reading.capturedAtUtc)} by {reading.capturedByName}
              </p>
            </div>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end gap-1">
          <div className="text-right text-xs">
            <p className="text-gray-500">P: {reading.previousReadingKwh.toLocaleString()}</p>
            <p className="text-gray-500">C: {reading.presentReadingKwh.toLocaleString()}</p>
            <p className="font-semibold text-gray-900">V: {reading.validConsumptionKwh.toLocaleString()}</p>
          </div>
          <ButtonModule
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(reading)}
            icon={<VscEye />}
            iconPosition="start"
            className="bg-white text-xs"
          >
            View
          </ButtonModule>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
        <div className="flex items-center gap-1">
          <BillsIdIcon />
          <div>
            <p className="text-gray-500">ID</p>
            <p className="font-medium text-gray-900">{reading.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CategoryIcon />
          <div>
            <p className="text-gray-500">Score</p>
            <p className="font-medium text-gray-900">{(reading.anomalyScore ?? 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CycleIcon />
          <div>
            <p className="text-gray-500">Flagged</p>
            <p className={`font-medium ${reading.isFlaggedForReview ? "text-red-600" : "text-green-600"}`}>
              {reading.isFlaggedForReview ? "Yes" : "No"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <RevenueGeneratedIcon />
          <div>
            <p className="text-gray-500">Est.</p>
            <p className="font-medium text-gray-900">
              {reading.estimatedConsumptionKwh != null ? `${reading.estimatedConsumptionKwh.toLocaleString()}k` : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Meter Readings */}
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
          {/* Header */}
          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
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
              <h3 className="text-lg font-semibold sm:text-xl">Recent Meter Readings</h3>
            </div>
            <div className="flex items-center gap-2">
              <ButtonModule
                icon={<PdfFile />}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
                onClick={onExport}
              >
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </ButtonModule>
              <ButtonModule variant="primary" size="sm" className="text-xs sm:text-sm" onClick={onGenerateBills}>
                <span className="hidden sm:inline">Generate Bills</span>
                <span className="sm:hidden">Generate</span>
              </ButtonModule>
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
          </div>

          {/* Search */}
          <div className="mb-4 sm:mb-6">
            <SearchModule
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setCurrentPage(1)
                dispatch(setMeterReadingPagination({ page: 1, pageSize: pagination.pageSize }))
              }}
              onCancel={handleCancelSearch}
              placeholder="Search meter readings..."
              className="w-full sm:w-96"
            />
          </div>

          {/* Loading State */}
          {meterReadingsLoading && (
            <div className="space-y-3 sm:space-y-4">
              {isMobileView ? (
                <>
                  <MobileMeterReadingCardSkeleton />
                  <MobileMeterReadingCardSkeleton />
                  <MobileMeterReadingCardSkeleton />
                </>
              ) : (
                <>
                  <MeterReadingCardSkeleton />
                  <MeterReadingCardSkeleton />
                  <MeterReadingCardSkeleton />
                </>
              )}
            </div>
          )}

          {/* Error State */}
          {!meterReadingsLoading && meterReadingsError && (
            <div className="rounded-lg bg-red-50 p-3 sm:p-4">
              <p className="text-xs text-red-600 sm:text-sm">Error loading meter readings: {meterReadingsError}</p>
            </div>
          )}

          {/* Empty State */}
          {!meterReadingsLoading && !meterReadingsError && displayReadings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 sm:size-16">
                  <DateIcon />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No Meter Readings Found</h3>
                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                  {getActiveFilterCount() > 0 || searchText.trim()
                    ? "Try adjusting your search criteria or filters"
                    : "No meter readings available"}
                </p>
              </div>
            </div>
          )}

          {/* Meter Readings List */}
          {!meterReadingsLoading && !meterReadingsError && displayReadings.length > 0 && (
            <>
              <div className="space-y-3 sm:space-y-4">
                {displayReadings.map((reading) =>
                  isMobileView ? (
                    <MobileMeterReadingCard key={reading.id} reading={reading} />
                  ) : (
                    <MeterReadingCard key={reading.id} reading={reading} />
                  )
                )}
              </div>

              {/* Pagination */}
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
                  Page {currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()} total meter readings)
                  {(getActiveFilterCount() > 0 || searchText.trim()) && " - filtered"}
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
            className="hidden w-full flex-col rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:flex 2xl:w-80 2xl:max-h-[calc(100vh-200px)]"
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

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
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

              {/* Customer Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer</label>
                <FormSelectModule
                  name="customerId"
                  value={localFilters.customerId || ""}
                  onChange={(e) => handleFilterChange("customerId", e.target.value || undefined)}
                  options={customerOptions}
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

              {/* Distribution Substation Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                  Distribution Substation
                </label>
                <FormSelectModule
                  name="distributionSubstationId"
                  value={localFilters.distributionSubstationId || ""}
                  onChange={(e) => handleFilterChange("distributionSubstationId", e.target.value || undefined)}
                  options={distributionSubstationOptions}
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
        periodOptions={periodOptions}
        customerOptions={customerOptions}
        areaOfficeOptions={areaOfficeOptions}
        feederOptions={feederOptions}
        distributionSubstationOptions={distributionSubstationOptions}
        sortOptions={sortOptions}
      />
    </>
  )
}

export default MeterReadings
