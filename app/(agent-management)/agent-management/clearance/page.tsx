"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Info,
  Loader2,
  Search,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { AgentsRequestParams, fetchAgents } from "lib/redux/agentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import AgentClearanceTable from "components/Tables/AgentClearanceTable"

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
  agentOptions,
  areaOfficeOptions,
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
  agentOptions: Array<{ value: string | number; label: string }>
  areaOfficeOptions: Array<{ value: string | number; label: string }>
  sortOptions: SortOption[]
  isSortExpanded: boolean
  setIsSortExpanded: (value: boolean | ((prev: boolean) => boolean)) => void
}) => {
  return (
    <AnimatePresence>
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
            {/* Header - Fixed */}
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
                {/* Agent Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Agent</label>
                  <FormSelectModule
                    name="agentId"
                    value={localFilters.agentId || ""}
                    onChange={(e) => handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)}
                    options={agentOptions}
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

                {/* Date Range Filters */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Start Date</label>
                  <input
                    type="date"
                    value={localFilters.startDate || ""}
                    onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">End Date</label>
                  <input
                    type="date"
                    value={localFilters.endDate || ""}
                    onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
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

            {/* Bottom Action Buttons - Fixed */}
            <div className="flex-shrink-0 border-t bg-white p-4 2xl:hidden">
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

export default function CashClearancesPage() {
  const dispatch = useAppDispatch()
  const { agents } = useAppSelector((state) => state.agents)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    agentId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState({
    agentId: undefined as number | undefined,
    areaOfficeId: undefined as number | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  })

  // Fetch agents and area offices for filter options
  useEffect(() => {
    dispatch(
      fetchAgents({
        pageNumber: 1,
        pageSize: 100,
      } as AgentsRequestParams)
    )

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
  const agentOptions = [
    { value: "", label: "All Agents" },
    ...agents.map((agent) => ({
      value: agent.id,
      label: agent.user.fullName,
    })),
  ]

  const areaOfficeOptions = [
    { value: "", label: "All Area Offices" },
    ...areaOffices.map((office) => ({
      value: office.id,
      label: office.nameOfNewOAreaffice || `Area Office ${office.id}`,
    })),
  ]

  const sortOptions: SortOption[] = [
    { label: "Amount Cleared (Low to High)", value: "amountCleared", order: "asc" },
    { label: "Amount Cleared (High to Low)", value: "amountCleared", order: "desc" },
    { label: "Cleared At (Oldest First)", value: "clearedAt", order: "asc" },
    { label: "Cleared At (Newest First)", value: "clearedAt", order: "desc" },
    { label: "Cash Before (Low to High)", value: "cashAtHandBefore", order: "asc" },
    { label: "Cash Before (High to Low)", value: "cashAtHandBefore", order: "desc" },
  ]

  // Filter handlers
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
  }

  const applyFilters = () => {
    setAppliedFilters({
      agentId: localFilters.agentId,
      areaOfficeId: localFilters.areaOfficeId,
      startDate: localFilters.startDate,
      endDate: localFilters.endDate,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortBy ? localFilters.sortOrder : undefined,
    })
  }

  const resetFilters = () => {
    setLocalFilters({
      agentId: undefined,
      areaOfficeId: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({
      agentId: undefined,
      areaOfficeId: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.agentId) count++
    if (appliedFilters.areaOfficeId) count++
    if (appliedFilters.startDate) count++
    if (appliedFilters.endDate) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-8 sm:px-4 lg:px-6 2xl:px-16">
            <div className="space-y-5">
              {/* Header Section */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Cash Clearances</h2>
                    <p className="mt-1 text-xs text-gray-600">View and manage agent cash clearance records</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mobile Filter Button */}
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 2xl:hidden"
                    >
                      <Filter className="size-3.5" />
                      <span>Filters</span>
                      {getActiveFilterCount() > 0 && (
                        <span className="flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </button>

                    {/* Hide/Show Filters button - Desktop only */}
                    <button
                      type="button"
                      onClick={() => setShowDesktopFilters((prev) => !prev)}
                      className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 2xl:flex"
                    >
                      {showDesktopFilters ? <X className="size-3.5" /> : <Filter className="size-3.5" />}
                      {showDesktopFilters ? "Hide filters" : "Show filters"}
                    </button>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {getActiveFilterCount() > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-600">Active filters:</span>
                    {appliedFilters.agentId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        Agent: {agentOptions.find((a) => a.value === appliedFilters.agentId)?.label}
                        <button
                          onClick={() => handleFilterChange("agentId", undefined)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                    {appliedFilters.areaOfficeId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        Area Office: {areaOfficeOptions.find((a) => a.value === appliedFilters.areaOfficeId)?.label}
                        <button
                          onClick={() => handleFilterChange("areaOfficeId", undefined)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                    {appliedFilters.startDate && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        From: {new Date(appliedFilters.startDate).toLocaleDateString()}
                        <button
                          onClick={() => handleFilterChange("startDate", undefined)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                    {appliedFilters.endDate && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        To: {new Date(appliedFilters.endDate).toLocaleDateString()}
                        <button
                          onClick={() => handleFilterChange("endDate", undefined)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                    {appliedFilters.sortBy && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        Sort:{" "}
                        {
                          sortOptions.find(
                            (s) => s.value === appliedFilters.sortBy && s.order === appliedFilters.sortOrder
                          )?.label
                        }
                        <button
                          onClick={() => {
                            handleFilterChange("sortBy", undefined)
                            handleFilterChange("sortOrder", undefined)
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Main Content with Table */}
              <div className="flex gap-6">
                {/* Table Container */}
                <div className={showDesktopFilters ? "flex-1" : "w-full"}>
                  <AgentClearanceTable appliedFilters={appliedFilters} />
                </div>

                {/* Desktop Filters Sidebar */}
                {showDesktopFilters && (
                  <motion.div
                    key="desktop-filters-sidebar"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    className="hidden w-80 flex-shrink-0 rounded-xl border border-gray-200 bg-white 2xl:block"
                  >
                    {/* Header */}
                    <div className="border-b border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Filters & Sorting</h3>
                        <button
                          onClick={resetFilters}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <X className="size-3" />
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Filter Content */}
                    <div className="p-4">
                      <div className="space-y-4">
                        {/* Agent Filter */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-700">Agent</label>
                          <FormSelectModule
                            name="agentId"
                            value={localFilters.agentId || ""}
                            onChange={(e) =>
                              handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)
                            }
                            options={agentOptions}
                            className="w-full"
                            controlClassName="h-9 text-xs"
                          />
                        </div>

                        {/* Area Office Filter */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-700">Area Office</label>
                          <FormSelectModule
                            name="areaOfficeId"
                            value={localFilters.areaOfficeId || ""}
                            onChange={(e) =>
                              handleFilterChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                            }
                            options={areaOfficeOptions}
                            className="w-full"
                            controlClassName="h-9 text-xs"
                          />
                        </div>

                        {/* Date Range Filters */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-700">Start Date</label>
                          <input
                            type="date"
                            value={localFilters.startDate || ""}
                            onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
                            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-gray-700">End Date</label>
                          <input
                            type="date"
                            value={localFilters.endDate || ""}
                            onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
                            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Sort Options */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setIsSortExpanded((prev) => !prev)}
                            className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700"
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
                                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                                    localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                                      ? "border border-purple-200 bg-purple-50 text-purple-700"
                                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  <span>{option.label}</span>
                                  {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                                    <span className="text-purple-600">
                                      {option.order === "asc" ? (
                                        <SortAsc className="size-3" />
                                      ) : (
                                        <SortDesc className="size-3" />
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

                    {/* Action Buttons */}
                    <div className="border-t border-gray-200 p-4">
                      <div className="space-y-2">
                        <button
                          onClick={applyFilters}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#004B23] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#003618]"
                        >
                          <Filter className="size-3.5" />
                          Apply Filters
                        </button>
                        <button
                          onClick={resetFilters}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <X className="size-3.5" />
                          Reset All
                        </button>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <h4 className="mb-2 text-xs font-medium text-gray-900">Summary</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Filters:</span>
                          <span className="font-medium">{getActiveFilterCount()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
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
        agentOptions={agentOptions}
        areaOfficeOptions={areaOfficeOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </section>
  )
}
