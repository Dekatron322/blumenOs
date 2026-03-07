"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchMeters, Meter } from "lib/redux/metersSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"
import { useRouter } from "next/navigation"
import EditMeterModal from "components/ui/Modal/edit-meter-modal"
import MeterHistoryModal from "components/ui/Modal/meter-history-modal"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import Image from "next/image"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"

interface ActionDropdownProps {
  meter: Meter
  onViewDetails: (meter: Meter) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ meter, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(meter)
    setIsOpen(false)
  }

  const handleEditMeter = () => {
    console.log("Edit meter:", meter.drn)
    setIsOpen(false)
  }

  const handleViewHistory = () => {
    console.log("View history:", meter.drn)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="inline-flex items-center justify-center rounded-md border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <RxDotsVertical className="size-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 z-50 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="py-1">
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
              >
                View Details
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleEditMeter}
              >
                Edit Meter
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewHistory}
              >
                View History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-32 rounded bg-gray-200">
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
                  <div className="h-3 w-20 rounded bg-gray-200">
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
                    <div className="h-4 w-16 rounded bg-gray-200">
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

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

interface MeterInventoryTableProps {
  pageSize?: number
}

const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  serviceStations,
  distributionSubstations,
  meterStatusOptions,
  meterTypeOptions,
  meterStateOptions,
  serviceBandOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  serviceStations: any[]
  distributionSubstations: any[]
  meterStatusOptions: Array<{ value: number; label: string }>
  meterTypeOptions: Array<{ value: number; label: string }>
  meterStateOptions: Array<{ value: number; label: string }>
  serviceBandOptions: Array<{ value: number; label: string }>
}) => {
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  const sortOptions: SortOption[] = [
    { label: "Meter Number A-Z", value: "drn", order: "asc" },
    { label: "Meter Number Z-A", value: "drn", order: "desc" },
    { label: "Customer Name A-Z", value: "customerFullName", order: "asc" },
    { label: "Customer Name Z-A", value: "customerFullName", order: "desc" },
    { label: "Installation Date Newest", value: "installationDate", order: "desc" },
    { label: "Installation Date Oldest", value: "installationDate", order: "asc" },
    { label: "Tariff Rate Low-High", value: "tariffRate", order: "asc" },
    { label: "Tariff Rate High-Low", value: "tariffRate", order: "desc" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex max-h-screen w-full max-w-sm flex-col bg-white shadow-xl"
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
                {/* Meter Status Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Meter Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {meterStatusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() =>
                          handleFilterChange(
                            "status",
                            localFilters.status === status.value.toString() ? "" : status.value.toString()
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === status.value.toString()
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meter Type Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Meter Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {meterTypeOptions.map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          handleFilterChange(
                            "meterType",
                            localFilters.meterType === type.value.toString() ? "" : type.value.toString()
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.meterType === type.value.toString()
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meter State Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Meter State</label>
                  <div className="grid grid-cols-2 gap-2">
                    {meterStateOptions.map((state) => (
                      <button
                        key={state.value}
                        onClick={() =>
                          handleFilterChange(
                            "meterState",
                            localFilters.meterState === state.value.toString() ? "" : state.value.toString()
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.meterState === state.value.toString()
                            ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {state.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Band Filter */}
                <div>
                  <FormSelectModule
                    label="Service Band"
                    name="serviceBand"
                    value={localFilters.serviceBand}
                    onChange={(e) => handleFilterChange("serviceBand", e.target.value)}
                    options={[
                      { value: "", label: "All Service Bands" },
                      ...serviceBandOptions.map((band) => ({
                        value: band.value.toString(),
                        label: band.label,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Injection Substation Filter */}
                <div>
                  <FormSelectModule
                    label="Injection Substation"
                    name="injectionSubstationId"
                    value={localFilters.injectionSubstationId}
                    onChange={(e) => handleFilterChange("injectionSubstationId", e.target.value)}
                    options={[
                      { value: "", label: "All Injection Substations" },
                      ...distributionSubstations.map((substation) => ({
                        value: substation.id.toString(),
                        label: `${substation.dssCode} - ${substation.feeder?.name || "Unknown"}`,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Service Center Filter */}
                <div>
                  <FormSelectModule
                    label="Service Center"
                    name="serviceCenterId"
                    value={localFilters.serviceCenterId}
                    onChange={(e) => handleFilterChange("serviceCenterId", e.target.value)}
                    options={[
                      { value: "", label: "All Service Centers" },
                      ...serviceStations.map((sc) => ({
                        value: sc.id.toString(),
                        label: sc.name,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Meter Activity Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Meter Activity</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "isMeterActive",
                            localFilters.isMeterActive === option.value ? "" : option.value
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.isMeterActive === option.value
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meter PPM Filter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Payment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "true", label: "Prepaid" },
                      { value: "false", label: "Postpaid" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("meterIsPPM", localFilters.meterIsPPM === option.value ? "" : option.value)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.meterIsPPM === option.value
                            ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State Filter */}
                <div>
                  <FormSelectModule
                    label="State"
                    name="state"
                    value={localFilters.state}
                    onChange={(e) => handleFilterChange("state", e.target.value)}
                    options={[
                      { value: "", label: "All States" },
                      { value: "1", label: "Abuja" },
                      { value: "2", label: "Kaduna" },
                      { value: "3", label: "Kano" },
                      { value: "4", label: "Katsina" },
                      { value: "5", label: "Kebbi" },
                      { value: "6", label: "Sokoto" },
                      { value: "7", label: "Zamfara" },
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
                    className="mb-1.5 flex w-full items-center justify-between text-sm font-medium text-gray-700"
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
                  className="button-filled flex-1"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="button-oulined flex-1"
                >
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

const MeterInventoryTable: React.FC<MeterInventoryTableProps> = ({ pageSize: propPageSize = 10 }) => {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(propPageSize)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyMeterId, setHistoryMeterId] = useState<number | null>(null)
  const [historyMeterDRN, setHistoryMeterDRN] = useState<string>("")

  // Filter states
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true)
  const [localFilters, setLocalFilters] = useState({
    status: "",
    meterType: "",
    meterState: "",
    serviceBand: "",
    injectionSubstationId: "",
    serviceCenterId: "",
    isMeterActive: "",
    meterIsPPM: "",
    state: "",
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  const dispatch = useAppDispatch()
  const { meters, error, pagination, loading } = useAppSelector((state) => state.meters)
  const { serviceStations } = useAppSelector((state) => state.serviceStations)
  const { distributionSubstations } = useAppSelector((state) => state.distributionSubstations)
  const { user } = useAppSelector((state) => state.auth)

  // Check if user has Update permission for meter editing
  const canEditMeter = !!user?.privileges?.some(
    (p) =>
      (p.key === "meters" && p.actions?.includes("U")) ||
      (p.key === "metering-meter-changeout-activation-de-activation" && p.actions?.includes("U")) ||
      (p.key === "new-service-new-capture-separation" && p.actions?.includes("U"))
  )

  // Meter status options
  const meterStatusOptions = [
    { value: 1, label: "Active" },
    { value: 2, label: "Deactivated" },
    { value: 3, label: "Suspended" },
    { value: 4, label: "Retired" },
  ]

  // Meter state options
  const meterStateOptions = [
    { value: 1, label: "Good" },
    { value: 2, label: "Tamper" },
    { value: 3, label: "Suspicious" },
    { value: 4, label: "Missing" },
    { value: 5, label: "Unknown" },
    { value: 6, label: "Faulty" },
    { value: 7, label: "Unassigned" },
  ]

  // Meter type options
  const meterTypeOptions = [
    { value: 1, label: "Prepaid" },
    { value: 2, label: "Postpaid" },
  ]

  // Service band options
  const serviceBandOptions = [
    { value: 1, label: "Band A" },
    { value: 2, label: "Band B" },
    { value: 3, label: "Band C" },
    { value: 4, label: "Band D" },
    { value: 5, label: "Band E" },
  ]

  // Fetch meters on component mount and when search/page changes
  useEffect(() => {
    const fetchMetersData = () => {
      const params: any = {
        pageNumber: currentPage,
        pageSize: pageSize,
      }

      // Add search if exists
      if (searchText) {
        params.search = searchText
      }

      // Add filters from localFilters
      if (localFilters.status) {
        params.status = parseInt(localFilters.status)
      }
      if (localFilters.meterType) {
        params.meterType = parseInt(localFilters.meterType)
      }
      if (localFilters.serviceBand) {
        params.serviceBand = parseInt(localFilters.serviceBand)
      }
      if (localFilters.injectionSubstationId) {
        params.injectionSubstationId = parseInt(localFilters.injectionSubstationId)
      }
      if (localFilters.serviceCenterId) {
        // Note: serviceCenterId might need to be mapped to a different parameter
        // Adjust based on your API requirements
        params.serviceCenterId = parseInt(localFilters.serviceCenterId)
      }
      if (localFilters.isMeterActive) {
        params.isMeterActive = localFilters.isMeterActive === "true"
      }
      if (localFilters.meterIsPPM) {
        params.meterIsPPM = localFilters.meterIsPPM === "true"
      }
      if (localFilters.state) {
        params.state = parseInt(localFilters.state)
      }

      dispatch(fetchMeters(params))
    }

    fetchMetersData()
  }, [dispatch, currentPage, pageSize, searchText, localFilters])

  // Fetch service stations and distribution substations for filters
  useEffect(() => {
    if (!serviceStations.length) {
      dispatch(
        fetchServiceStations({
          pageNumber: 1,
          pageSize: 100,
        })
      )
    }

    if (!distributionSubstations.length) {
      dispatch(
        fetchDistributionSubstations({
          pageNumber: 1,
          pageSize: 100,
        })
      )
    }
  }, [dispatch, serviceStations.length, distributionSubstations.length])

  const handleCancelSearch = () => {
    setSearchInput("")
    setSearchText("")
    setCurrentPage(1)
  }

  const handleSearch = () => {
    setSearchText(searchInput.trim())
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Helper function to get meter type display
  const getMeterTypeDisplay = (meterType: number): string => {
    const typeMap: { [key: number]: string } = {
      1: "Prepaid",
      2: "Postpaid",
    }
    return typeMap[meterType] || "Unknown"
  }

  // Helper function to get service band text
  const getServiceBandText = (serviceBand?: number): string => {
    if (serviceBand === undefined || serviceBand === null) {
      return "Unknown"
    }
    const bandMap: { [key: number]: string } = {
      1: "Band A",
      2: "Band B",
      3: "Band C",
      4: "Band D",
      5: "Band E",
    }
    return bandMap[serviceBand] || "Unknown"
  }

  // Helper function to get meter status text
  const getMeterStatusText = (status: number): string => {
    const statusMap: { [key: number]: string } = {
      1: "Active",
      2: "Deactivated",
      3: "Suspended",
      4: "Retired",
    }
    return statusMap[status] || "Unknown"
  }

  // Helper function to get meter state text
  const getMeterStateText = (state: number): string => {
    const stateMap: { [key: number]: string } = {
      1: "Good",
      2: "Tamper",
      3: "Suspicious",
      4: "Missing",
      5: "Unknown",
      6: "Faulty",
      7: "Unassigned",
    }
    return stateMap[state] || "Unknown"
  }

  // Helper function to get meter status color
  const getMeterStatusColor = (status: number): string => {
    const colorMap: { [key: number]: string } = {
      1: "#589E67", // Active - Green
      2: "#AF4B4B", // Deactivated - Red
      3: "#F59E0B", // Suspended - Amber
      4: "#6B7280", // Retired - Gray
    }
    return colorMap[status] || "#6B7280"
  }

  // Helper function to get meter state color
  const getMeterStateColor = (state: number): string => {
    const colorMap: { [key: number]: string } = {
      1: "#589E67", // Good - Green
      2: "#DC2626", // Tamper - Red
      3: "#F59E0B", // Suspicious - Amber
      4: "#6B7280", // Missing - Gray
      5: "#9CA3AF", // Unknown - Light Gray
      6: "#EF4444", // Faulty - Red
      7: "#6B7280", // Unassigned - Gray
    }
    return colorMap[state] || "#6B7280"
  }

  // Helper function to get meter status style
  const getMeterStatusStyle = (status: number) => {
    return {
      backgroundColor: status === 1 ? "#EEF5F0" : status === 2 ? "#F7EDED" : status === 3 ? "#FEF3C7" : "#F3F4F6",
      color: getMeterStatusColor(status),
    }
  }

  const handleEditMeter = (meter: Meter) => {
    setEditingMeter(meter)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingMeter(null)
  }

  const handleEditSuccess = () => {
    // Refresh the meters list to show updated data
    dispatch(
      fetchMeters({
        pageNumber: currentPage,
        pageSize: pageSize,
        search: searchText || undefined,
      })
    )
  }

  const handleViewHistory = (meter: Meter) => {
    setHistoryMeterId(meter.id)
    setHistoryMeterDRN(meter.drn)
    setHistoryModalOpen(true)
  }

  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false)
    setHistoryMeterId(null)
    setHistoryMeterDRN("")
  }

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key as keyof typeof localFilters]: value,
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: option.value,
      sortOrder: option.order,
    }))
    setCurrentPage(1) // Reset to first page when sort changes
  }

  // Apply all filters at once (for the apply button)
  const applyFilters = () => {
    // Filters are already applied via useEffect when localFilters change
    // This function is kept for consistency with the UI
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      status: "",
      meterType: "",
      meterState: "",
      serviceBand: "",
      injectionSubstationId: "",
      serviceCenterId: "",
      isMeterActive: "",
      meterIsPPM: "",
      state: "",
      sortBy: "",
      sortOrder: "asc",
    })
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.status) count++
    if (localFilters.meterType) count++
    if (localFilters.serviceBand) count++
    if (localFilters.injectionSubstationId) count++
    if (localFilters.serviceCenterId) count++
    if (localFilters.isMeterActive) count++
    if (localFilters.meterIsPPM) count++
    if (localFilters.state) count++
    if (localFilters.sortBy) count++
    return count
  }

  const totalRecords = pagination.totalCount
  const totalPages = Math.ceil(totalRecords / pageSize)
  const isLoading = loading

  if (isLoading && meters.length === 0) return <LoadingSkeleton />
  if (error) return <div>Error loading meters</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="relative flex flex-col gap-6 2xl:flex-row">
        {/* Main Content - Meters Table */}
        <div className={showDesktopFilters ? "w-full 2xl:max-w-[calc(100%-356px)] 2xl:flex-1" : "w-full 2xl:flex-1"}>
          <motion.div
            className="rounded-md border bg-white p-3 md:p-5"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b pb-4">
              <div className="mb-3 flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Filter Button for ALL screens up to 2xl */}

                  <p className="whitespace-nowrap text-lg font-medium sm:text-xl md:text-2xl">Meter Directory</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile search icon button */}
                  <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 sm:hidden md:size-9"
                    onClick={() => {
                      /* Handle mobile search toggle if needed */
                    }}
                    aria-label="Toggle search"
                  >
                    <Image src="/DashboardImages/Search.svg" width={16} height={16} alt="Search Icon" />
                  </button>

                  {/* Desktop/Tablet search input */}
                  <div className="hidden sm:block">
                    <SearchModule
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onCancel={handleCancelSearch}
                      onSearch={handleSearch}
                      placeholder="Search by Meter Number and Customer"
                      className="w-full max-w-full sm:max-w-[320px]"
                      bgClassName="bg-white"
                    />
                  </div>

                  {/* Active filters badge - Desktop only (2xl and above) */}
                  {getActiveFilterCount() > 0 && (
                    <div className="hidden items-center gap-2 2xl:flex">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Hide/Show Filters button - Desktop only (2xl and above) */}
                  <button
                    type="button"
                    onClick={() => setShowDesktopFilters((prev) => !prev)}
                    className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
                  >
                    {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                    {showDesktopFilters ? "Hide filters" : "Show filters"}
                  </button>

                  {/* <motion.button
                    className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MdOutlineArrowBackIosNew className="size-4" />
                    Export
                  </motion.button> */}
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
                </div>
              </div>

              {/* Mobile search input revealed when icon is tapped */}
              <div className="mb-3 sm:hidden">
                <SearchModule
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onCancel={handleCancelSearch}
                  onSearch={handleSearch}
                  placeholder="Search by Meter Number and Customer"
                  className="w-full"
                  bgClassName="bg-white"
                />
              </div>
            </div>

            {loading && meters.length === 0 ? (
              <LoadingSkeleton />
            ) : meters.length === 0 ? (
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
                  {searchText ? "No matching meters found" : "No meters available"}
                </motion.p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="overflow-x-auto rounded-lg border border-gray-200 bg-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Meter Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Service Band
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Tariff Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Meter Brand
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <AnimatePresence>
                        {meters.map((meter, index) => (
                          <motion.tr
                            key={meter.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="transition-colors hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <div className="min-w-[120px] max-w-[200px]">
                                <p className="truncate text-sm font-medium text-gray-900">{meter.drn}</p>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="min-w-[150px] max-w-[250px]">
                                <p className="truncate text-sm text-gray-700">{meter.customerFullName || "—"}</p>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                              {getServiceBandText(meter.tariff?.serviceBand)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                  meter.status === 1
                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : meter.status === 2
                                    ? "border border-red-200 bg-red-50 text-red-700"
                                    : meter.status === 3
                                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                                    : "border border-gray-200 bg-gray-100 text-gray-700"
                                }`}
                              >
                                <span
                                  className={`size-2 rounded-full ${
                                    meter.status === 1
                                      ? "bg-emerald-600"
                                      : meter.status === 2
                                      ? "bg-red-600"
                                      : meter.status === 3
                                      ? "bg-amber-600"
                                      : "bg-gray-600"
                                  }`}
                                />
                                {getMeterStatusText(meter.status)}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  meter.meterType === 1
                                    ? "border border-blue-200 bg-blue-50 text-blue-700"
                                    : "border border-purple-200 bg-purple-50 text-purple-700"
                                }`}
                              >
                                {getMeterTypeDisplay(meter.meterType)}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                              {meter.tariffRate ? `${meter.tariffRate} kWh` : "—"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                              {meter.meterBrand || "—"}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex min-w-[200px] justify-end gap-2">
                                <ButtonModule
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/metering/all-meters/${meter.id}`)}
                                  className="border-gray-300 bg-white hover:bg-gray-50"
                                >
                                  <VscEye className="size-3.5" />
                                  View
                                </ButtonModule>

                                <ActionDropdown meter={meter} onViewDetails={() => {}} />
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between border-t py-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="text-sm text-gray-700">
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
                        currentPage === totalPages
                          ? "cursor-not-allowed text-gray-400"
                          : "text-[#003F9F] hover:bg-gray-100"
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
          </motion.div>
        </div>

        {/* Desktop Filters Sidebar (2xl and above) - Toggleable */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full flex-col rounded-md border bg-white 2xl:flex 2xl:w-80 2xl:self-start"
          >
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

            <div className="flex-1 overflow-y-auto p-3 md:p-5">
              <div className="space-y-4">
                {/* Meter Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Meter Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {meterStatusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() =>
                          handleFilterChange(
                            "status",
                            localFilters.status === status.value.toString() ? "" : status.value.toString()
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === status.value.toString()
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meter Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Meter Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {meterTypeOptions.map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          handleFilterChange(
                            "meterType",
                            localFilters.meterType === type.value.toString() ? "" : type.value.toString()
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.meterType === type.value.toString()
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Band Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Service Band</label>
                  <FormSelectModule
                    name="serviceBand"
                    value={localFilters.serviceBand}
                    onChange={(e) => handleFilterChange("serviceBand", e.target.value)}
                    options={[
                      { value: "", label: "All Service Bands" },
                      ...serviceBandOptions.map((band) => ({
                        value: band.value.toString(),
                        label: band.label,
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
                    name="injectionSubstationId"
                    value={localFilters.injectionSubstationId}
                    onChange={(e) => handleFilterChange("injectionSubstationId", e.target.value)}
                    options={[
                      { value: "", label: "All Injection Substations" },
                      ...distributionSubstations.map((substation) => ({
                        value: substation.id.toString(),
                        label: `${substation.dssCode} - ${substation.feeder?.name || "Unknown"}`,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Service Center Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Service Center</label>
                  <FormSelectModule
                    name="serviceCenterId"
                    value={localFilters.serviceCenterId}
                    onChange={(e) => handleFilterChange("serviceCenterId", e.target.value)}
                    options={[
                      { value: "", label: "All Service Centers" },
                      ...serviceStations.map((sc) => ({
                        value: sc.id.toString(),
                        label: sc.name,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Meter Activity Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Meter Activity</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(
                            "isMeterActive",
                            localFilters.isMeterActive === option.value ? "" : option.value
                          )
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.isMeterActive === option.value
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meter PPM Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Payment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "true", label: "Prepaid" },
                      { value: "false", label: "Postpaid" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("meterIsPPM", localFilters.meterIsPPM === option.value ? "" : option.value)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.meterIsPPM === option.value
                            ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">State</label>
                  <FormSelectModule
                    name="state"
                    value={localFilters.state}
                    onChange={(e) => handleFilterChange("state", e.target.value)}
                    options={[
                      { value: "", label: "All States" },
                      { value: "1", label: "Abuja" },
                      { value: "2", label: "Kaduna" },
                      { value: "3", label: "Kano" },
                      { value: "4", label: "Katsina" },
                      { value: "5", label: "Kebbi" },
                      { value: "6", label: "Sokoto" },
                      { value: "7", label: "Zamfara" },
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      /* Toggle sort expansion if needed */
                    }}
                    className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  >
                    <span>Sort By</span>
                    <ChevronDown className="size-4" />
                  </button>

                  <div className="space-y-2">
                    {[
                      { label: "Meter Number A-Z", value: "drn", order: "asc" },
                      { label: "Meter Number Z-A", value: "drn", order: "desc" },
                      { label: "Customer Name A-Z", value: "customerFullName", order: "asc" },
                      { label: "Customer Name Z-A", value: "customerFullName", order: "desc" },
                      { label: "Installation Date Newest", value: "installationDate", order: "desc" },
                      { label: "Installation Date Oldest", value: "installationDate", order: "asc" },
                    ].map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option as SortOption)}
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
            </div>

            {/* Action Buttons */}
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

            {/* Summary Stats */}
            <div className="flex-shrink-0 rounded-lg bg-gray-50 p-3 md:p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{pagination.totalCount.toLocaleString()}</span>
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
        serviceStations={serviceStations}
        distributionSubstations={distributionSubstations}
        meterStatusOptions={meterStatusOptions}
        meterTypeOptions={meterTypeOptions}
        meterStateOptions={meterStateOptions}
        serviceBandOptions={serviceBandOptions}
      />

      <EditMeterModal
        isOpen={editModalOpen}
        onRequestClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        meter={editingMeter}
      />

      <MeterHistoryModal
        isOpen={historyModalOpen}
        onRequestClose={handleCloseHistoryModal}
        meterId={historyMeterId}
        meterDRN={historyMeterDRN}
      />
    </motion.div>
  )
}

export default MeterInventoryTable
