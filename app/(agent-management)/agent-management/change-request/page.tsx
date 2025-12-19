// app/agent-change-requests/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchChangeRequests, setChangeRequestsPagination } from "lib/redux/agentSlice"
import AllAgentChangeRequests from "components/Tables/AllAgentChangeRequests"

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
  sourceOptions,
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
  statusOptions: Array<{ value: string; label: string }>
  sourceOptions: Array<{ value: string; label: string }>
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
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions
                    .filter((opt) => opt.value !== "")
                    .map((option) => {
                      const statusValue = Number(option.value)
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                          }
                          className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                            localFilters.status === statusValue
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                </div>
            </div>

              {/* Source Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                <FormSelectModule
                  name="source"
                  value={localFilters.source || ""}
                  onChange={(e) => handleFilterChange("source", e.target.value || undefined)}
                  options={sourceOptions}
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

export default function AgentChangeRequestManagement() {
  const dispatch = useAppDispatch()
  const { changeRequestsPagination } = useAppSelector((state) => state.agents)

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(false)

  // Filter state
  const [localFilters, setLocalFilters] = useState<{
    status?: number
    source?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({
    sortBy: "",
    sortOrder: "asc",
  })

  const [appliedFilters, setAppliedFilters] = useState<{
    status?: number
    source?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }>({})

  // Filter options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "0", label: "Pending" },
    { value: "1", label: "Approved" },
    { value: "2", label: "Declined" },
    { value: "3", label: "Auto-Approved" },
    { value: "4", label: "Applied" },
    { value: "5", label: "Failed" },
  ]

  const sourceOptions = [
    { value: "", label: "All Sources" },
    { value: "0", label: "System" },
    { value: "1", label: "Manual" },
    { value: "2", label: "Import" },
    { value: "3", label: "API" },
  ]

  const sortOptions: SortOption[] = [
    { label: "Reference (A-Z)", value: "reference", order: "asc" },
    { label: "Reference (Z-A)", value: "reference", order: "desc" },
    { label: "Date (Newest)", value: "requestedAtUtc", order: "desc" },
    { label: "Date (Oldest)", value: "requestedAtUtc", order: "asc" },
    { label: "Status (A-Z)", value: "status", order: "asc" },
    { label: "Status (Z-A)", value: "status", order: "desc" },
  ]

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | number | undefined) => {
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
      source: localFilters.source,
      sortBy: localFilters.sortBy || undefined,
      sortOrder: localFilters.sortOrder || undefined,
    })
    dispatch(setChangeRequestsPagination({ page: 1, pageSize: changeRequestsPagination.pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      sortBy: "",
      sortOrder: "asc",
    })
    setAppliedFilters({})
    dispatch(setChangeRequestsPagination({ page: 1, pageSize: changeRequestsPagination.pageSize }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.status !== undefined) count++
    if (appliedFilters.source !== undefined) count++
    if (appliedFilters.sortBy) count++
    return count
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-8">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-8 2xl:container xl:px-16">
            <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
              {/* Main Content - Change Requests Table */}
              <motion.div
                className={
                  showDesktopFilters
                    ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
                    : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
                }
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 flex w-full flex-col justify-between gap-4 max-md:flex-col md:flex-row md:items-center">
                  <div>
                    <h4 className="text-2xl font-semibold">Agent Change Requests</h4>
                  </div>
                  <div className="flex items-center gap-2">
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

                <AllAgentChangeRequests appliedFilters={appliedFilters} />
              </motion.div>

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
                      <div className="grid grid-cols-2 gap-2">
                        {statusOptions
                          .filter((opt) => opt.value !== "")
                          .map((option) => {
                            const statusValue = Number(option.value)
                            return (
                              <button
                                key={option.value}
                                onClick={() =>
                                  handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                                }
                                className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                                  localFilters.status === statusValue
                                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {option.label}
                              </button>
                            )
                          })}
                      </div>
                    </div>

                    {/* Source Filter */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Source</label>
                      <FormSelectModule
                        name="source"
                        value={localFilters.source || ""}
                        onChange={(e) =>
                          handleFilterChange("source", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={sourceOptions}
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
                        <span className="font-medium">
                          {changeRequestsPagination?.totalCount?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Page:</span>
                        <span className="font-medium">
                          {changeRequestsPagination?.currentPage || 1} / {changeRequestsPagination?.totalPages || 1}
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
        statusOptions={statusOptions}
        sourceOptions={sourceOptions}
        sortOptions={sortOptions}
        isSortExpanded={isSortExpanded}
        setIsSortExpanded={setIsSortExpanded}
      />
    </section>
  )
}
