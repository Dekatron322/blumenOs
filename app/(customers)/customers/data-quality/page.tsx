"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, ChevronDown, Filter, X } from "lucide-react"
import { MdCalendarToday, MdCheck, MdClose, MdCode, MdFilterList, MdPerson, MdWarning } from "react-icons/md"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearDataQualitySummaryState,
  DataQualitySummaryParams,
  fetchDataQualitySummary,
} from "lib/redux/customerSlice"
import { fetchCountries } from "lib/redux/countriesSlice"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"
import AllDataQualityTable from "components/Tables/AllDataQualityTable"

// Filter Modal Component
const FilterModal = ({
  isOpen,
  onRequestClose,
  localFilters,
  handleFilterChange,
  applyFilters,
  resetFilters,
  provinceOptions,
  serviceStationOptions,
  distributionSubstationOptions,
  feederOptions,
}: {
  isOpen: boolean
  onRequestClose: () => void
  localFilters: DataQualitySummaryParams
  handleFilterChange: (key: string, value: string | number | undefined) => void
  applyFilters: () => void
  resetFilters: () => void
  provinceOptions: Array<{ value: string | number; label: string }>
  serviceStationOptions: Array<{ value: string | number; label: string }>
  distributionSubstationOptions: Array<{ value: string | number; label: string }>
  feederOptions: Array<{ value: string | number; label: string }>
}) => {
  const [modalTab, setModalTab] = useState<"filters" | "active">("filters")

  const handleSubmit = () => {
    applyFilters()
    onRequestClose()
  }

  const handleClearAll = () => {
    resetFilters()
    onRequestClose()
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.ProvinceId) count++
    if (localFilters.ServiceCenterId) count++
    if (localFilters.DistributionSubstationId) count++
    if (localFilters.FeederId) count++
    if (localFilters.RuleKey) count++
    if (localFilters.Status) count++
    if (localFilters.Severity) count++
    if (localFilters.FromUtc) count++
    if (localFilters.ToUtc) count++
    return count
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#004B23] to-[#006B33] px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold text-white">FILTERS</span>
                {getActiveFilterCount() > 0 && (
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="size-2 rounded-full bg-white" />
                    {getActiveFilterCount()} Active
                  </motion.span>
                )}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Filter Data Quality Issues</h3>
              <p className="mt-1 text-sm text-white/70">Apply filters to refine data quality issues</p>
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

          {/* Tabs */}
          <div className="mt-4 flex gap-1">
            {[
              { id: "filters", label: "Filters", icon: MdFilterList },
              { id: "active", label: "Active Filters", icon: MdCheck },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setModalTab(tab.id as typeof modalTab)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  modalTab === tab.id ? "bg-white text-[#004B23]" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </motion.button>
            ))}
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
                {/* Location Filters */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdPerson className="text-[#004B23]" />
                    Location Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Province</label>
                      <FormSelectModule
                        name="provinceId"
                        value={localFilters.ProvinceId || ""}
                        onChange={(e) =>
                          handleFilterChange("ProvinceId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={provinceOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Service Center</label>
                      <FormSelectModule
                        name="serviceCenterId"
                        value={localFilters.ServiceCenterId || ""}
                        onChange={(e) =>
                          handleFilterChange("ServiceCenterId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={serviceStationOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Distribution Substation</label>
                      <FormSelectModule
                        name="distributionSubstationId"
                        value={localFilters.DistributionSubstationId || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "DistributionSubstationId",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        options={distributionSubstationOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Feeder</label>
                      <FormSelectModule
                        name="feederId"
                        value={localFilters.FeederId || ""}
                        onChange={(e) =>
                          handleFilterChange("FeederId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={feederOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Issue Filters */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCode className="text-[#004B23]" />
                    Issue Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Rule Key</label>
                      <input
                        type="text"
                        value={localFilters.RuleKey || ""}
                        onChange={(e) => handleFilterChange("RuleKey", e.target.value || undefined)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter rule key"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                      <FormSelectModule
                        name="status"
                        value={localFilters.Status || ""}
                        onChange={(e) => handleFilterChange("Status", e.target.value || undefined)}
                        options={[
                          { value: "", label: "All Statuses" },
                          { value: "Open", label: "Open" },
                          { value: "Resolved", label: "Resolved" },
                          { value: "Ignored", label: "Ignored" },
                        ]}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Severity</label>
                      <FormSelectModule
                        name="severity"
                        value={localFilters.Severity || ""}
                        onChange={(e) => handleFilterChange("Severity", e.target.value || undefined)}
                        options={[
                          { value: "", label: "All Severities" },
                          { value: "Warning", label: "Warning" },
                          { value: "Error", label: "Error" },
                        ]}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCalendarToday className="text-[#004B23]" />
                    Date Range
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">From Date</label>
                      <input
                        type="date"
                        value={localFilters.FromUtc ? new Date(localFilters.FromUtc).toISOString().slice(0, 10) : ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "FromUtc",
                            e.target.value ? new Date(e.target.value).toISOString() : undefined
                          )
                        }
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">To Date</label>
                      <input
                        type="date"
                        value={localFilters.ToUtc ? new Date(localFilters.ToUtc).toISOString().slice(0, 10) : ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "ToUtc",
                            e.target.value ? new Date(e.target.value).toISOString() : undefined
                          )
                        }
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
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
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCheck className="text-[#004B23]" />
                    Active Filters
                  </h4>

                  {getActiveFilterCount() === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-200">
                        <MdFilterList className="size-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No active filters</p>
                      <p className="mt-1 text-sm text-gray-400">Apply filters to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {localFilters.ProvinceId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Province</p>
                            <p className="text-xs text-gray-500">
                              {provinceOptions.find((opt) => opt.value === localFilters.ProvinceId)?.label ||
                                localFilters.ProvinceId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("ProvinceId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.ServiceCenterId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Service Center</p>
                            <p className="text-xs text-gray-500">
                              {serviceStationOptions.find((opt) => opt.value === localFilters.ServiceCenterId)?.label ||
                                localFilters.ServiceCenterId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("ServiceCenterId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.DistributionSubstationId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Distribution Substation</p>
                            <p className="text-xs text-gray-500">
                              {distributionSubstationOptions.find(
                                (opt) => opt.value === localFilters.DistributionSubstationId
                              )?.label || localFilters.DistributionSubstationId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("DistributionSubstationId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.FeederId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Feeder</p>
                            <p className="text-xs text-gray-500">
                              {feederOptions.find((opt) => opt.value === localFilters.FeederId)?.label ||
                                localFilters.FeederId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("FeederId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.RuleKey && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Rule Key</p>
                            <p className="text-xs text-gray-500">{localFilters.RuleKey}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("RuleKey", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.Status && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Status</p>
                            <p className="text-xs text-gray-500">{localFilters.Status}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("Status", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.Severity && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Severity</p>
                            <p className="text-xs text-gray-500">{localFilters.Severity}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("Severity", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.FromUtc && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">From Date</p>
                            <p className="text-xs text-gray-500">{new Date(localFilters.FromUtc).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("FromUtc", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.ToUtc && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">To Date</p>
                            <p className="text-xs text-gray-500">{new Date(localFilters.ToUtc).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("ToUtc", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
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
            <p className="text-xs text-gray-400">{getActiveFilterCount()} active filter(s)</p>
            <div className="flex gap-3">
              <motion.button
                onClick={handleClearAll}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear All
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                className="rounded-lg bg-[#004B23] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003318]"
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

export default function DataQualityPage() {
  const dispatch = useAppDispatch()
  const { dataQualitySummary, dataQualitySummaryLoading, dataQualitySummaryError } = useAppSelector(
    (state) => state.customers
  )
  const { countries } = useAppSelector((state) => state.countries)
  const { serviceStations } = useAppSelector((state) => state.serviceStations)
  const { distributionSubstations } = useAppSelector((state) => state.distributionSubstations)
  const { feeders } = useAppSelector((state) => state.feeders)

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [qualityAccordionOpen, setQualityAccordionOpen] = useState(false)

  // Tab state for breakdown sections
  const [activeTab, setActiveTab] = useState("severity")

  // Tab selection function
  const selectTab = (tab: string) => {
    setActiveTab(tab)
  }

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState<DataQualitySummaryParams>({})

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState<DataQualitySummaryParams>({})

  // Fetch data quality summary data
  useEffect(() => {
    dispatch(fetchDataQualitySummary(appliedFilters))
  }, [dispatch, appliedFilters])

  // Fetch location data for filter options
  useEffect(() => {
    dispatch(fetchCountries())
    dispatch(fetchServiceStations({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchFeeders({ pageNumber: 1, pageSize: 100 }))

    return () => {
      dispatch(clearDataQualitySummaryState())
    }
  }, [dispatch])

  // Create options arrays for location filters
  const provinceOptions = [
    { value: "", label: "All Provinces" },
    ...countries.flatMap((country) =>
      country.provinces.map((province) => ({
        value: province.id,
        label: province.name,
      }))
    ),
  ]

  const serviceStationOptions = [
    { value: "", label: "All Service Centers" },
    ...serviceStations.map((station) => ({
      value: station.id,
      label: station.name,
    })),
  ]

  const distributionSubstationOptions = [
    { value: "", label: "All Distribution Substations" },
    ...distributionSubstations.map((substation) => ({
      value: substation.id,
      label: substation.dssCode,
    })),
  ]

  const feederOptions = [
    { value: "", label: "All Feeders" },
    ...feeders.map((feeder) => ({
      value: feeder.id,
      label: feeder.name,
    })),
  ]

  // Filter handlers
  const applyFilters = () => {
    setAppliedFilters({ ...localFilters })
    setShowFilterModal(false)
  }

  const resetFilters = () => {
    setLocalFilters({})
    setAppliedFilters({})
  }

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.ProvinceId) count++
    if (appliedFilters.ServiceCenterId) count++
    if (appliedFilters.DistributionSubstationId) count++
    if (appliedFilters.FeederId) count++
    if (appliedFilters.RuleKey) count++
    if (appliedFilters.Status) count++
    if (appliedFilters.Severity) count++
    if (appliedFilters.FromUtc) count++
    if (appliedFilters.ToUtc) count++
    return count
  }

  // Calculate summary statistics
  const totalIssues = dataQualitySummary.reduce((sum, item) => sum + item.totalCount, 0)
  const openIssues = dataQualitySummary
    .filter((item) => item.status === "Open")
    .reduce((sum, item) => sum + item.totalCount, 0)
  const errorSeverity = dataQualitySummary
    .filter((item) => item.severity === "Error")
    .reduce((sum, item) => sum + item.totalCount, 0)
  const warningSeverity = dataQualitySummary
    .filter((item) => item.severity === "Warning")
    .reduce((sum, item) => sum + item.totalCount, 0)

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-8">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-3 py-4 2xl:container sm:px-4 lg:px-6 2xl:px-16">
            {/* Hero Header Section */}
            <motion.div
              className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#004B23] to-[#006B33] p-4 shadow-lg md:p-6 lg:p-8"
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
                    <h1 className="text-2xl font-bold text-white md:text-3xl">Data Quality</h1>
                    <p className="mt-1 text-sm text-white/80 md:text-base">
                      Monitor and manage data quality issues across the system
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFilterModal(true)}
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
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  {/* Total Issues Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/5 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                          <MdWarning className="text-sm" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Issues</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {dataQualitySummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : dataQualitySummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          totalIssues.toLocaleString() || "0"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-white/60">detected issues</p>
                    </div>
                  </div>

                  {/* Open Issues Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20">
                          <AlertTriangle className="text-sm text-amber-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Open Issues</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {dataQualitySummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : dataQualitySummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          openIssues.toLocaleString() || "0"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-amber-300/80">pending resolution</p>
                    </div>
                  </div>

                  {/* Errors Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-red-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-red-400/20">
                          <X className="text-sm text-red-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Errors</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {dataQualitySummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : dataQualitySummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          errorSeverity.toLocaleString() || "0"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-red-300/80">critical issues</p>
                    </div>
                  </div>

                  {/* Warnings Card */}
                  <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                    <div className="absolute -right-4 -top-4 size-16 rounded-full bg-yellow-400/10 transition-transform group-hover:scale-110" />
                    <div className="relative">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-yellow-400/20">
                          <AlertTriangle className="text-sm text-yellow-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">Warnings</p>
                      <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                        {dataQualitySummaryLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : dataQualitySummaryError ? (
                          <span className="text-red-300">Error</span>
                        ) : (
                          warningSeverity.toLocaleString() || "0"
                        )}
                      </p>
                      <p className="mt-1 text-xs text-yellow-300/80">minor issues</p>
                    </div>
                  </div>
                </div>

                {/* Data Quality Accordion */}
                <div className="mt-6">
                  <div className="rounded-lg border bg-white/10 backdrop-blur-sm">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 p-4 text-left"
                      onClick={() => setQualityAccordionOpen(!qualityAccordionOpen)}
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-white">Data Quality Summary</h3>
                        {dataQualitySummary && dataQualitySummary.length > 0 && (
                          <p className="mt-1 text-sm text-white/70">
                            {dataQualitySummary.length} quality records found
                          </p>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-white/70 transition-transform ${
                          qualityAccordionOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {qualityAccordionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/20">
                            {dataQualitySummaryLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                              </div>
                            ) : dataQualitySummaryError ? (
                              <div className="py-8 text-center">
                                <p className="text-red-300">{dataQualitySummaryError}</p>
                              </div>
                            ) : !dataQualitySummary || dataQualitySummary.length === 0 ? (
                              <div className="py-8 text-center">
                                <p className="text-white/70">No data quality issues found</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-white/20">
                                      <th className="px-4 py-3 text-left font-medium text-white/80">Rule Key</th>
                                      <th className="px-4 py-3 text-left font-medium text-white/80">Issue</th>
                                      <th className="px-4 py-3 text-left font-medium text-white/80">Severity</th>
                                      <th className="px-4 py-3 text-left font-medium text-white/80">Status</th>
                                      <th className="px-4 py-3 text-right font-medium text-white/80">Count</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dataQualitySummary.map((item, index) => (
                                      <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                                        <td className="px-4 py-3 font-mono text-xs text-white">{item.ruleKey}</td>
                                        <td className="px-4 py-3 text-white">{item.issue}</td>
                                        <td className="px-4 py-3">
                                          <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                              item.severity === "Error"
                                                ? "bg-red-500/20 text-red-300"
                                                : "bg-yellow-500/20 text-yellow-300"
                                            }`}
                                          >
                                            {item.severity}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                              item.status === "Open"
                                                ? "bg-amber-500/20 text-amber-300"
                                                : item.status === "Resolved"
                                                ? "bg-green-500/20 text-green-300"
                                                : "bg-gray-500/20 text-gray-300"
                                            }`}
                                          >
                                            {item.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-white">
                                          {item.totalCount.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>

            <AllDataQualityTable />

            <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
              {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
              {showDesktopFilters && (
                <motion.div
                  key="desktop-filters-sidebar"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  className="hidden w-full flex-col rounded-md border bg-white 2xl:flex 2xl:w-80 2xl:self-start"
                >
                  {/* Header - Fixed */}
                  <div className="flex-shrink-0 border-b bg-white p-3 md:p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
                      >
                        <X className="size-3 md:size-4" />
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Filter Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-3 md:p-5">
                    <div className="space-y-4">
                      {/* Rule Key Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Rule Key</label>
                        <input
                          type="text"
                          value={localFilters.RuleKey || ""}
                          onChange={(e) => handleFilterChange("RuleKey", e.target.value || undefined)}
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                          placeholder="Enter rule key"
                        />
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                        <FormSelectModule
                          name="status"
                          value={localFilters.Status || ""}
                          onChange={(e) => handleFilterChange("Status", e.target.value || undefined)}
                          options={[
                            { value: "", label: "All Statuses" },
                            { value: "Open", label: "Open" },
                            { value: "Resolved", label: "Resolved" },
                            { value: "Ignored", label: "Ignored" },
                          ]}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      {/* Severity Filter */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Severity</label>
                        <FormSelectModule
                          name="severity"
                          value={localFilters.Severity || ""}
                          onChange={(e) => handleFilterChange("Severity", e.target.value || undefined)}
                          options={[
                            { value: "", label: "All Severities" },
                            { value: "Warning", label: "Warning" },
                            { value: "Error", label: "Error" },
                          ]}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      {/* Location Filters */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Province</label>
                        <FormSelectModule
                          name="provinceId"
                          value={localFilters.ProvinceId || ""}
                          onChange={(e) =>
                            handleFilterChange("ProvinceId", e.target.value ? Number(e.target.value) : undefined)
                          }
                          options={provinceOptions}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Service Center
                        </label>
                        <FormSelectModule
                          name="serviceCenterId"
                          value={localFilters.ServiceCenterId || ""}
                          onChange={(e) =>
                            handleFilterChange("ServiceCenterId", e.target.value ? Number(e.target.value) : undefined)
                          }
                          options={serviceStationOptions}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                          Distribution Substation
                        </label>
                        <FormSelectModule
                          name="distributionSubstationId"
                          value={localFilters.DistributionSubstationId || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "DistributionSubstationId",
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                          options={distributionSubstationOptions}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder</label>
                        <FormSelectModule
                          name="feederId"
                          value={localFilters.FeederId || ""}
                          onChange={(e) =>
                            handleFilterChange("FeederId", e.target.value ? Number(e.target.value) : undefined)
                          }
                          options={feederOptions}
                          className="w-full"
                          controlClassName="h-9 text-sm"
                        />
                      </div>

                      {/* Date Range Filters */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">From Date</label>
                        <input
                          type="date"
                          value={localFilters.FromUtc ? new Date(localFilters.FromUtc).toISOString().slice(0, 10) : ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "FromUtc",
                              e.target.value ? new Date(e.target.value).toISOString() : undefined
                            )
                          }
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">To Date</label>
                        <input
                          type="date"
                          value={localFilters.ToUtc ? new Date(localFilters.ToUtc).toISOString().slice(0, 10) : ""}
                          onChange={(e) =>
                            handleFilterChange(
                              "ToUtc",
                              e.target.value ? new Date(e.target.value).toISOString() : undefined
                            )
                          }
                          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Fixed */}
                  <div className="flex-shrink-0 space-y-3 border-t bg-white p-3 md:p-5">
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

                  {/* Summary Stats - Fixed */}
                  <div className="flex-shrink-0 rounded-lg bg-gray-50 p-3 md:p-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
                    <div className="space-y-1 text-xs md:text-sm">
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

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        provinceOptions={provinceOptions}
        serviceStationOptions={serviceStationOptions}
        distributionSubstationOptions={distributionSubstationOptions}
        feederOptions={feederOptions}
      />
    </section>
  )
}
