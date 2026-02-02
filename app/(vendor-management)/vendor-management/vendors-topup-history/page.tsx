"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import VendorTopUpHistory from "components/MeteringInfo/VendorTopUpHistory"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendors, fetchVendorTopUpSummary } from "lib/redux/vendorSlice"
import { DateFilter, getDateRangeUtc } from "utils/dateRange"
import { AlertTriangle, Clock, DollarSign, Filter, TrendingUp, X } from "lucide-react"
import { MdCalendarToday, MdClose, MdFilterList, MdPerson, MdTrendingUp } from "react-icons/md"

// Filter Modal Component
const FilterModal = ({
  isOpen,
  onRequestClose,
  timeFilter,
  statusFilter,
  topUpByFilter,
  vendorIdFilter,
  vendors,
  vendorsLoading,
  vendorsError,
  customStartDate,
  customEndDate,
  handleTimeFilterChange,
  handleStatusFilterChange,
  handleTopUpByFilterChange,
  handleVendorIdFilterChange,
  handleCustomDateChange,
  clearFilters,
  applyFilters,
}: {
  isOpen: boolean
  onRequestClose: () => void
  timeFilter: DateFilter
  statusFilter: "Pending" | "Confirmed" | "Failed" | ""
  topUpByFilter: "Vendor" | "Admin" | ""
  vendorIdFilter: string
  vendors: any[]
  vendorsLoading: boolean
  vendorsError: string | null
  customStartDate: string
  customEndDate: string
  handleTimeFilterChange: (filter: DateFilter) => void
  handleStatusFilterChange: (status: "Pending" | "Confirmed" | "Failed" | "") => void
  handleTopUpByFilterChange: (topUpBy: "Vendor" | "Admin" | "") => void
  handleVendorIdFilterChange: (vendorId: string) => void
  handleCustomDateChange: (field: "start" | "end", value: string) => void
  clearFilters: () => void
  applyFilters: () => void
}) => {
  const [modalTab, setModalTab] = useState<"filters" | "active">("filters")

  const handleSubmit = () => {
    applyFilters()
    onRequestClose()
  }

  const handleClearAll = () => {
    clearFilters()
    onRequestClose()
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (timeFilter !== "month") count++
    if (statusFilter) count++
    if (topUpByFilter) count++
    if (vendorIdFilter) count++
    if (customStartDate && customEndDate) count++
    return count
  }

  const getTimeFilterLabel = (filter: DateFilter) => {
    if (filter === "day") return "Today"
    if (filter === "yesterday") return "Yesterday"
    if (filter === "week") return "This Week"
    if (filter === "lastWeek") return "Last Week"
    if (filter === "month") return "This Month"
    if (filter === "lastMonth") return "Last Month"
    if (filter === "year") return "This Year"
    if (filter === "lastYear") return "Last Year"
    return "All Time"
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onRequestClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2">
                  <MdFilterList className="text-lg text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Filter Vendor Top-ups</h3>
                  <p className="mt-1 text-sm text-white/80">Refine your data with specific criteria</p>
                </div>
              </div>
              {getActiveFilterCount() > 0 && (
                <motion.div
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="size-2 rounded-full bg-white" />
                  {getActiveFilterCount()} filter{getActiveFilterCount() === 1 ? "" : "s"} applied
                </motion.div>
              )}
            </div>
            <motion.button
              onClick={onRequestClose}
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdClose className="text-xl" />
            </motion.button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {modalTab === "filters" && (
              <motion.div
                key="filters"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Quick Actions Bar */}
                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-1">
                      <MdTrendingUp className="size-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-900">Quick API Actions</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const today = new Date()
                        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
                        handleCustomDateChange("start", startOfDay.toISOString().slice(0, 16))
                        handleCustomDateChange("end", endOfDay.toISOString().slice(0, 16))
                        handleStatusFilterChange("")
                        handleTopUpByFilterChange("")
                        handleVendorIdFilterChange("")
                      }}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                    >
                      Today (startDateUtc/endDateUtc)
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date()
                        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
                        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
                        handleCustomDateChange("start", weekStart.toISOString().slice(0, 16))
                        handleCustomDateChange("end", weekEnd.toISOString().slice(0, 16))
                        handleStatusFilterChange("Confirmed")
                        handleTopUpByFilterChange("")
                        handleVendorIdFilterChange("")
                      }}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm hover:bg-green-50"
                    >
                      This Week Confirmed
                    </button>
                    <button
                      onClick={() => {
                        handleCustomDateChange("start", "")
                        handleCustomDateChange("end", "")
                        handleStatusFilterChange("")
                        handleTopUpByFilterChange("")
                        handleVendorIdFilterChange("")
                      }}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Clear All Parameters
                    </button>
                  </div>
                </div>

                {/* Time Period Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-100 p-2">
                        <MdCalendarToday className="text-lg text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Date Range</h4>
                        <p className="text-sm text-gray-500">Filter by startDateUtc and endDateUtc parameters</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Start Date (UTC)</label>
                      <input
                        type="datetime-local"
                        value={customStartDate}
                        onChange={(e) => handleCustomDateChange("start", e.target.value)}
                        className="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">End Date (UTC)</label>
                      <input
                        type="datetime-local"
                        value={customEndDate}
                        onChange={(e) => handleCustomDateChange("end", e.target.value)}
                        className="h-11 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <MdTrendingUp className="text-lg text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Status</h4>
                        <p className="text-sm text-gray-500">
                          Filter by status parameter (Pending | Confirmed | Failed)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusFilterChange("")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === "" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Statuses
                    </button>
                    <button
                      onClick={() => handleStatusFilterChange("Pending")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === "Pending"
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusFilterChange("Confirmed")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === "Confirmed"
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Confirmed
                    </button>
                    <button
                      onClick={() => handleStatusFilterChange("Failed")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === "Failed"
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Failed
                    </button>
                  </div>
                </div>

                {/* Top-up By Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-2">
                        <MdPerson className="text-lg text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Top-up By</h4>
                        <p className="text-sm text-gray-500">Filter by topUpBy parameter (Vendor | Admin)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTopUpByFilterChange("")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        topUpByFilter === ""
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Everyone
                    </button>
                    <button
                      onClick={() => handleTopUpByFilterChange("Vendor")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        topUpByFilter === "Vendor"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Vendor
                    </button>
                    <button
                      onClick={() => handleTopUpByFilterChange("Admin")}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        topUpByFilter === "Admin"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {/* Vendor ID Filter */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <MdPerson className="text-lg text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Vendor</h4>
                        <p className="text-sm text-gray-500">Filter by vendor</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {/* Vendor Tabs */}
                    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                      <button
                        onClick={() => handleVendorIdFilterChange("")}
                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          vendorIdFilter === ""
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        All Vendors
                      </button>
                      {!vendorsLoading &&
                        !vendorsError &&
                        vendors.slice(0, 20).map((vendor) => (
                          <button
                            key={vendor.id}
                            onClick={() => handleVendorIdFilterChange(vendor.id.toString())}
                            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                              vendorIdFilter === vendor.id.toString()
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {vendor.name}
                          </button>
                        ))}
                    </div>

                    {/* Loading/Error States */}
                    {vendorsLoading && (
                      <div className="flex items-center justify-center py-2">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500"></div>
                        <p className="text-xs text-gray-500">Loading vendors...</p>
                      </div>
                    )}
                    {vendorsError && <p className="text-xs text-red-500">Error loading vendors: {vendorsError}</p>}

                    {/* Show more vendors indicator */}
                    {!vendorsLoading && !vendorsError && vendors.length > 20 && (
                      <p className="text-xs italic text-gray-500">
                        Showing first 20 of {vendors.length} vendors. Scroll to see more.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {modalTab === "active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  {getActiveFilterCount() === 0 ? (
                    <div className="py-12">
                      <div className="mx-auto w-20 rounded-2xl bg-gray-100 p-4">
                        <MdFilterList className="mx-auto size-8 text-gray-400" />
                      </div>
                      <h4 className="mt-4 text-lg font-semibold text-gray-900">No Active Filters</h4>
                      <p className="mt-2 text-sm text-gray-500">
                        Apply filters above to refine your vendor top-up data
                      </p>
                      <button
                        onClick={() => setModalTab("filters")}
                        className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Go to Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">Active Filters</h4>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          {getActiveFilterCount()} applied
                        </span>
                      </div>

                      <div className="space-y-3">
                        {customStartDate && customEndDate && (
                          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-green-100 p-2">
                                <MdCalendarToday className="text-lg text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Date Range</p>
                                <p className="text-sm text-gray-500">
                                  startDateUtc: {new Date(customStartDate).toISOString().slice(0, 19)}Z<br />
                                  endDateUtc: {new Date(customEndDate).toISOString().slice(0, 19)}Z
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleCustomDateChange("start", "")
                                handleCustomDateChange("end", "")
                              }}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
                              <X className="size-5" />
                            </button>
                          </div>
                        )}

                        {statusFilter && (
                          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-amber-100 p-2">
                                <MdTrendingUp className="text-lg text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Status Parameter</p>
                                <p className="text-sm text-gray-500">status: &quot;{statusFilter}&quot;</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleStatusFilterChange("")}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
                              <X className="size-5" />
                            </button>
                          </div>
                        )}

                        {topUpByFilter && (
                          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-purple-100 p-2">
                                <MdPerson className="text-lg text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Top-up By Parameter</p>
                                <p className="text-sm text-gray-500">topUpBy: &quot;{topUpByFilter}&quot;</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleTopUpByFilterChange("")}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
                              <X className="size-5" />
                            </button>
                          </div>
                        )}

                        {vendorIdFilter && (
                          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-blue-100 p-2">
                                <MdPerson className="text-lg text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Vendor Parameter</p>
                                <p className="text-sm text-gray-500">
                                  {vendors.find((v) => v.id.toString() === vendorIdFilter)?.name ||
                                    `vendorId: "${vendorIdFilter}"`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleVendorIdFilterChange("")}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
                              <X className="size-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {getActiveFilterCount() === 0 ? (
                <span>No filters applied</span>
              ) : (
                <span>
                  {getActiveFilterCount()} filter{getActiveFilterCount() === 1 ? "" : "s"} active
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={handleClearAll}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear All
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Filters
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
const DropdownPopover = ({
  options,
  selectedValue,
  onSelect,
  children,
}: {
  options: { value: number; label: string }[]
  selectedValue: number
  onSelect: (value: number) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {children}
        <svg
          className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left ${
                  option.value === selectedValue ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
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
          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
            <div className="size-6 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Skeleton for Customer Categories
const CategoriesSkeleton = () => {
  return (
    <div className="w-80 rounded-md border bg-white p-5">
      <div className="border-b pb-4">
        <div className="h-6 w-40 rounded bg-gray-200"></div>
      </div>

      <div className="mt-4 space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 rounded bg-gray-200"></div>
                <div className="h-5 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-6 rounded-lg bg-gray-50 p-3">
        <div className="mb-2 h-5 w-20 rounded bg-gray-200"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-4 w-12 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Skeleton for the table and grid view
const TableSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-5 w-32 rounded bg-gray-200"></div>
                  <div className="mt-1 flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                    <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                  </div>
                </div>
              </div>
              <div className="size-6 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-gray-200"></div>
                  <div className="h-4 w-16 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// Main Loading Component
const LoadingState = ({ showCategories = true }) => {
  return (
    <div className="flex-3 relative mt-5 flex items-start gap-6">
      {showCategories ? (
        <>
          <TableSkeleton />
          <CategoriesSkeleton />
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

// Generate mock meter data
const generateMeterData = () => {
  return {
    smartMeters: 89420,
    conventionalMeters: 29514,
    readSuccessRate: 94.2,
    alerts: 847,
    totalMeters: 89420 + 29514,
  }
}

export default function VendorTopUpHistoryPage() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // Default 8 minutes
  const [timeFilter, setTimeFilter] = useState<DateFilter>("month")
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<"Pending" | "Confirmed" | "Failed" | "">("")
  const [topUpByFilter, setTopUpByFilter] = useState<"Vendor" | "Admin" | "">("")
  const [vendorIdFilter, setVendorIdFilter] = useState<string>("")
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [summaryAccordionOpen, setSummaryAccordionOpen] = useState(true)
  const dispatch = useAppDispatch()

  // Get vendor top-up summary data from Redux
  const { vendorTopUpSummary, vendorTopUpSummaryLoading, vendorTopUpSummaryError } = useAppSelector(
    (state) => state.vendors
  )

  // Get vendors list from Redux
  const { vendors, loading: vendorsLoading, error: vendorsError } = useAppSelector((state) => state.vendors)
  const [meterData, setMeterData] = useState(generateMeterData())

  // Use mock data
  const { smartMeters, conventionalMeters, readSuccessRate, alerts, totalMeters } = meterData

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Update loading state based on Redux loading state
  useEffect(() => {
    setIsLoading(vendorTopUpSummaryLoading)
  }, [vendorTopUpSummaryLoading])

  // Fetch vendors list on component mount
  useEffect(() => {
    dispatch(fetchVendors({ pageNumber: 1, pageSize: 1000 })) // Fetch all vendors
  }, [dispatch])

  // Fetch vendor top-up summary data
  const refreshVendorData = () => {
    let startDateUtc: string | undefined
    let endDateUtc: string | undefined

    // Only use date range if custom dates are provided or time filter is not "month" (default)
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate)
      startDateUtc = start.toISOString()

      const end = new Date(customEndDate)
      endDateUtc = end.toISOString()
    } else if (timeFilter !== "month") {
      const dateRange = getDateRangeUtc(timeFilter)
      startDateUtc = dateRange.startDateUtc
      endDateUtc = dateRange.endDateUtc
    }

    const requestParams: any = {}

    // Only add parameters if they have values
    if (startDateUtc) requestParams.startDateUtc = startDateUtc
    if (endDateUtc) requestParams.endDateUtc = endDateUtc
    if (statusFilter) requestParams.status = statusFilter as "Pending" | "Confirmed" | "Failed"
    if (topUpByFilter) requestParams.topUpBy = topUpByFilter as "Vendor" | "Admin"
    if (vendorIdFilter) requestParams.vendorId = vendorIdFilter

    dispatch(fetchVendorTopUpSummary(requestParams))
  }

  useEffect(() => {
    refreshVendorData()
  }, [
    dispatch,
    timeFilter !== "month" ? timeFilter : null,
    customStartDate,
    customEndDate,
    statusFilter,
    topUpByFilter,
    vendorIdFilter,
  ])

  const getTimeFilterLabel = (filter: DateFilter) => {
    if (filter === "day") return "Today"
    if (filter === "yesterday") return "Yesterday"
    if (filter === "week") return "This Week"
    if (filter === "lastWeek") return "Last Week"
    if (filter === "month") return "This Month"
    if (filter === "lastMonth") return "Last Month"
    if (filter === "year") return "This Year"
    if (filter === "lastYear") return "Last Year"
    return "All Time"
  }

  const handleTimeFilterChange = (filter: DateFilter) => {
    setTimeFilter(filter)
    setIsMobileFilterOpen(false)
  }

  const handleStatusFilterChange = (status: "Pending" | "Confirmed" | "Failed" | "") => {
    setStatusFilter(status)
  }

  const handleTopUpByFilterChange = (topUpBy: "Vendor" | "Admin" | "") => {
    setTopUpByFilter(topUpBy)
  }

  const handleVendorIdFilterChange = (vendorId: string) => {
    setVendorIdFilter(vendorId)
  }

  const clearFilters = () => {
    setTimeFilter("month")
    setCustomStartDate("")
    setCustomEndDate("")
    setStatusFilter("")
    setTopUpByFilter("")
    setVendorIdFilter("")
    setIsDateRangeOpen(false)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (timeFilter !== "month") count++
    if (statusFilter) count++
    if (topUpByFilter) count++
    if (vendorIdFilter) count++
    if (customStartDate && customEndDate) count++
    return count
  }

  // Calculate summary statistics from vendor top-up summary data
  const totalTopUps = vendorTopUpSummary?.reduce((sum, vendor) => sum + vendor.totalCount, 0) || 0
  const confirmedTopUps = vendorTopUpSummary?.reduce((sum, vendor) => sum + vendor.confirmedCount, 0) || 0
  const failedTopUps = vendorTopUpSummary?.reduce((sum, vendor) => sum + vendor.failedCount, 0) || 0
  const pendingTopUps = vendorTopUpSummary?.reduce((sum, vendor) => sum + vendor.pendingCount, 0) || 0
  const totalAmount = vendorTopUpSummary?.reduce((sum, vendor) => sum + vendor.totalAmount, 0) || 0
  const totalSettledAmount = vendorTopUpSummary?.reduce((sum, vendor) => sum + vendor.totalSettledAmount, 0) || 0

  const handleAddCustomerSuccess = () => {
    setIsAddCustomerModalOpen(false)
    refreshVendorData()
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setMeterData(generateMeterData())
      setIsLoading(false)
    }, 1000)
  }

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Polling interval options - 8 minutes as default
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 600000, label: "10m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Short polling effect - only runs if isPolling is true and uses the selected interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isPolling) {
      intervalId = setInterval(() => {
        handleRefreshData()
      }, pollingInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isPolling, pollingInterval])

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-4 2xl:container sm:px-4 lg:px-6 2xl:px-16">
            {/* Hero Header Section */}
            <motion.div
              className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-4 shadow-lg md:p-6 lg:p-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/20" />
                <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/10" />
                <div className="absolute right-1/4 top-1/2 size-20 rounded-full bg-white/10" />
              </div>

              {/* Header Content */}
              <div className="relative z-10">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">Vendor Top-up History</h1>
                    <p className="mt-1 text-sm text-white/80 md:text-base">
                      Complete vendor wallet top-up history and breakdown analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFilterModal(!showFilterModal)}
                      className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                    >
                      <Filter className="size-4" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </button>

                    {/* Auto-refresh controls */}
                    <div className="z-50 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
                      <span className="text-sm font-medium text-white/80">Auto-refresh:</span>
                      <button
                        onClick={togglePolling}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          isPolling
                            ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                            : "bg-gray-500/20  hover:bg-gray-500/30"
                        }`}
                      >
                        {isPolling ? (
                          <>
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            ON
                          </>
                        ) : (
                          <>
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            OFF
                          </>
                        )}
                      </button>

                      {isPolling && (
                        <DropdownPopover
                          options={pollingOptions}
                          selectedValue={pollingInterval}
                          onSelect={handlePollingIntervalChange}
                        >
                          <span className="text-sm font-medium">
                            {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                          </span>
                        </DropdownPopover>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  {/* Total Top-ups Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/5 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                          <DollarSign className="size-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Top-ups</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {vendorTopUpSummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : vendorTopUpSummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          totalTopUps.toLocaleString()
                        )}
                      </p>
                      <p className="mt-1 text-xs text-white/60">₦{totalAmount.toLocaleString()} total amount</p>
                    </div>
                  </div>

                  {/* Confirmed Top-ups Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-emerald-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/20">
                          <TrendingUp className="size-4 text-emerald-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Confirmed</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {vendorTopUpSummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : vendorTopUpSummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          confirmedTopUps.toLocaleString()
                        )}
                      </p>
                      <p className="mt-1 text-xs text-emerald-300/80">₦{totalSettledAmount.toLocaleString()} settled</p>
                    </div>
                  </div>

                  {/* Pending Top-ups Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20">
                          <Clock className="size-4 text-amber-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Pending</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {vendorTopUpSummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : vendorTopUpSummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          pendingTopUps.toLocaleString()
                        )}
                      </p>
                      <p className="mt-1 text-xs text-amber-300/80">
                        {totalTopUps > 0 ? Math.round((pendingTopUps / totalTopUps) * 100) : 0}% of total
                      </p>
                    </div>
                  </div>

                  {/* Failed Top-ups Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-red-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-red-400/20">
                          <AlertTriangle className="size-4 text-red-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Failed</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {vendorTopUpSummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : vendorTopUpSummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          failedTopUps.toLocaleString()
                        )}
                      </p>
                      <p className="mt-1 text-xs text-red-300/80">
                        {totalTopUps > 0 ? Math.round((failedTopUps / totalTopUps) * 100) : 0}% failure rate
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error State */}
            {vendorTopUpSummaryError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-lg bg-red-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <svg className="size-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800">Error loading summary data</h4>
                    <p className="text-xs text-red-700">{vendorTopUpSummaryError}</p>
                  </div>
                  <button
                    onClick={refreshVendorData}
                    className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                  >
                    Retry
                  </button>
                </div>
              </motion.div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full gap-6 max-md:flex-col">
              <div className="w-full">
                {isLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <VendorTopUpHistory />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstallMeterModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
        timeFilter={timeFilter}
        statusFilter={statusFilter}
        topUpByFilter={topUpByFilter}
        vendorIdFilter={vendorIdFilter}
        vendors={vendors}
        vendorsLoading={vendorsLoading}
        vendorsError={vendorsError}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        handleTimeFilterChange={handleTimeFilterChange}
        handleStatusFilterChange={handleStatusFilterChange}
        handleTopUpByFilterChange={handleTopUpByFilterChange}
        handleVendorIdFilterChange={handleVendorIdFilterChange}
        handleCustomDateChange={(field, value) => {
          if (field === "start") {
            setCustomStartDate(value)
          } else {
            setCustomEndDate(value)
          }
        }}
        clearFilters={clearFilters}
        applyFilters={refreshVendorData}
      />
    </section>
  )
}
