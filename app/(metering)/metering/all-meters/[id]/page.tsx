"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ActivityIcon,
  AlertCircle,
  BuildingIcon,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Edit3,
  HistoryIcon,
  HomeIcon,
  Info,
  Key,
  MapPin,
  NetworkIcon,
  PowerOff,
  Receipt,
  RefreshCw,
  Settings,
  Shield,
  User2Icon,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"

import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearCredit,
  clearCurrentMeter,
  clearTamper,
  fetchMeterDetail,
  fetchMeterHistory,
  type MeterDetailData,
  setControl,
  type SetControlRequest,
} from "lib/redux/metersSlice"
import { fetchCountries, selectAllProvinces, selectCountriesLoading } from "lib/redux/countriesSlice"
import { fetchInjectionSubstationById } from "lib/redux/injectionSubstationSlice"
import { fetchDistributionSubstationById } from "lib/redux/distributionSubstationsSlice"
import { fetchFeederById } from "lib/redux/feedersSlice"
import { fetchAreaOfficeById } from "lib/redux/areaOfficeSlice"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import EditMeterModal from "components/ui/Modal/edit-meter-modal"
import MeterHistoryModal from "components/ui/Modal/meter-history-modal"
import ClearTamperModal from "components/ui/Modal/clear-tamper-modal"
import AddKeyChangeModal from "components/ui/Modal/add-key-change-modal"
import ClearCreditModal from "components/ui/Modal/clear-credit-modal"
import SetControlModal from "components/ui/Modal/set-control-modal"
import {
  CalendarOutlineIcon,
  ExportOutlineIcon,
  MapOutlineIcon,
  MeteringOutlineIcon,
  MeterOutlineIcon,
  SettingsIcon,
} from "components/Icons/Icons"
import PrepaidCreditHistoryTab from "components/Tabs/prepaid-credit-history-tab"
import ClearTamperHistoryTab from "components/Tabs/clear-tamper-history-tab"
import ClearCreditHistoryTab from "components/Tabs/clear-credit-history-tab"
import KeyChangeHistoryTab from "components/Tabs/key-change-history-tab"
import SetControlHistoryTab from "components/Tabs/set-control-history-tab"

// Interface for Meter History entry
interface MeterHistoryEntry {
  id: number
  meterId: number
  userAccountId: number
  agentId: number
  vendorId: number
  changeType: string
  changedFields: string
  oldPayload: string
  newPayload: string
  reason: string
  changedAtUtc: string
}

// Status options for filtering
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "0", label: "Pending" },
  { value: "1", label: "Active" },
  { value: "2", label: "Deactivated" },
  { value: "3", label: "Suspended" },
  { value: "4", label: "Retired" },
]

// Change Type options for filtering
const changeTypeOptions = [
  { value: "", label: "All Types" },
  { value: "CREATE", label: "Created" },
  { value: "UPDATE", label: "Updated" },
  { value: "DEACTIVATE", label: "Deactivated" },
  { value: "ACTIVATE", label: "Activated" },
  { value: "SUSPEND", label: "Suspended" },
  { value: "RETIRE", label: "Retired" },
]

// Meter History Card Component
const MeterHistoryCard = ({
  history,
  onViewDetails,
}: {
  history: MeterHistoryEntry
  onViewDetails: (history: MeterHistoryEntry) => void
}) => {
  const getChangeTypeConfig = (type: string) => {
    const configs = {
      CREATE: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "CREATED" },
      UPDATE: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "UPDATED" },
      DEACTIVATE: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "DEACTIVATED" },
      ACTIVATE: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "ACTIVATED" },
      SUSPEND: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "SUSPENDED" },
      RETIRE: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "RETIRED" },
    }
    return configs[type as keyof typeof configs] || configs.UPDATE
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const changeTypeConfig = getChangeTypeConfig(history.changeType)

  return (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 sm:size-12">
            <span className="text-sm font-semibold text-blue-600 sm:text-base">{history.changeType.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{history.changeType}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${changeTypeConfig.bg} ${changeTypeConfig.color}`}
              >
                <span className={`size-2 rounded-full ${changeTypeConfig.bg} ${changeTypeConfig.border}`}></span>
                {changeTypeConfig.label}
              </div>
              <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {formatDate(history.changedAtUtc)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs text-gray-600 sm:text-sm">
        <div className="flex justify-between">
          <span>Changed Fields:</span>
          <span className="font-medium">{history.changedFields || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span>Reason:</span>
          <span className="font-medium">{history.reason || "No reason provided"}</span>
        </div>
        <div className="flex justify-between">
          <span>Changed At:</span>
          <span className="font-medium">{formatDate(history.changedAtUtc)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>User ID:</span>
          <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">{history.userAccountId}</div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-500">Meter ID: {history.meterId}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onViewDetails(history)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white text-sm transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] sm:text-base"
        >
          <VscEye className="size-4" />
          View Details
        </button>
      </div>
    </div>
  )
}

// Meter History List Item Component
const MeterHistoryListItem = ({
  history,
  onViewDetails,
}: {
  history: MeterHistoryEntry
  onViewDetails: (history: MeterHistoryEntry) => void
}) => {
  const getChangeTypeConfig = (type: string) => {
    const configs = {
      CREATE: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "CREATED" },
      UPDATE: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "UPDATED" },
      DEACTIVATE: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "DEACTIVATED" },
      ACTIVATE: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "ACTIVATED" },
      SUSPEND: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "SUSPENDED" },
      RETIRE: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "RETIRED" },
    }
    return configs[type as keyof typeof configs] || configs.UPDATE
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const changeTypeConfig = getChangeTypeConfig(history.changeType)

  return (
    <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 max-sm:hidden">
            <span className="text-sm font-semibold text-blue-600">{history.changeType.charAt(0)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{history.changeType}</h3>
              <div className="flex flex-wrap gap-2">
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${changeTypeConfig.bg} ${changeTypeConfig.color}`}
                >
                  <span className={`size-2 rounded-full ${changeTypeConfig.bg} ${changeTypeConfig.border}`}></span>
                  {changeTypeConfig.label}
                </div>
                <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  {formatDate(history.changedAtUtc)}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-4 sm:text-sm">
              <span>
                <strong>Fields:</strong> {history.changedFields || "N/A"}
              </span>
              <span>
                <strong>Reason:</strong> {history.reason || "No reason provided"}
              </span>
              <span>
                <strong>User ID:</strong> {history.userAccountId}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="hidden text-right text-sm sm:block">
            <div className="font-medium text-gray-900">Type: {changeTypeConfig.label}</div>
            <div className="mt-1 text-xs text-gray-500">{formatDate(history.changedAtUtc)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onViewDetails(history)} className="button-oulined flex items-center gap-2 text-sm">
              <VscEye className="size-4" />
              <span className="max-sm:hidden">View</span>
              <span className="sm:hidden">Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Meter History Section Component
const MeterHistorySection = ({ meterId }: { meterId: number }) => {
  const dispatch = useAppDispatch()
  const { meterHistory, historyLoading, historyError } = useAppSelector((state) => state.meters)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isTypeOpen, setIsTypeOpen] = useState(false)

  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    searchText: "",
    selectedStatus: "",
    selectedType: "",
  })

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    searchText: "",
    selectedStatus: "",
    selectedType: "",
  })

  // Fetch meter history
  useEffect(() => {
    dispatch(fetchMeterHistory(meterId))
  }, [dispatch, meterId])

  const handleViewDetails = (history: MeterHistoryEntry) => {
    console.log("View history details:", history)
    // TODO: Implement history detail modal
  }

  const handleCancelSearch = () => {
    setLocalFilters((prev) => ({ ...prev, searchText: "" }))
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      searchText: localFilters.searchText,
      selectedStatus: localFilters.selectedStatus,
      selectedType: localFilters.selectedType,
    })
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setLocalFilters({
      searchText: "",
      selectedStatus: "",
      selectedType: "",
    })
    setAppliedFilters({
      searchText: "",
      selectedStatus: "",
      selectedType: "",
    })
    setCurrentPage(1)
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Loading skeleton
  if (historyLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <HistoryIcon />
          Meter History
        </h3>
        <div className="animate-pulse">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:gap-4">
            <div className="h-10 w-full rounded bg-gray-200 sm:w-80"></div>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-20 rounded bg-gray-200 sm:w-24"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <HistoryIcon />
          Meter History
        </h3>
        <button
          className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] text-sm hover:border-[#2563EB] hover:bg-[#DBEAFE] sm:text-base"
          onClick={() => {
            /* TODO: Implement CSV export for meter history */
          }}
          disabled={!meterHistory || meterHistory.length === 0}
        >
          <ExportOutlineIcon color="#2563EB" size={18} className="sm:size-5" />
          <p className="text-xs text-[#2563EB] sm:text-sm">Export CSV</p>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <SearchModule
          value={localFilters.searchText}
          onChange={(e) => setLocalFilters((prev) => ({ ...prev, searchText: e.target.value }))}
          onCancel={handleCancelSearch}
          placeholder="Search by change type or reason"
          className="w-full sm:max-w-[300px]"
        />

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              className={`button-oulined text-sm ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <MdGridView className="size-4" />
              <p className="max-sm:hidden">Grid</p>
            </button>
            <button
              className={`button-oulined text-sm ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <MdFormatListBulleted className="size-4" />
              <p className="max-sm:hidden">List</p>
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative" data-dropdown-root="status-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm"
              onClick={() => setIsStatusOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isStatusOpen}
            >
              <IoMdFunnel className="size-4" />
              <span className="max-sm:hidden">
                {statusOptions.find((opt) => opt.value === localFilters.selectedStatus)?.label || "All Status"}
              </span>
              <span className="sm:hidden">Status</span>
              <ChevronDown
                className={`size-4 text-gray-500 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isStatusOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 sm:w-64">
                <div className="py-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                        localFilters.selectedStatus === option.value ? "bg-gray-50" : ""
                      }`}
                      onClick={() => {
                        setLocalFilters((prev) => ({ ...prev, selectedStatus: option.value }))
                        setIsStatusOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Change Type Filter */}
          <div className="relative" data-dropdown-root="type-filter">
            <button
              type="button"
              className="button-oulined flex items-center gap-2 text-sm"
              onClick={() => setIsTypeOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isTypeOpen}
            >
              <IoMdFunnel className="size-4" />
              <span className="max-sm:hidden">
                {changeTypeOptions.find((opt) => opt.value === localFilters.selectedType)?.label || "All Types"}
              </span>
              <span className="sm:hidden">Type</span>
              <ChevronDown className={`size-4 text-gray-500 transition-transform ${isTypeOpen ? "rotate-180" : ""}`} />
            </button>
            {isTypeOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 sm:w-64">
                <div className="py-1">
                  {changeTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                        localFilters.selectedType === option.value ? "bg-gray-50" : ""
                      }`}
                      onClick={() => {
                        setLocalFilters((prev) => ({ ...prev, selectedType: option.value }))
                        setIsTypeOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Apply Filters Button */}
          <button onClick={handleApplyFilters} className="button-filled flex items-center gap-2 text-sm">
            Apply Filters
          </button>
          <button onClick={handleResetFilters} className="button-oulined flex items-center gap-2 text-sm">
            Reset
          </button>
        </div>
      </div>

      {/* Meter History Display */}
      {historyError ? (
        <div className="py-8 text-center">
          <AlertCircle className="mx-auto mb-4 size-10 text-gray-400 sm:size-12" />
          <p className="text-sm text-gray-500 sm:text-base">Error loading meter history: {historyError}</p>
        </div>
      ) : meterHistory.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500 sm:text-base">No history found for this meter</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meterHistory.map((history) => (
            <MeterHistoryCard key={history.id} history={history} onViewDetails={handleViewDetails} />
          ))}
        </div>
      ) : (
        <div className="divide-y">
          {meterHistory.map((history) => (
            <MeterHistoryListItem key={history.id} history={history} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Meter Basic Info Tab Component
const MeterBasicInfoTab = ({
  meter,
  canUpdate,
  openModal,
}: {
  meter: MeterDetailData
  canUpdate: boolean
  openModal: (
    modalType: "edit" | "history" | "change-request" | "clearTamper" | "addKeyChange" | "clearCredit" | "setControl"
  ) => void
}) => {
  const dispatch = useAppDispatch()
  const provinces = useAppSelector(selectAllProvinces)
  const countriesLoading = useAppSelector(selectCountriesLoading)

  // Redux selectors for injection substation
  const injectionSubstationsState = useAppSelector((state) => state.injectionSubstations)
  const currentInjectionSubstation = injectionSubstationsState.currentInjectionSubstation
  const currentInjectionSubstationLoading = injectionSubstationsState.currentInjectionSubstationLoading

  // Redux selectors for distribution substation
  const distributionSubstationsState = useAppSelector((state) => state.distributionSubstations)
  const currentDistributionSubstation = distributionSubstationsState.currentDistributionSubstation
  const currentDistributionSubstationLoading = distributionSubstationsState.currentDistributionSubstationLoading

  // Redux selectors for feeder
  const feedersState = useAppSelector((state) => state.feeders)
  const currentFeeder = feedersState.currentFeeder
  const currentFeederLoading = feedersState.currentFeederLoading

  // Redux selectors for area office
  const areaOfficesState = useAppSelector((state) => state.areaOffices)
  const currentAreaOffice = areaOfficesState.currentAreaOffice
  const currentAreaOfficeLoading = areaOfficesState.currentAreaOfficeLoading

  // Fetch countries data on component mount
  useEffect(() => {
    dispatch(fetchCountries())
  }, [dispatch])

  // Fetch injection substation data when meter has injectionSubstationId
  useEffect(() => {
    if (meter?.injectionSubstationId && meter.injectionSubstationId > 0) {
      dispatch(fetchInjectionSubstationById(meter.injectionSubstationId))
    }
  }, [dispatch, meter?.injectionSubstationId])

  // Fetch distribution substation data when meter has distributionSubstationId
  useEffect(() => {
    if (meter?.distributionSubstationId && meter.distributionSubstationId > 0) {
      dispatch(fetchDistributionSubstationById(meter.distributionSubstationId))
    }
  }, [dispatch, meter?.distributionSubstationId])

  // Fetch feeder data when meter has feederId
  useEffect(() => {
    if (meter?.feederId && meter.feederId > 0) {
      dispatch(fetchFeederById(meter.feederId))
    }
  }, [dispatch, meter?.feederId])

  // Fetch area office data when meter has areaOfficeId
  useEffect(() => {
    if (meter?.areaOfficeId && meter.areaOfficeId > 0) {
      dispatch(fetchAreaOfficeById(meter.areaOfficeId))
    }
  }, [dispatch, meter?.areaOfficeId])

  // Get state name by ID
  const getStateName = (stateId: number) => {
    const province = provinces.find((p) => p.id === stateId)
    return province ? province.name : `State ID: ${stateId}`
  }

  const getStatusConfig = (status: number) => {
    const configs = {
      1: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "ACTIVE",
      },
      0: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: AlertCircle,
        label: "INACTIVE",
      },
      2: {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: AlertCircle,
        label: "SUSPENDED",
      },
      3: {
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        icon: AlertCircle,
        label: "RETIRED",
      },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getMeterTypeConfig = (type: number) => {
    const configs = {
      1: { color: "text-blue-600", bg: "bg-blue-50", label: "PREPAID" },
      2: { color: "text-purple-600", bg: "bg-purple-50", label: "POSTPAID" },
    }
    return configs[type as keyof typeof configs] || { color: "text-gray-600", bg: "bg-gray-50", label: "UNKNOWN" }
  }

  const getServiceBandConfig = (band: number) => {
    const configs = {
      1: { label: "BAND 1" },
      2: { label: "BAND 2" },
      3: { label: "BAND 3" },
      4: { label: "BAND 4" },
      5: { label: "BAND 5" },
    }
    return configs[band as keyof typeof configs] || { label: `BAND ${band}` }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPhoneNumber = (phoneNumber?: string) => {
    if (!phoneNumber) return "N/A"
    // Basic formatting for phone numbers
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  const statusConfig = getStatusConfig(meter.status || 0)
  const meterTypeConfig = getMeterTypeConfig(meter.meterType)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* Left Column - Profile & Quick Actions */}
      <div className="flex w-full flex-col gap-6 xl:flex-row">
        {/* Profile Card */}
        <div className="flex w-full flex-col space-y-6 xl:w-[30%]">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="text-center">
              <div className="relative inline-block">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#f9f9f9] text-2xl font-bold text-[#004B23] sm:size-20 sm:text-3xl">
                  <MeteringOutlineIcon className="size-8 sm:size-10" />
                </div>
                <div
                  className={`absolute -right-1 bottom-1 ${statusConfig.bg} ${statusConfig.border} rounded-full border-2 p-1 sm:p-1.5`}
                >
                  <StatusIcon className={`size-3 ${statusConfig.color} sm:size-4`} />
                </div>
              </div>

              <h2 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{meter.serialNumber}</h2>
              <p className="mb-4 text-sm text-gray-600 sm:text-base">Meter Number: {meter.drn}</p>

              <div className="mb-6 flex flex-wrap justify-center gap-2">
                <div
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color} sm:text-sm`}
                >
                  {statusConfig.label}
                </div>
                <div
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${meterTypeConfig.bg} ${meterTypeConfig.color} sm:text-sm`}
                >
                  {meterTypeConfig.label}
                </div>
                {meter.isSmart && (
                  <div className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 sm:text-sm">
                    Smart Meter
                  </div>
                )}
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <User2Icon size={16} />
                  {meter.customerFullName}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Receipt size={16} />
                  {meter.customerAccountNumber}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapOutlineIcon className="size-4" />
                  {meter.city}, {meter.state}
                </div>
              </div>
            </div>
          </motion.div>
          {/* Quick Actions */}
          {canUpdate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
                <SettingsIcon />
                Quick Actions
              </h3>
              <div className="flex flex-col gap-3 max-xl:grid max-xl:grid-cols-2 max-sm:flex-col max-sm:gap-3  xl:flex-col">
                <ButtonModule
                  variant="outline"
                  size="md"
                  className="w-full justify-start gap-3 text-sm"
                  onClick={() => openModal("history")}
                >
                  <HistoryIcon />
                  View History
                </ButtonModule>
                <ButtonModule
                  variant="outlinePurple"
                  size="md"
                  className="w-full justify-start gap-3 text-sm"
                  onClick={() => openModal("edit")}
                >
                  <Edit3 className="size-4" />
                  Edit Meter
                </ButtonModule>
                {/* <ButtonModule
                  variant={meter.isMeterActive ? "danger" : "primary"}
                  size="md"
                  className="w-full justify-start gap-3 text-sm"
                  onClick={() => {
                    
                    console.log("Toggle meter status")
                  }}
                >
                  {meter.isMeterActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                  {meter.isMeterActive ? "Deactivate" : "Activate"}
                </ButtonModule> */}
                <ButtonModule
                  variant="outlineBlue"
                  size="md"
                  className="w-full justify-start gap-3 text-sm"
                  onClick={() => openModal("clearTamper")}
                >
                  <Shield className="size-4" />
                  Clear Tamper
                </ButtonModule>
                <ButtonModule
                  variant="outlineOrange"
                  size="md"
                  className="w-full justify-start gap-3 text-sm"
                  onClick={() => openModal("addKeyChange")}
                >
                  <Key className="size-4" />
                  Add Key Change
                </ButtonModule>
                <ButtonModule
                  variant="outlineCyan"
                  size="md"
                  className="w-full justify-start gap-3 text-sm"
                  onClick={() => openModal("clearCredit")}
                >
                  <CreditCard className="size-4" />
                  Clear Credit
                </ButtonModule>
                <ButtonModule
                  variant="outlineIndigo"
                  size="md"
                  className="w-full justify-start gap-3 text-sm"
                  onClick={() => openModal("setControl")}
                >
                  <Settings className="size-4" />
                  Set Control
                </ButtonModule>
              </div>
            </motion.div>
          )}

          {/* Technical Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base">
              <ActivityIcon />
              Technical Specs
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 sm:text-sm">SGC:</span>
                <span className="text-sm font-medium sm:text-base">{meter.sgc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 sm:text-sm">KRN:</span>
                <span className="text-sm font-medium sm:text-base">{meter.krn}</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-xs text-gray-600 sm:text-sm">TI:</span>
                <span className="text-sm font-medium sm:text-base">{meter.ti}</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 sm:text-sm">EA:</span>
                <span className="text-sm font-medium sm:text-base">{meter.ea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 sm:text-sm">TCT:</span>
                <span className="text-sm font-medium sm:text-base">{meter.tct}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="flex w-full flex-col space-y-6 xl:w-[70%]">
          {/* Meter Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MeterOutlineIcon />
              Meter Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Meter Number</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.drn}</p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Meter Type</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                  <span className={`inline-flex items-center gap-1 ${meterTypeConfig.color}`}>
                    {meterTypeConfig.label}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Meter Brand</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.meterBrand}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Meter Category</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.meterCategory}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Status</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                  <span className={`inline-flex items-center gap-1 ${statusConfig.color}`}>
                    <StatusIcon className="size-4" />
                    {statusConfig.label}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Is Smart</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.isSmart ? "Yes" : "No"}</p>
              </div>

              <div className="space-y-4">
                {/* <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">Meter State</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.meterState}</p>
                </div> */}
              </div>
            </div>
          </motion.div>

          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <User2Icon />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 sm:size-10">
                    <User2Icon />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer Name</label>
                    <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.customerFullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 sm:size-10">
                    <Receipt className="size-4 text-green-600 sm:size-5" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer Account</label>
                    <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.customerAccountNumber}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 sm:size-10">
                    <BuildingIcon className="size-4 text-red-600 sm:size-5" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 sm:text-sm">Customer Class</label>
                    <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.customerClass}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Installation & Technical Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <CalendarOutlineIcon />
              Installation & Technical Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">Installation Date</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">
                    {formatDate(meter.installationDate)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">MFR Code</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.mfrCode}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">Seal Number</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.sealNumber || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Rate</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.tariffRate}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">Tariff Index</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.tariffIndex}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">Service Band</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">
                    {getServiceBandConfig(meter.serviceBand).label}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Location Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="size-5" />
              Location Information
            </h3>
            <div className="mb-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
              <label className="text-xs font-medium text-gray-600 sm:text-sm">Address</label>
              <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.address}</p>
            </div>
            <div className="mb-3 rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
              <label className="text-xs font-medium text-gray-600 sm:text-sm">Address 2</label>
              <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.addressTwo || "N/A"}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">City</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.city}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">State</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">
                    {countriesLoading ? "Loading..." : getStateName(meter.state)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">Apartment Number</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.apartmentNumber || "N/A"}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                  <label className="text-xs font-medium text-gray-600 sm:text-sm">Coordinates</label>
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">
                    {meter.latitude}, {meter.longitude}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Network & Infrastructure */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <NetworkIcon />
              Network & Infrastructure
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Injection Substation</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                  {currentInjectionSubstationLoading
                    ? "Loading..."
                    : currentInjectionSubstation?.injectionSubstationCode || meter.injectionSubstationId}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Distribution Substation</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                  {currentDistributionSubstationLoading
                    ? "Loading..."
                    : currentDistributionSubstation?.dssCode || meter.distributionSubstationId || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Feeder</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                  {currentFeederLoading ? "Loading..." : currentFeeder?.name || meter.feederId || "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Area Office</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                  {currentAreaOfficeLoading
                    ? "Loading..."
                    : currentAreaOffice?.nameOfNewOAreaffice || meter.areaOfficeId || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Added By</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.meterAddedBy}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Date Created</label>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">{formatDate(meter.meterDateCreated)}</p>
              </div>
            </div>
          </motion.div>

          {/* Tenant Information */}
          {meter.tenantFullName && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <HomeIcon />
                Tenant Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                    <label className="text-xs font-medium text-gray-600 sm:text-sm">Tenant Name</label>
                    <p className="text-sm font-semibold text-gray-900 sm:text-base">{meter.tenantFullName}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-100 bg-[#f9f9f9] p-4">
                    <label className="text-xs font-medium text-gray-600 sm:text-sm">Tenant Phone</label>
                    <p className="text-sm font-semibold text-gray-900 sm:text-base">
                      {formatPhoneNumber(meter.tenantPhoneNumber)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

const MeterDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const meterId = params.id as string

  // Get meter details from Redux store
  const {
    currentMeter: meter,
    meterLoading,
    meterError,
    clearTamperLoading,
    clearTamperError,
    clearTamperData,
    clearCreditLoading,
    clearCreditError,
    clearCreditData,
    setControlLoading,
    setControlError,
    setControlData,
  } = useAppSelector((state) => state.meters)

  // Get current user to check privileges
  const { user } = useAppSelector((state) => state.auth)
  const canUpdate = !!user?.privileges?.some((p) => p.actions?.includes("U"))

  // Redux selectors for injection substation
  const injectionSubstationsState = useAppSelector((state) => state.injectionSubstations)
  const currentInjectionSubstation = injectionSubstationsState.currentInjectionSubstation
  const currentInjectionSubstationLoading = injectionSubstationsState.currentInjectionSubstationLoading

  type TabType =
    | "basic-info"
    | "prepaid-credit-history"
    | "clear-tamper-history"
    | "clear-credit-history"
    | "key-change-history"
    | "set-control-history"
    | "meter-history"
  const [activeTab, setActiveTab] = useState<TabType>("basic-info")
  const [activeModal, setActiveModal] = useState<
    "edit" | "history" | "change-request" | "clearTamper" | "addKeyChange" | "clearCredit" | "setControl" | null
  >(null)
  const [isMobileTabMenuOpen, setIsMobileTabMenuOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (meterId) {
      const id = parseInt(meterId)
      if (!isNaN(id)) {
        dispatch(fetchMeterDetail(id))
      }
    }

    // Cleanup function to clear meter details when component unmounts
    return () => {
      dispatch(clearCurrentMeter())
    }
  }, [dispatch, meterId])

  // Fetch injection substation when meter data is available
  useEffect(() => {
    if (meter?.injectionSubstationId) {
      dispatch(fetchInjectionSubstationById(meter.injectionSubstationId))
    }
  }, [dispatch, meter?.injectionSubstationId])

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case "basic-info":
        return "Basic Info"
      case "prepaid-credit-history":
        return "Prepaid Credit History"
      case "clear-tamper-history":
        return "Clear Tamper History"
      case "clear-credit-history":
        return "Clear Credit History"
      case "key-change-history":
        return "Key Change History"
      case "set-control-history":
        return "Set Control History"
      case "meter-history":
        return "Meter History"
      default:
        return "Basic Info"
    }
  }

  const closeAllModals = () => setActiveModal(null)
  const openModal = (
    modalType: "edit" | "history" | "change-request" | "clearTamper" | "addKeyChange" | "clearCredit" | "setControl"
  ) => setActiveModal(modalType)

  const handleUpdateSuccess = () => {
    // Refresh meter details after successful update
    if (meterId) {
      const id = parseInt(meterId)
      if (!isNaN(id)) {
        dispatch(fetchMeterDetail(id))
      }
    }
    closeAllModals()
  }

  const handleAddKeyChangeSuccess = () => {
    // Refresh meter details after successful key change
    if (meterId) {
      const id = parseInt(meterId)
      if (!isNaN(id)) {
        dispatch(fetchMeterDetail(id))
      }
    }
    closeAllModals()
  }

  const handleClearTamper = async () => {
    if (meter) {
      await dispatch(clearTamper(meter.id)).unwrap()
      closeAllModals()
    }
  }

  const handleClearCredit = async () => {
    if (meter) {
      await dispatch(clearCredit(meter.id)).unwrap()
      closeAllModals()
    }
  }

  const handleSetControl = async (controlData: SetControlRequest) => {
    if (meter) {
      await dispatch(setControl({ id: meter.id, controlData })).unwrap()
      closeAllModals()
    }
  }

  // Render the appropriate content based on active tab
  const renderTabContent = () => {
    if (!meter) return null

    switch (activeTab) {
      case "basic-info":
        return <MeterBasicInfoTab meter={meter} canUpdate={canUpdate} openModal={openModal} />
      case "prepaid-credit-history":
        return <PrepaidCreditHistoryTab meterId={meter.id} />
      case "clear-tamper-history":
        return <ClearTamperHistoryTab meterId={meter.id} />
      case "clear-credit-history":
        return <ClearCreditHistoryTab meterId={meter.id} />
      case "key-change-history":
        return <KeyChangeHistoryTab meterId={meter.id} />
      case "set-control-history":
        return <SetControlHistoryTab meterId={meter.id} />
      case "meter-history":
        return <MeterHistorySection meterId={meter.id} />
      default:
        return <MeterBasicInfoTab meter={meter} canUpdate={canUpdate} openModal={openModal} />
    }
  }

  const exportToPDF = async () => {
    if (!meter) return

    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Add header with company branding
      doc.setFillColor(249, 249, 249)
      doc.rect(0, 0, pageWidth, 60, "F")

      // Company name
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("METER RECORD", pageWidth / 2, 20, { align: "center" })

      // Report title
      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text("Meter Details Report", pageWidth / 2, 30, { align: "center" })

      // Date generated
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" })

      let yPosition = 70

      // Meter Profile Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(10, 10, 10)
      doc.text("METER PROFILE", 14, yPosition)
      yPosition += 10

      // Profile table
      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Meter ID", meter.id.toString()],
          ["Serial Number", meter.serialNumber],
          ["DRN", meter.drn],
          ["Customer Name", meter.customerFullName],
          ["Customer Account", meter.customerAccountNumber],
          ["Customer ID", meter.customerId.toString()],
          ["Status", meter.isMeterActive ? "ACTIVE" : "INACTIVE"],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Technical Specifications Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("TECHNICAL SPECIFICATIONS", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Parameter", "Value", "Unit"]],
        body: [
          ["SGC", meter.sgc.toString(), ""],
          ["KRN", meter.krn, ""],
          ["TI", meter.ti.toString(), ""],
          ["EA", meter.ea.toString(), ""],
          ["TCT", meter.tct.toString(), ""],
          ["KEN", meter.ken.toString(), ""],
          ["MFR Code", meter.mfrCode.toString(), ""],
          ["Meter Type", meter.meterType === 0 ? "Prepaid" : "Postpaid", ""],
          ["Is Smart", meter.isSmart ? "Yes" : "No", ""],
          ["Tariff Rate", meter.tariffRate.toString(), "per kWh"],
          ["Tariff Index", meter.tariffIndex, ""],
          ["Service Band", getServiceBandConfig(meter.serviceBand).label, ""],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Installation & Location Information
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("INSTALLATION & LOCATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Category", "Details"]],
        body: [
          ["Installation Date", formatDate(meter.installationDate)],
          [
            "Injection Substation",
            currentInjectionSubstation?.injectionSubstationCode || meter.injectionSubstationId.toString(),
          ],
          ["Distribution Substation", meter.distributionSubstationId?.toString() || "N/A"],
          ["Feeder", meter.feederId?.toString() || "N/A"],
          ["Area Office", meter.areaOfficeId?.toString() || "N/A"],
          ["State", meter.state.toString()],
          ["Address", meter.address],
          ["Address 2", meter.addressTwo || "N/A"],
          ["City", meter.city],
          ["Apartment", meter.apartmentNumber || "N/A"],
          ["Latitude", meter.latitude.toString()],
          ["Longitude", meter.longitude.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Additional Information
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("ADDITIONAL INFORMATION", 14, yPosition)
      yPosition += 10

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Details"]],
        body: [
          ["Meter Brand", meter.meterBrand],
          ["Meter Category", meter.meterCategory],
          ["Customer Class", meter.customerClass],
          ["Seal Number", meter.sealNumber || "N/A"],
          ["Tenant Name", meter.tenantFullName || "N/A"],
          ["Tenant Phone", formatPhoneNumber(meter.tenantPhoneNumber)],
          ["Added By", meter.meterAddedBy],
          ["Edited By", meter.meterEditedBy || "N/A"],
          ["Date Created", formatDate(meter.meterDateCreated)],
          ["Meter State", meter.meterState.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })

      // Add page numbers
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10)
      }

      // Save the PDF
      doc.save(`meter-record-${meter.drn}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (meterLoading) {
    return <LoadingSkeleton />
  }

  if (meterError || !meter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f9f9] to-gray-100 p-6">
        <div className="flex flex-col justify-center text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-gray-400 sm:size-16" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {meterError ? "Error Loading Meter" : "Meter Not Found"}
          </h1>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            {meterError || "The meter you're looking for doesn't exist."}
          </p>
          <ButtonModule variant="primary" onClick={() => router.back()}>
            Back to Meters
          </ButtonModule>
        </div>
      </div>
    )
  }

  const getStatusConfig = (status: number) => {
    const configs = {
      1: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "ACTIVE",
      },
      0: {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: PowerOff,
        label: "INACTIVE",
      },
      2: {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: AlertCircle,
        label: "SUSPENDED",
      },
      3: {
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        icon: Clock,
        label: "MAINTENANCE",
      },
    }
    return configs[status as keyof typeof configs] || configs[0]
  }

  const getMeterTypeConfig = (type: number) => {
    const configs = {
      1: { color: "text-blue-600", bg: "bg-blue-50", label: "PREPAID" },
      2: { color: "text-purple-600", bg: "bg-purple-50", label: "POSTPAID" },
    }
    return configs[type as keyof typeof configs] || { color: "text-gray-600", bg: "bg-gray-50", label: "UNKNOWN" }
  }

  const getServiceBandConfig = (band: number) => {
    const configs = {
      1: { label: "BAND 1" },
      2: { label: "BAND 2" },
      3: { label: "BAND 3" },
      4: { label: "BAND 4" },
      5: { label: "BAND 5" },
    }
    return configs[band as keyof typeof configs] || { label: `BAND ${band}` }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPhoneNumber = (phoneNumber?: string) => {
    if (!phoneNumber) return "N/A"
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phoneNumber
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col xl:container">
            <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
              <div className="mx-auto w-full px-3 py-4 sm:px-4 md:px-6 2xl:px-16">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      type="button"
                      onClick={() => router.back()}
                      className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-[#f9f9f9] text-gray-700 hover:bg-gray-50 sm:size-9"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      aria-label="Go back"
                      title="Go back"
                    >
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="new-arrow-right rotate-180 transform"
                      >
                        <path
                          d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </motion.button>

                    <div>
                      <h1 className="text-lg font-bold text-gray-900 sm:text-xl xl:text-2xl">Meter Details</h1>
                      <p className="text-xs text-gray-600 sm:text-sm">Complete overview and management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <ButtonModule
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 text-sm"
                      onClick={exportToPDF}
                      disabled={isExporting}
                    >
                      <ExportOutlineIcon className="size-3 sm:size-4" />
                      <span className="max-sm:hidden">{isExporting ? "Exporting..." : "Export"}</span>
                      <span className="sm:hidden">Export</span>
                    </ButtonModule>

                    {canUpdate ? (
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2 text-sm"
                        onClick={() => openModal("edit")}
                      >
                        <Edit3 className="size-3 sm:size-4" />
                        <span className="max-sm:hidden">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </ButtonModule>
                    ) : (
                      <ButtonModule
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-sm"
                        onClick={() => openModal("change-request")}
                      >
                        <RefreshCw className="size-3 sm:size-4" />
                        <span className="max-sm:hidden">Change Request</span>
                        <span className="sm:hidden">Change Request</span>
                      </ButtonModule>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full px-3 py-6 sm:px-4 sm:py-8 md:px-6 2xl:px-16 ">
              <div className="flex w-full flex-col gap-6 xl:flex-row">
                {/* Left Column - Profile & Quick Actions */}

                {/* Right Column - Tabbed Content */}
                <div className="flex w-full flex-col space-y-6 xl:w-[100%]">
                  {/* Tab Navigation */}
                  <div className="sm:mb-4">
                    <div className="w-full rounded-md bg-white p-2 sm:inline-flex sm:w-auto">
                      <div className="relative sm:hidden">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                          onClick={() => setIsMobileTabMenuOpen((prev) => !prev)}
                        >
                          <span>{getTabLabel(activeTab)}</span>
                          <svg
                            className={`size-4 transform transition-transform ${
                              isMobileTabMenuOpen ? "rotate-180" : "rotate-0"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {isMobileTabMenuOpen && (
                          <div className="absolute z-10 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                            <button
                              onClick={() => {
                                setActiveTab("basic-info")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "basic-info"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Info className="size-5" />
                              <span>Basic Info</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("prepaid-credit-history")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "prepaid-credit-history"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <CreditCard className="size-5" />
                              <span>Prepaid Credit History</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("clear-tamper-history")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "clear-tamper-history"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Shield className="size-5" />
                              <span>Clear Tamper History</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("clear-credit-history")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "clear-credit-history"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <RefreshCw className="size-5" />
                              <span>Clear Credit History</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("key-change-history")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "key-change-history"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Key className="size-5" />
                              <span>Key Change History</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("set-control-history")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "set-control-history"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Settings className="size-5" />
                              <span>Set Control History</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("meter-history")
                                setIsMobileTabMenuOpen(false)
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === "meter-history"
                                  ? "bg-[#004B23] text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <HistoryIcon className="size-5" />
                              <span>Meter History</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="hidden sm:block">
                        <nav className="-mb-px flex flex-wrap space-x-2">
                          <button
                            onClick={() => setActiveTab("basic-info")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "basic-info"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <Info className="size-5" />
                            <span>Basic Info</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("prepaid-credit-history")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "prepaid-credit-history"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <CreditCard className="size-5" />
                            <span>Prepaid Credit History</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("clear-tamper-history")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "clear-tamper-history"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <Shield className="size-5" />
                            <span>Clear Tamper History</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("clear-credit-history")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "clear-credit-history"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <RefreshCw className="size-5" />
                            <span>Clear Credit History</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("key-change-history")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "key-change-history"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <Key className="size-5" />
                            <span>Key Change History</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("set-control-history")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "set-control-history"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <Settings className="size-5" />
                            <span>Set Control History</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("meter-history")}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-md p-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                              activeTab === "meter-history"
                                ? "bg-[#004B23] text-white"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-[#F6F6F9] hover:text-gray-700"
                            }`}
                          >
                            <HistoryIcon className="size-5" />
                            <span>Meter History</span>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>

                  {/* Tab Content */}
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditMeterModal
        isOpen={activeModal === "edit"}
        onRequestClose={closeAllModals}
        onSuccess={handleUpdateSuccess}
        meter={meter}
      />

      <MeterHistoryModal
        isOpen={activeModal === "history"}
        onRequestClose={closeAllModals}
        meterId={meter.id}
        meterDRN={meter.drn}
      />

      <ClearTamperModal
        isOpen={activeModal === "clearTamper"}
        onRequestClose={closeAllModals}
        onConfirm={handleClearTamper}
        loading={clearTamperLoading}
        meterId={meter.id}
        errorMessage={clearTamperError || undefined}
        successMessage={clearTamperData ? "Tamper cleared successfully!" : undefined}
      />

      <AddKeyChangeModal
        isOpen={activeModal === "addKeyChange"}
        onRequestClose={closeAllModals}
        meterId={meter.id}
        onSuccess={handleAddKeyChangeSuccess}
      />

      <ClearCreditModal
        isOpen={activeModal === "clearCredit"}
        onRequestClose={closeAllModals}
        onConfirm={handleClearCredit}
        loading={clearCreditLoading}
        meterId={meter.id}
        errorMessage={clearCreditError || undefined}
        successMessage={clearCreditData ? "Credit cleared successfully!" : undefined}
      />

      <SetControlModal
        isOpen={activeModal === "setControl"}
        onRequestClose={closeAllModals}
        onConfirm={handleSetControl}
        loading={setControlLoading}
        meterId={meter.id}
        errorMessage={setControlError || undefined}
        successMessage={setControlData ? "Control set successfully!" : undefined}
      />
    </section>
  )
}

// LoadingSkeleton component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-gray-100">
    <DashboardNav />
    <div className="container mx-auto p-4 sm:p-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="size-8 rounded-md bg-gray-200 sm:size-9"></div>
          <div>
            <div className="mb-2 h-6 w-32 rounded bg-gray-200 sm:h-8 sm:w-40"></div>
            <div className="h-4 w-40 rounded bg-gray-200 sm:w-48"></div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
          <div className="h-9 w-20 rounded bg-gray-200 sm:w-24"></div>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left Column Skeleton */}
        <div className="w-full space-y-6 xl:w-[30%]">
          {/* Profile Card Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="mx-auto size-16 rounded-full bg-gray-200 sm:size-20"></div>
                <div className="absolute -right-1 bottom-1 size-5 rounded-full bg-gray-200 sm:size-6"></div>
              </div>
              <div className="mx-auto mb-2 h-6 w-32 rounded bg-gray-200 sm:h-7"></div>
              <div className="mx-auto mb-4 h-4 w-24 rounded bg-gray-200"></div>
              <div className="mb-6 flex justify-center gap-2">
                <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20"></div>
                <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-3">
              <div className="h-9 w-full rounded bg-gray-200 sm:h-10"></div>
              <div className="h-9 w-full rounded bg-gray-200 sm:h-10"></div>
              <div className="h-9 w-full rounded bg-gray-200 sm:h-10"></div>
            </div>
          </div>

          {/* Technical Specs Skeleton */}
          <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 sm:h-6"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-gray-200"></div>
                  <div className="h-4 w-8 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
              <div className="mb-6 h-6 w-40 rounded bg-gray-200 sm:w-48"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default MeterDetailsPage
