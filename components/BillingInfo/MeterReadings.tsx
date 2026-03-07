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
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import Image from "next/image"

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

const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-40 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          </div>
          <div className="mt-1 h-4 w-48 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                },
              }}
            />
          </div>
        </div>
        <div className="h-8 w-20 rounded bg-gray-200">
          <motion.div
            className="size-full rounded bg-gray-300"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              },
            }}
          />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className="h-3 w-16 rounded bg-gray-200">
                    <motion.div
                      className="size-full rounded bg-gray-300"
                      initial={{ opacity: 0.3 }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        transition: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.1,
                        },
                      }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3">
                    <div className="h-4 w-12 rounded bg-gray-200">
                      <motion.div
                        className="size-full rounded bg-gray-300"
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          transition: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (rowIndex * 8 + cellIndex) * 0.05,
                          },
                        }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

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
  customerOptions: Array<{ value: string | number; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  feederOptions: Array<{ value: string | number; label: string }>
  distributionSubstationOptions: Array<{ value: string | number; label: string }>
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
            className="flex h-full w-full max-w-sm flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-white p-4">
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

            {/* Bottom Action Buttons */}
            <div className="flex-shrink-0 border-t bg-white p-4 2xl:hidden">
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
                  className="button-oulined flex-1"
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
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(true)

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
    setSearchInput("")
    setCurrentPage(1)
    dispatch(setMeterReadingPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
      setCurrentPage(1)
      dispatch(setMeterReadingPagination({ page: 1, pageSize: pagination.pageSize }))
    }
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
    setSearchInput("")
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
    router.push(`/metering/meter-readings/details/${reading.id}`)
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

  return (
    <>
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Meter Readings */}
        <div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
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
              {/* Active filters badge - Desktop only (2xl and above) */}
              {getActiveFilterCount() > 0 && (
                <div className="hidden items-center gap-2 2xl:flex">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onCancel={handleCancelSearch}
              onSearch={handleManualSearch}
              placeholder="Search meter readings..."
              className="w-full sm:w-96"
            />
          </div>

          {/* Loading State */}
          {meterReadingsLoading && <LoadingSkeleton />}

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

          {/* Meter Readings Table */}
          {!meterReadingsLoading && !meterReadingsError && displayReadings.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Readings
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Consumption
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Captured
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <AnimatePresence>
                      {displayReadings.map((reading, index) => (
                        <motion.tr
                          key={reading.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <div className="min-w-[150px] max-w-[200px]">
                              <p className="truncate text-sm font-medium text-gray-900">{reading.customerName}</p>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="min-w-[120px] max-w-[150px]">
                              <p className="truncate text-sm text-gray-700">{reading.customerAccountNumber}</p>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              P {reading.period}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="space-y-1 text-xs text-gray-600">
                              <p>Prev: {reading.previousReadingKwh.toLocaleString()}</p>
                              <p>Present: {reading.presentReadingKwh.toLocaleString()}</p>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {reading.validConsumptionKwh.toLocaleString()} kWh
                              </p>
                              {reading.estimatedConsumptionKwh != null && (
                                <p className="text-xs text-gray-500">
                                  Est: {reading.estimatedConsumptionKwh.toLocaleString()} kWh
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="space-y-1 text-xs text-gray-500">
                              <p>{formatDate(reading.capturedAtUtc)}</p>
                              <p>by {reading.capturedByName}</p>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                                  reading.isFlaggedForReview
                                    ? "border border-red-200 bg-red-50 text-red-700"
                                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    reading.isFlaggedForReview ? "bg-red-600" : "bg-emerald-600"
                                  }`}
                                />
                                {reading.isFlaggedForReview ? "Flagged" : "Normal"}
                              </span>
                              <p className="text-xs text-gray-500">Score: {(reading.anomalyScore ?? 0).toFixed(2)}</p>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex min-w-[100px] justify-end">
                              <ButtonModule
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(reading)}
                                className="border-gray-300 bg-white hover:bg-gray-50"
                              >
                                <VscEye className="size-3.5" />
                                View
                              </ButtonModule>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
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
        </div>

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
        periodOptions={periodOptions}
        customerOptions={customerOptions}
        areaOfficeOptions={areaOfficeOptions}
        feederOptions={feederOptions}
        distributionSubstationOptions={distributionSubstationOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </>
  )
}

export default MeterReadings
