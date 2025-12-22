"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { useRouter } from "next/navigation"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { Feeder, FeedersRequestParams, clearError, fetchFeeders, setPagination } from "lib/redux/feedersSlice"
import { fetchCompanies } from "lib/redux/companySlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchInjectionSubstations } from "lib/redux/injectionSubstationSlice"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

interface ActionDropdownProps {
  feeder: Feeder
  onViewDetails: (feeder: Feeder) => void
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ feeder, onViewDetails }) => {
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
    onViewDetails(feeder)
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
                  router.push(`/assets-management/feeders/update-feeder/${feeder.id}`)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Feeder
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
              {[...Array(8)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
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

const FeedersTab: React.FC = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { feeders, loading, error, pagination } = useAppSelector((state) => state.feeders)
  const { companies } = useAppSelector((state) => state.companies)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { injectionSubstations } = useAppSelector((state) => state.injectionSubstations)

  const [searchInput, setSearchInput] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  // Local filter state (not applied yet)
  const [localFilters, setLocalFilters] = useState({
    companyId: "",
    areaOfficeId: "",
    injectionSubstationId: "",
    feederNameId: "",
    status: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters (used for API calls and client-side filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    searchText: "",
    companyId: "",
    areaOfficeId: "",
    injectionSubstationId: "",
    feederNameId: "",
    status: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Get pagination values from Redux state
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize
  const totalRecords = pagination.totalCount
  const totalPages = pagination.totalPages

  // Fetch companies, area offices, and injection substations for filter options
  useEffect(() => {
    dispatch(
      fetchCompanies({
        pageNumber: 1,
        pageSize: 1000,
      })
    )
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 1000,
      })
    )
    dispatch(
      fetchInjectionSubstations({
        pageNumber: 1,
        pageSize: 1000,
      })
    )
  }, [dispatch])

  // Extract unique feeder names from feeders for filter options (client-side only)
  const uniqueFeederNames = React.useMemo(() => {
    if (!feeders || feeders.length === 0) return []
    const feederMap = new Map<number, { id: number; name: string }>()
    feeders.forEach((feeder) => {
      if (feeder.id && feeder.name) {
        if (!feederMap.has(feeder.id)) {
          feederMap.set(feeder.id, {
            id: feeder.id,
            name: feeder.name,
          })
        }
      }
    })
    return Array.from(feederMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [feeders])

  // Status options for filter
  const statusOptions = [
    { value: "operational", label: "Operational" },
    { value: "maintenance", label: "Maintenance" },
    { value: "faulty", label: "Faulty" },
    { value: "limited_operations", label: "Limited Operations" },
  ]

  // Function to get status for a feeder
  const getFeederStatus = React.useCallback((feeder: Feeder): string => {
    // Default to operational for all feeders
    // You can add logic here based on feeder properties
    return "operational"
  }, [])

  // Client-side filtering for status and feeder name
  const filteredFeeders = React.useMemo(() => {
    let filtered = feeders

    // Filter by feeder name ID
    if (appliedFilters.feederNameId) {
      filtered = filtered.filter((feeder) => feeder.id.toString() === appliedFilters.feederNameId)
    }

    // Filter by status (client-side filtering based on computed status)
    if (appliedFilters.status) {
      filtered = filtered.filter((feeder) => getFeederStatus(feeder) === appliedFilters.status)
    }

    return filtered
  }, [feeders, appliedFilters.feederNameId, appliedFilters.status, getFeederStatus])

  // Fetch feeders on component mount and when applied filters/pagination change
  useEffect(() => {
    const fetchParams: FeedersRequestParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(appliedFilters.searchText && { search: appliedFilters.searchText }),
      ...(appliedFilters.companyId && { companyId: parseInt(appliedFilters.companyId) }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: parseInt(appliedFilters.areaOfficeId) }),
      ...(appliedFilters.injectionSubstationId && { injectionSubstationId: parseInt(appliedFilters.injectionSubstationId) }),
    }

    dispatch(fetchFeeders(fetchParams))
  }, [dispatch, currentPage, pageSize, appliedFilters])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const getStatusStyle = (status: string) => {
    const effectiveStatus = status || "operational"

    switch (effectiveStatus) {
      case "operational":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "maintenance":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "faulty":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "limited_operations":
        return {
          backgroundColor: "#EFF6FF",
          color: "#3B82F6",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" || value === undefined ? (key === "status" ? undefined : "") : value,
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
      searchText: searchInput.trim(),
      companyId: localFilters.companyId,
      areaOfficeId: localFilters.areaOfficeId,
      injectionSubstationId: localFilters.injectionSubstationId,
      feederNameId: localFilters.feederNameId,
      status: localFilters.status,
      sortBy: localFilters.sortBy,
      sortOrder: localFilters.sortOrder,
    })
    dispatch(setPagination({ page: 1, pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      companyId: "",
      areaOfficeId: "",
      injectionSubstationId: "",
      feederNameId: "",
      status: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setSearchInput("")
    setAppliedFilters({
      searchText: "",
      companyId: "",
      areaOfficeId: "",
      injectionSubstationId: "",
      feederNameId: "",
      status: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    dispatch(setPagination({ page: 1, pageSize }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.searchText) count++
    if (appliedFilters.companyId) count++
    if (appliedFilters.areaOfficeId) count++
    if (appliedFilters.injectionSubstationId) count++
    if (appliedFilters.feederNameId) count++
    if (appliedFilters.status) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleCancelSearch = () => {
    setSearchInput("")
  }

  const handleViewFeederDetails = (feeder: Feeder) => {
    router.push(`/assets-management/feeders/feeder-details/${feeder.id}`)
  }

  const paginate = (pageNumber: number) => {
    dispatch(setPagination({ page: pageNumber, pageSize }))
  }

  const sortOptions: SortOption[] = [
    { label: "Name A-Z", value: "name", order: "asc" },
    { label: "Name Z-A", value: "name", order: "desc" },
    { label: "NERC Code A-Z", value: "nercCode", order: "asc" },
    { label: "NERC Code Z-A", value: "nercCode", order: "desc" },
    { label: "KAEDCO Code A-Z", value: "kaedcoFeederCode", order: "asc" },
    { label: "KAEDCO Code Z-A", value: "kaedcoFeederCode", order: "desc" },
    { label: "Voltage Low-High", value: "feederVoltage", order: "asc" },
    { label: "Voltage High-Low", value: "feederVoltage", order: "desc" },
  ]

  // Mobile Filter Sidebar Component
  const MobileFilterSidebar = () => {
    return (
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="flex w-full max-w-sm flex-col bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMobileFilters(false)}
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
                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("status", localFilters.status === option.value ? undefined : option.value)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === option.value
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Company</label>
                  <FormSelectModule
                    name="company"
                    value={localFilters.companyId}
                    onChange={(e) => handleFilterChange("companyId", e.target.value)}
                    options={[
                      { value: "", label: "All Companies" },
                      ...companies.map((company) => ({
                        value: company.id.toString(),
                        label: company.name,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Area Office Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                  <FormSelectModule
                    name="areaOffice"
                    value={localFilters.areaOfficeId}
                    onChange={(e) => handleFilterChange("areaOfficeId", e.target.value)}
                    options={[
                      { value: "", label: "All Area Offices" },
                      ...areaOffices.map((office) => ({
                        value: office.id.toString(),
                        label: office.nameOfNewOAreaffice,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Injection Substation Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                    Injection Substation
                  </label>
                  <FormSelectModule
                    name="injectionSubstation"
                    value={localFilters.injectionSubstationId}
                    onChange={(e) => handleFilterChange("injectionSubstationId", e.target.value)}
                    options={[
                      { value: "", label: "All Injection Substations" },
                      ...injectionSubstations.map((substation) => ({
                        value: substation.id.toString(),
                        label: substation.injectionSubstationCode,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Feeder Name Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder Name</label>
                  <FormSelectModule
                    name="feederName"
                    value={localFilters.feederNameId}
                    onChange={(e) => handleFilterChange("feederNameId", e.target.value)}
                    options={[
                      { value: "", label: "All Feeders" },
                      ...uniqueFeederNames.map((feeder) => ({
                        value: feeder.id.toString(),
                        label: feeder.name,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSortExpanded((prev) => !prev)}
                    className="mb-2 flex w-full items-center justify-between text-sm font-medium"
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
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                              : "bg-gray-50 text-gray-700"
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
                      setShowMobileFilters(false)
                    }}
                    className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      resetFilters()
                      setShowMobileFilters(false)
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

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="p-4 text-red-500">Error loading feeder data: {error}</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <MobileFilterSidebar />
      <div className="flex flex-col items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content */}
        <div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
        >
          <motion.div
            className="items-center justify-between border-b py-2 md:flex md:py-4"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-3 flex items-center gap-3 md:mb-0">
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
                <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Feeders</p>
                <p className="text-sm text-gray-600">Manage and monitor feeder operations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchModule
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search feeders..."
                className="w-full max-w-[300px]"
                bgClassName="bg-white"
              />

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

          {filteredFeeders.length === 0 ? (
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
                {appliedFilters.searchText || getActiveFilterCount() > 0
                  ? "No matching feeders found"
                  : "No feeders available"}
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
            <div className="min-w-0">
              <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      ID
                    </div>
                  </th>
                  <th className="text-500 whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Name</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">NERC Code</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">KAEDCO Code</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Voltage (KV)</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Injection Substation</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">HT Pole</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Status</div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredFeeders.map((feeder, index) => (
                    <motion.tr
                      key={feeder.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">FD-{feeder.id}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{feeder.name || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{feeder.nercCode || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{feeder.kaedcoFeederCode || "-"}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{feeder.feederVoltage ?? "-"} KV</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {feeder?.injectionSubstation?.injectionSubstationCode || "-"}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {feeder.htPole?.htPoleNumber || "-"}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {(() => {
                          const feederStatus = getFeederStatus(feeder)
                          const statusConfig = getStatusStyle(feederStatus)
                          const statusLabel = statusOptions.find((opt) => opt.value === feederStatus)?.label || feederStatus
                          const statusColorMap: { [key: string]: string } = {
                            operational: "#589E67",
                            maintenance: "#D97706",
                            faulty: "#AF4B4B",
                            limited_operations: "#3B82F6",
                          }
                          return (
                            <motion.div
                              style={statusConfig}
                              className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs capitalize"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.1 }}
                            >
                              <span
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor: statusColorMap[feederStatus] || "#6B7280",
                                }}
                              ></span>
                              {statusLabel}
                            </motion.div>
                          )
                        })()}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ActionDropdown feeder={feeder} onViewDetails={handleViewFeederDetails} />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-between gap-4 border-t py-3 sm:flex-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-xs text-gray-700 sm:text-sm">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of{" "}
              {totalRecords} entries
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                <MdOutlineArrowBackIosNew />
              </motion.button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = index + 1
                } else if (currentPage <= 3) {
                  pageNum = index + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index
                } else {
                  pageNum = currentPage - 2 + index
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => paginate(pageNum)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-[#004B23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

              {totalPages > 5 && currentPage < totalPages - 1 && (
                <motion.button
                  onClick={() => paginate(totalPages)}
                  className={`flex size-8 items-center justify-center rounded-md text-sm ${
                    currentPage === totalPages
                      ? "bg-[#004B23] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {totalPages}
                </motion.button>
              )}

              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                <MdOutlineArrowForwardIos />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
        </div>

        {/* Desktop Filters Sidebar (2xl and above) */}
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
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleFilterChange("status", localFilters.status === option.value ? undefined : option.value)
                      }
                      className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                        localFilters.status === option.value
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Company</label>
                <FormSelectModule
                  name="company"
                  value={localFilters.companyId}
                  onChange={(e) => handleFilterChange("companyId", e.target.value)}
                  options={[
                    { value: "", label: "All Companies" },
                    ...companies.map((company) => ({
                      value: company.id.toString(),
                      label: company.name,
                    })),
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Area Office Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                <FormSelectModule
                  name="areaOffice"
                  value={localFilters.areaOfficeId}
                  onChange={(e) => handleFilterChange("areaOfficeId", e.target.value)}
                  options={[
                    { value: "", label: "All Area Offices" },
                    ...areaOffices.map((office) => ({
                      value: office.id.toString(),
                      label: office.nameOfNewOAreaffice,
                    })),
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Injection Substation Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Injection Substation</label>
                <FormSelectModule
                  name="injectionSubstation"
                  value={localFilters.injectionSubstationId}
                  onChange={(e) => handleFilterChange("injectionSubstationId", e.target.value)}
                  options={[
                    { value: "", label: "All Injection Substations" },
                    ...injectionSubstations.map((substation) => ({
                      value: substation.id.toString(),
                      label: substation.injectionSubstationCode,
                    })),
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Feeder Name Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder Name</label>
                <FormSelectModule
                  name="feederName"
                  value={localFilters.feederNameId}
                  onChange={(e) => handleFilterChange("feederNameId", e.target.value)}
                  options={[
                    { value: "", label: "All Feeders" },
                    ...uniqueFeederNames.map((feeder) => ({
                      value: feeder.id.toString(),
                      label: feeder.name,
                    })),
                  ]}
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
                    {currentPage} / {totalPages}
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
    </motion.div>
  )
}

export default FeedersTab
