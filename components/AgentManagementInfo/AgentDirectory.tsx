"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import {
  AddAgentIcon,
  BillsIcon,
  FloatIcon,
  MapIcon,
  PerformanceIcon,
  PhoneIcon,
  RateIcon,
  RouteIcon,
  TargetIcon,
  UserIcon,
} from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { type Agent, clearAgents, fetchAgents, AgentsRequestParams, setPagination } from "lib/redux/agentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { VscEye } from "react-icons/vsc"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
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
  statusOptions,
  canCollectCashOptions,
  areaOfficeOptions,
  sortOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | boolean | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  statusOptions: Array<{ value: string; label: string }>
  canCollectCashOptions: Array<{ value: string; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
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
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="status"
                  value={localFilters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Can Collect Cash Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Can Collect Cash</label>
                <FormSelectModule
                  name="canCollectCash"
                  value={localFilters.canCollectCash !== undefined ? localFilters.canCollectCash.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("canCollectCash", e.target.value === "" ? undefined : e.target.value === "true")
                  }
                  options={canCollectCashOptions}
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
                  onChange={(e) =>
                    handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={areaOfficeOptions}
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

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

// Skeleton Loader Components
const AgentCardSkeleton = () => (
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
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-4 w-40 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
        <div className="h-5 w-24 rounded bg-gray-200"></div>
        <div className="h-3 w-16 rounded bg-gray-200"></div>
        <div className="h-9 w-24 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 sm:gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200 sm:size-5"></div>
          <div className="space-y-1">
            <div className="h-3 w-20 rounded bg-gray-200 sm:w-24"></div>
            <div className="h-4 w-16 rounded bg-gray-200 sm:w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const MobileAgentCardSkeleton = () => (
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
        <div className="h-4 w-20 rounded bg-gray-200"></div>
        <div className="h-8 w-20 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-gray-200"></div>
          <div className="space-y-1">
            <div className="h-2 w-16 rounded bg-gray-200"></div>
            <div className="h-3 w-12 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
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
    <div className="mb-2 h-7 w-40 rounded bg-gray-200 sm:h-8"></div>
    <div className="h-12 w-full rounded-lg bg-gray-200 sm:w-96"></div>
  </motion.div>
)

interface AgentDirectoryProps {
  onStartNewCycle?: () => void
}

const AgentDirectory: React.FC<AgentDirectoryProps> = ({ onStartNewCycle }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { agents, loading, error, pagination } = useAppSelector((state) => state.agents)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)

  const [searchText, setSearchText] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Filter state
  const [localFilters, setLocalFilters] = useState<{
    status?: string
    canCollectCash?: boolean
    areaOfficeId?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({
    sortBy: "",
    sortOrder: "asc",
  })

  const [appliedFilters, setAppliedFilters] = useState<{
    status?: string
    canCollectCash?: boolean
    areaOfficeId?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({})

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch area offices for filter options
  useEffect(() => {
    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )

    return () => {
      dispatch(clearAreaOffices())
    }
  }, [dispatch])

  // Filter options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "LowFloat", label: "Low Float" },
  ]

  const canCollectCashOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]

  const areaOfficeOptions = [
    { value: "", label: "All Area Offices" },
    ...areaOffices.map((office) => ({
      value: office.id,
      label: office.nameOfNewOAreaffice || `Area Office ${office.id}`,
    })),
  ]

  const sortOptions: SortOption[] = [
    { label: "Name (A-Z)", value: "name", order: "asc" },
    { label: "Name (Z-A)", value: "name", order: "desc" },
    { label: "Status (A-Z)", value: "status", order: "asc" },
    { label: "Status (Z-A)", value: "status", order: "desc" },
    { label: "Cash At Hand (Low to High)", value: "cashAtHand", order: "asc" },
    { label: "Cash At Hand (High to Low)", value: "cashAtHand", order: "desc" },
  ]

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | number | boolean | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  // Handle sort changes
  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({
      status: localFilters.status,
      canCollectCash: localFilters.canCollectCash,
      areaOfficeId: localFilters.areaOfficeId,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    dispatch(setPagination({ page: 1, pageSize }))
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({})
    dispatch(setPagination({ page: 1, pageSize }))
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.status) count++
    if (appliedFilters.canCollectCash !== undefined) count++
    if (appliedFilters.areaOfficeId) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(setPagination({ page: 1, pageSize }))
    setCurrentPage(1)
  }

  // Fetch agents with filters
  useEffect(() => {
    const params: AgentsRequestParams = {
      pageNumber: currentPage,
      pageSize,
      ...(searchText && { search: searchText }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.canCollectCash !== undefined && { canCollectCash: appliedFilters.canCollectCash }),
      ...(appliedFilters.areaOfficeId && { areaOfficeId: appliedFilters.areaOfficeId }),
      ...(appliedFilters.sortBy && { sortBy: appliedFilters.sortBy }),
      ...(appliedFilters.sortOrder && { sortOrder: appliedFilters.sortOrder }),
    }

    dispatch(fetchAgents(params))

    return () => {
      // Don't clear agents on unmount to preserve data
    }
  }, [dispatch, currentPage, pageSize, searchText, appliedFilters])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusConfig = (status: string, canCollectCash: boolean) => {
    const normalized = status.toLowerCase()
    if (normalized === "active") {
      return { label: "Active", bg: "bg-green-100", text: "text-green-800" }
    }
    if (normalized === "inactive") {
      return { label: "Inactive", bg: "bg-gray-100", text: "text-gray-800" }
    }
    return canCollectCash
      ? { label: "Active", bg: "bg-green-100", text: "text-green-800" }
      : { label: "Inactive", bg: "bg-gray-100", text: "text-gray-800" }
  }

  // Desktop Agent Card
  const DesktopAgentCard = ({ agent }: { agent: Agent }) => {
    const statusConfig = getStatusConfig(agent.status, agent.canCollectCash)
    const phone = agent.user.phoneNumber
    const location = agent.areaOfficeName || agent.serviceCenterName || "N/A"

    return (
      <div
        key={agent.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 transition-shadow duration-200 hover:shadow-sm"
      >
        <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="text-gray-600">
                <UserIcon />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{agent.user.fullName}</h4>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <PhoneIcon />
                <p className="text-sm text-gray-600">{phone}</p>
              </div>
              <div className="flex items-center gap-1">
                <MapIcon />
                <p className="text-sm text-gray-600">{location}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
            <p className="text-sm font-semibold text-gray-900 sm:text-base">{formatCurrency(agent.cashAtHand)}</p>
            <p className="text-xs text-gray-500 sm:text-sm">Cash at hand</p>
            <ButtonModule
              variant="outline"
              type="button"
              size="sm"
              onClick={() => router.push(`/agent-management/all-agents/agent-detail/${agent.id}`)}
              className="mt-1 bg-white text-xs sm:text-sm"
              icon={<VscEye className="size-3 sm:size-4" />}
              iconPosition="start"
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
              <p className="text-gray-500">Collection limit</p>
              <p className="font-medium text-green-600">{formatCurrency(agent.cashCollectionLimit)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RateIcon />
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium text-green-600">{agent.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PerformanceIcon />
            <div>
              <p className="text-gray-500">Last collection</p>
              <p className="font-medium text-green-600">
                {agent.lastCashCollectionDate
                  ? new Date(agent.lastCashCollectionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile Agent Card
  const MobileAgentCard = ({ agent }: { agent: Agent }) => {
    const statusConfig = getStatusConfig(agent.status, agent.canCollectCash)
    const phone = agent.user.phoneNumber
    const location = agent.areaOfficeName || agent.serviceCenterName || "N/A"

    return (
      <div
        key={agent.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 transition-shadow duration-200 hover:shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-gray-600">
                <UserIcon />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">{agent.user.fullName}</h4>
            </div>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
            >
              {statusConfig.label}
            </span>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1">
                <PhoneIcon />
                <p className="text-xs text-gray-600">{phone}</p>
              </div>
              <div className="flex items-center gap-1">
                <MapIcon />
                <p className="text-xs text-gray-600">{location}</p>
              </div>
            </div>
          </div>
          <div className="ml-2 flex flex-col items-end gap-1">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900">{formatCurrency(agent.cashAtHand)}</p>
              <p className="text-[10px] text-gray-500">Cash at hand</p>
            </div>
            <ButtonModule
              variant="outline"
              type="button"
              size="sm"
              onClick={() => router.push(`/agent-management/all-agents/agent-detail/${agent.id}`)}
              className="bg-white text-xs"
              icon={<VscEye className="size-3" />}
              iconPosition="start"
            >
              View
            </ButtonModule>
          </div>
        </div>

        {/* Status Indicators - Mobile */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
          <div className="flex items-center gap-1">
            <BillsIcon />
            <div>
              <p className="text-gray-500">Limit</p>
              <p className="text-[10px] font-medium text-green-600">
                {agent.cashCollectionLimit > 1000000
                  ? `₦${(agent.cashCollectionLimit / 1000000).toFixed(1)}M`
                  : formatCurrency(agent.cashCollectionLimit)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <RateIcon />
            <div>
              <p className="text-gray-500">Status</p>
              <p className="text-[10px] font-medium text-green-600">{agent.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PerformanceIcon />
            <div>
              <p className="text-gray-500">Last collect</p>
              <p className="text-[10px] font-medium text-green-600">
                {agent.lastCashCollectionDate
                  ? new Date(agent.lastCashCollectionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FloatIcon />
            <div>
              <p className="text-gray-500">Float</p>
              <p className="text-[10px] font-medium text-blue-600">
                {agent.cashAtHand > 1000000
                  ? `₦${(agent.cashAtHand / 1000000).toFixed(1)}M`
                  : formatCurrency(agent.cashAtHand)}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && agents.length === 0) {
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
                <MobileAgentCardSkeleton />
                <MobileAgentCardSkeleton />
                <MobileAgentCardSkeleton />
              </>
            ) : (
              <>
                <AgentCardSkeleton />
                <AgentCardSkeleton />
                <AgentCardSkeleton />
              </>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row-reverse">
        {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
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
              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="status"
                  value={localFilters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                  options={statusOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Can Collect Cash Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Can Collect Cash</label>
                <FormSelectModule
                  name="canCollectCash"
                  value={localFilters.canCollectCash !== undefined ? localFilters.canCollectCash.toString() : ""}
                  onChange={(e) =>
                    handleFilterChange("canCollectCash", e.target.value === "" ? undefined : e.target.value === "true")
                  }
                  options={canCollectCashOptions}
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
                  onChange={(e) =>
                    handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                  }
                  options={areaOfficeOptions}
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
                  <span className="font-medium">{pagination?.totalCount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {currentPage} / {pagination?.totalPages || 1}
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

        {/* Main Content - Agent Directory */}
        <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-lg border bg-white p-3 sm:p-4 md:p-6 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-lg border bg-white p-3 sm:p-4 md:p-6 2xl:flex-1"
          }
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 sm:mb-6">
            <div className="mb-4 flex w-full flex-col justify-between gap-4 max-md:flex-col md:flex-row md:items-center">
              <h3 className="text-lg font-semibold sm:text-xl">Agent Directory</h3>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 2xl:hidden"
                >
                  <Filter className="size-4" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* Desktop Filter Toggle */}
                <button
                  onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                  className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 2xl:flex"
                >
                  <Filter className="size-4" />
                  {showDesktopFilters ? "Hide Filters" : "Show Filters"}
                  {getActiveFilterCount() > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="w-full sm:w-96">
              <SearchModule
                placeholder="Search agents..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                className="w-full"
              />
            </div>
            {error && (
              <div className="mt-2 rounded-lg bg-red-50 p-2 sm:p-3">
                <p className="text-xs text-red-600 sm:text-sm">Error loading agents: {error}</p>
              </div>
            )}
          </div>

        {/* Agents List */}
        <div className="space-y-3 sm:space-y-4">
          {loading && agents.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 text-center">
              <p className="text-sm text-gray-600">Loading more agents...</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center sm:p-4">
              <p className="text-sm text-red-700 sm:text-base">{error}</p>
            </div>
          )}

          {!loading && !error && agents.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 text-center">
              <div className="flex flex-col items-center justify-center py-4 sm:py-8">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 sm:size-16">
                  <UserIcon />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No Agents Found</h3>
                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                  {searchText.trim() || getActiveFilterCount() > 0
                    ? "Try adjusting your search criteria or filters"
                    : "No agents available in the system"}
                </p>
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            agents.map((agent) =>
              isMobileView ? (
                <MobileAgentCard key={agent.id} agent={agent} />
              ) : (
                <DesktopAgentCard key={agent.id} agent={agent} />
              )
            )}
        </div>

        {/* Load More Button */}
        {!loading && agents.length > 0 && pagination.hasNext && (
          <div className="mt-4 flex justify-center border-t pt-4">
            <ButtonModule
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage((prev) => prev + 1)
              }}
              className="text-sm"
            >
              Load More Agents
            </ButtonModule>
          </div>
        )}
        </motion.div>
      </div>

      {/* Mobile Filter Sidebar */}
      <MobileFilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        statusOptions={statusOptions}
        canCollectCashOptions={canCollectCashOptions}
        areaOfficeOptions={areaOfficeOptions}
        sortOptions={sortOptions}
      />
    </div>
  )
}

export default AgentDirectory
