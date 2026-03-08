"use client"

import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel, IoMdSearch } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Filter,
  Grid,
  LayoutList,
  Loader2,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  User,
  X,
} from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import { useRouter } from "next/navigation"
import { Customer, fetchCustomers, setFilters, setPagination } from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import EmptySearchState from "components/ui/EmptySearchState"
import Image from "next/image"
import { displayValue } from "utils/helpers"

type SortOrder = "asc" | "desc" | null

interface CustomerCategory {
  name: string
  code: string
  customerCount: number
  rate: string
  type: "residential" | "commercial"
}

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  companyNercCode?: string
  oldAreaOffice?: string
  newAreaOffice?: string
  newAreaOfficeNercCode?: string
  oldKaedcoAoCode?: string
  newKaedcoAoCode?: string
  injectionSubstation?: string
  injectionSubstationCode?: string
  feederName?: string
  feederNercCode?: string
  feederKaedcoCode?: string
  feederVoltageKv?: 11 | 33
  htPoleNo?: string
  dssName?: string
  oldDssName?: string
  dssNercCode?: string
  dssCode?: string
  transformerCapacityKva?: number
  latitude?: number
  longitude?: number
  units?: number
  unitCodes?: string[]
  isDedicated?: boolean
  status?: "ACTIVE" | "INACTIVE" | "NEW PROJECT" | "NON-EXISTENT" | string
  remarks?: string
}

// Sample data for generating random customers
const sampleCustomerData = {
  customerName: "BASIRU ATIKU ILLELA",
  customerAccountNo: undefined,
  customerAddress1: "OPP MURTALA ZAKI ILLELA AREA",
  customerCity: "Tambuwal",
  customerState: "SOKOTO",
  telephoneNumber: undefined,
  tariff: "R2SP",
  feederName: "TAMBUWAL",
  transformers: "NAMAKKA S/S",
  dtNumber: "TAM011",
  technicalEngineer: "MUSTAPHA SHAAIBU",
  employeeNo: ";02694",
  areaOffice: "SOKOTO",
  serviceCenter: "TAMBUWAL",
  storedAverage: 140,
}

const regions = ["North", "South", "East", "West", "Central"]
const serviceBands = ["Band A", "Band B", "Band C", "Band D"]
const tariffClasses = ["R1", "R2", "R3", "C1", "C2", "C3"]
const businessUnits = ["Unit A", "Unit B", "Unit C", "Unit D"]
const statuses: ("ACTIVE" | "INACTIVE" | "SUSPENDED")[] = ["ACTIVE", "INACTIVE", "SUSPENDED"]
const customerTypes: ("PREPAID" | "POSTPAID")[] = ["PREPAID", "POSTPAID"]

// Generate random assets
const generateRandomAssets = (count: number): Asset[] => {
  return Array.from({ length: count }, (_, index) => ({
    serialNo: index + 1,
    supplyStructureType: ["OVERHEAD", "UNDERGROUND"][Math.floor(Math.random() * 2)],
    company: "KAEDCO",
    companyNercCode: "NERC001",
    oldAreaOffice: `Old Office ${index + 1}`,
    newAreaOffice: `New Office ${index + 1}`,
    newAreaOfficeNercCode: `NERC-AO-${index + 1}`,
    oldKaedcoAoCode: `OLD-KAEDCO-${index + 1}`,
    newKaedcoAoCode: `NEW-KAEDCO-${index + 1}`,
    injectionSubstation: `Substation ${index + 1}`,
    injectionSubstationCode: `SUB-${index + 1}`,
    feederName: `Feeder ${index + 1}`,
    feederNercCode: `NERC-FEEDER-${index + 1}`,
    feederKaedcoCode: `KAEDCO-FEEDER-${index + 1}`,
    feederVoltageKv: ([11, 33] as const)[Math.floor(Math.random() * 2)],
    htPoleNo: `POLE-${index + 1}`,
    dssName: `DSS-${index + 1}`,
    oldDssName: `OLD-DSS-${index + 1}`,
    dssNercCode: `NERC-DSS-${index + 1}`,
    dssCode: `DSS-CODE-${index + 1}`,
    transformerCapacityKva: [100, 200, 300, 500][Math.floor(Math.random() * 4)],
    latitude: 11.5 + Math.random(),
    longitude: 4.5 + Math.random(),
    units: Math.floor(Math.random() * 4) + 1,
    unitCodes: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => `UNIT-${i + 1}`),
    isDedicated: Math.random() > 0.5,
    status: ["ACTIVE", "INACTIVE", "NEW PROJECT", "NON-EXISTENT"][Math.floor(Math.random() * 4)],
    remarks: Math.random() > 0.7 ? "Some remarks here" : undefined,
  }))
}

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

// Mobile & All Screens Filter Sidebar Component
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
}) => {
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  const sortOptions: SortOption[] = [
    { label: "Name A-Z", value: "fullName", order: "asc" },
    { label: "Name Z-A", value: "fullName", order: "desc" },
    { label: "Account No Asc", value: "accountNumber", order: "asc" },
    { label: "Account No Desc", value: "accountNumber", order: "desc" },
    { label: "Arrears Asc", value: "customerOutstandingDebtBalance", order: "asc" },
    { label: "Arrears Desc", value: "customerOutstandingDebtBalance", order: "desc" },
    { label: "Newest", value: "createdAt", order: "desc" },
    { label: "Oldest", value: "createdAt", order: "asc" },
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
            {/* Header */}
            <div className="shrink-0 border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Filters & Sorting</h2>
                    {getActiveFilterCount() > 0 && (
                      <p className="text-xs text-gray-500">{getActiveFilterCount()} active filter(s)</p>
                    )}
                  </div>
                </div>
                <button onClick={resetFilters} className="text-sm font-medium text-[#004B23] hover:text-[#00361a]">
                  Clear All
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* DSS Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Distribution Substation</label>
                  <FormSelectModule
                    name="dss"
                    value={localFilters.dss}
                    onChange={(e) => handleFilterChange("dss", e.target.value)}
                    options={[
                      { value: "", label: "All DSS" },
                      ...distributionSubstations.map((dss) => ({
                        value: dss.id.toString(),
                        label: `${dss.dssCode} - ${dss.feeder.name}`,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Service Center Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Service Center</label>
                  <FormSelectModule
                    name="serviceCenter"
                    value={localFilters.serviceCenter}
                    onChange={(e) => handleFilterChange("serviceCenter", e.target.value)}
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

                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["ACTIVE", "INACTIVE", "SUSPENDED"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange("status", localFilters.status === status ? "" : status)}
                        className={`rounded-md px-3 py-2 text-xs transition-colors ${
                          localFilters.status === status
                            ? "border border-emerald-200 bg-emerald-50 font-medium text-emerald-700"
                            : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Type Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Customer Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["PREPAID", "POSTPAID"].map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          handleFilterChange("customerType", localFilters.customerType === type ? "" : type)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors ${
                          localFilters.customerType === type
                            ? "border border-green-200 bg-green-50 font-medium text-green-700"
                            : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tariff Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Tariff Band</label>
                  <FormSelectModule
                    name="tariff"
                    value={localFilters.tariff}
                    onChange={(e) => handleFilterChange("tariff", e.target.value)}
                    options={[
                      { value: "", label: "All Tariffs" },
                      ...serviceBands.map((band) => ({ value: band, label: band })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Region Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Region</label>
                  <FormSelectModule
                    name="region"
                    value={localFilters.region}
                    onChange={(e) => handleFilterChange("region", e.target.value)}
                    options={[
                      { value: "", label: "All Regions" },
                      ...regions.map((region) => ({ value: region, label: region })),
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
                    className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700"
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
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                            localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                              ? "border border-emerald-200 bg-emerald-50 font-medium text-emerald-700"
                              : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{option.label}</span>
                          {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                            <span>
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

            {/* Footer Actions */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-md bg-[#004B23] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00361a] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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

const AllCustomers = () => {
  const [searchInput, setSearchInput] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [isSortExpanded, setIsSortExpanded] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    dss: "",
    serviceCenter: "",
    areaOffice: "",
    status: "",
    customerType: "",
    tariff: "",
    region: "",
    sortBy: "",
    sortOrder: "asc" as "asc" | "desc",
  })

  // Modal states
  const [activeModal, setActiveModal] = useState<"details" | "suspend" | "reminder" | "status" | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerAssets, setCustomerAssets] = useState<Asset[]>([])
  const router = useRouter()

  // Redux hooks
  const dispatch = useAppDispatch()
  const { customers, loading, error, pagination, filters } = useAppSelector((state) => state.customers)
  const { serviceStations } = useAppSelector((state) => state.serviceStations)
  const { distributionSubstations } = useAppSelector((state) => state.distributionSubstations)

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Name A-Z", value: "fullName", order: "asc" },
    { label: "Name Z-A", value: "fullName", order: "desc" },
    { label: "Account No Asc", value: "accountNumber", order: "asc" },
    { label: "Account No Desc", value: "accountNumber", order: "desc" },
    { label: "Arrears Asc", value: "customerOutstandingDebtBalance", order: "asc" },
    { label: "Arrears Desc", value: "customerOutstandingDebtBalance", order: "desc" },
    { label: "Newest", value: "createdAt", order: "desc" },
    { label: "Oldest", value: "createdAt", order: "asc" },
  ]

  // Fetch customers
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        fetchCustomers({
          pageNumber: pagination.currentPage,
          pageSize: pagination.pageSize,
          search: filters.search,
          status: filters.status || undefined,
          isSuspended: filters.isSuspended !== null ? filters.isSuspended : undefined,
          distributionSubstationId:
            filters.distributionSubstationId !== null ? filters.distributionSubstationId : undefined,
          serviceCenterId: filters.serviceCenterId !== null ? filters.serviceCenterId : undefined,
          areaOfficeId: filters.areaOfficeId !== null ? filters.areaOfficeId : undefined,
          isPPM: filters.isPPM !== null ? filters.isPPM : undefined,
        })
      )
    }

    fetchData()
  }, [dispatch, pagination.currentPage, pagination.pageSize, filters])

  // Sync local search input
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  // Fetch service centers and distribution substations
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

  // Generate assets when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerAssets(generateRandomAssets(3))
    }
  }, [selectedCustomer])

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (!target.closest('[data-dropdown-root="customer-actions"]')) {
        setActiveDropdown(null)
      }

      if (!target.closest('[data-dropdown-root="status-filter"]')) {
        setIsStatusFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Modal management
  const closeAllModals = () => {
    setActiveModal(null)
    setSelectedCustomer(null)
    setActiveDropdown(null)
  }

  const openModal = (modalType: "details" | "suspend" | "reminder" | "status", customer?: Customer) => {
    closeAllModals()
    setActiveModal(modalType)
    if (customer) {
      setSelectedCustomer(customer)
    }
    setActiveDropdown(null)
  }

  // Modal handlers
  const handleViewDetails = (customer: Customer) => {
    router.push(`/customers/${customer.id}`)
  }

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate && trimmed !== filters.search) {
      dispatch(
        setFilters({
          search: trimmed,
          status: localFilters.status,
          serviceCenterId: localFilters.serviceCenter ? Number(localFilters.serviceCenter) : undefined,
          distributionSubstationId: localFilters.dss ? Number(localFilters.dss) : undefined,
          areaOfficeId: localFilters.areaOffice ? Number(localFilters.areaOffice) : undefined,
        })
      )
      dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
    }
  }

  const handleCancelSearch = () => {
    setSearchInput("")
    dispatch(setFilters({ search: "" }))
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Apply all filters
  const applyFilters = () => {
    let isPPM: boolean | undefined = undefined
    if (localFilters.customerType === "PREPAID") {
      isPPM = true
    } else if (localFilters.customerType === "POSTPAID") {
      isPPM = false
    }

    dispatch(
      setFilters({
        search: searchInput,
        status: localFilters.status || "",
        serviceCenterId: localFilters.serviceCenter ? Number(localFilters.serviceCenter) : undefined,
        distributionSubstationId: localFilters.dss ? Number(localFilters.dss) : undefined,
        areaOfficeId: localFilters.areaOffice ? Number(localFilters.areaOffice) : undefined,
        isPPM: isPPM,
      })
    )
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      dss: "",
      serviceCenter: "",
      areaOffice: "",
      status: "",
      customerType: "",
      tariff: "",
      region: "",
      sortBy: "",
      sortOrder: "asc",
    })
    setSearchInput("")
    dispatch(
      setFilters({
        search: "",
        status: undefined,
        serviceCenterId: undefined,
        distributionSubstationId: undefined,
        areaOfficeId: undefined,
        isPPM: undefined,
      })
    )
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Handle individual filter changes
  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key as keyof typeof localFilters]: value,
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

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.dss) count++
    if (localFilters.serviceCenter) count++
    if (localFilters.status) count++
    if (localFilters.customerType) count++
    if (localFilters.tariff) count++
    if (localFilters.region) count++
    if (localFilters.sortBy) count++
    return count
  }

  // Pagination handlers
  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(setPagination({ page: 1, pageSize: newPageSize }))
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      dispatch(setPagination({ page, pageSize: pagination.pageSize }))
    }
  }

  const getPageItems = (): (number | string)[] => {
    const total = pagination.totalPages
    const current = pagination.currentPage
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
    const total = pagination.totalPages
    const current = pagination.currentPage
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "border border-emerald-200 bg-emerald-100 text-emerald-700"
      case "Inactive":
        return "border border-amber-200 bg-amber-100 text-amber-700"
      case "Suspended":
        return "border border-red-200 bg-red-100 text-red-700"
      default:
        return "border border-gray-200 bg-gray-100 text-gray-700"
    }
  }

  const getCustomerTypeStyle = (type: string) => {
    switch (type) {
      case "PREPAID":
        return "border border-blue-200 bg-blue-100 text-blue-700"
      case "POSTPAID":
        return "border border-purple-200 bg-purple-100 text-purple-700"
      default:
        return "border border-gray-200 bg-gray-100 text-gray-700"
    }
  }

  const getArrearsStyle = (arrears: string) => {
    const amount = parseFloat(arrears)
    if (amount === 0) {
      return "border border-emerald-200 bg-emerald-100 text-emerald-700"
    } else if (amount <= 5000) {
      return "border border-amber-200 bg-amber-100 text-amber-700"
    } else {
      return "border border-red-200 bg-red-100 text-red-700"
    }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#004B23]" />
          <p className="text-sm text-gray-500">Loading customers...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="size-6 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load customers</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
          <ButtonModule variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </ButtonModule>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content */}
        <div
          className={
            showDesktopFilters
              ? "w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-5 2xl:flex-1"
          }
        >
          {/* Header Section */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 md:text-xl">All Customers</h1>
              <p className="text-sm text-gray-500">
                {pagination.totalCount.toLocaleString()} total customer(s)
                {getActiveFilterCount() > 0 && ` • ${getActiveFilterCount()} active filter(s)`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Toggle Button - Mobile */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 2xl:hidden"
              >
                <Filter className="size-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="rounded-full bg-[#004B23] px-1.5 py-0.5 text-xs text-white">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {/* Filter Toggle Button - Desktop */}
              <button
                type="button"
                onClick={() => setShowDesktopFilters((prev) => !prev)}
                className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-[#004B23] transition-colors hover:bg-emerald-50 2xl:flex"
              >
                {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                {showDesktopFilters ? "Hide filters" : "Show filters"}
              </button>
            </div>
          </div>

          {/* Search Priority Section */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-r from-green-50/60 to-white p-4 shadow-sm">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">Primary action</p>
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Search Customers</h2>
              <p className="text-xs text-gray-600 sm:text-sm">
                Find records quickly by customer name, account number, phone number, or email.
              </p>
            </div>

            <SearchModule
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onCancel={handleCancelSearch}
              onSearch={handleManualSearch}
              placeholder="Type customer name, account number, phone number, or email..."
              height="h-14"
              className="!w-full md:!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
            />
          </div>

          {/* View Toggle */}
          <div className="mb-4 flex items-center gap-2">
            <button
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="size-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="size-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          {/* Customer Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {customers.length === 0 ? (
                <div className="col-span-full rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <EmptySearchState
                      title={filters.search ? "No customers found" : "No customers available"}
                      description={
                        filters.search
                          ? "Try adjusting your search criteria"
                          : "Start by searching with customer name, account number, phone number, or email."
                      }
                      className="py-6"
                    />
                    {filters.search && (
                      <ButtonModule variant="outline" size="sm" onClick={resetFilters}>
                        Clear filters
                      </ButtonModule>
                    )}
                  </div>
                </div>
              ) : (
                customers.map((customer: Customer) => (
                  <div
                    key={customer.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm"
                  >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
                        <span className="text-sm font-semibold text-emerald-700">
                          {(customer.fullName || "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{displayValue(customer.fullName)}</h3>
                        <p className="text-xs text-gray-500">{displayValue(customer.accountNumber)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                        customer.status
                      )}`}
                    >
                      {customer.status}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getCustomerTypeStyle(
                        customer.isPPM ? "PREPAID" : "POSTPAID"
                      )}`}
                    >
                      {customer.isPPM ? "PREPAID" : "POSTPAID"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium text-gray-900">{displayValue(customer.provinceName)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Center:</span>
                      <span className="font-medium text-gray-900">{displayValue(customer.serviceCenterName)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tariff:</span>
                      <span className="font-medium text-gray-900">{displayValue(customer.tariffRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Arrears:</span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getArrearsStyle(
                          (customer.customerOutstandingDebtBalance || 0).toString()
                        )}`}
                      >
                        ₦{(customer.customerOutstandingDebtBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="line-clamp-2 text-xs text-gray-500">{displayValue(customer.address)}</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-3">
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-[#004B23] transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <VscEye className="size-4" />
                      View Details
                    </button>
                  </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Region
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Service Center
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Arrears
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <EmptySearchState
                            title={filters.search ? "No customers found" : "No customers available"}
                            description={
                              filters.search
                                ? "Try adjusting your search criteria"
                                : "Start by searching with customer name, account number, phone number, or email."
                            }
                            className="py-6"
                          />
                          {filters.search && (
                            <ButtonModule variant="outline" size="sm" onClick={resetFilters}>
                              Clear filters
                            </ButtonModule>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer: Customer) => (
                      <tr key={customer.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100">
                            <span className="text-xs font-semibold text-emerald-700">
                              {(customer.fullName || "")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{displayValue(customer.fullName)}</p>
                            <p className="text-xs text-gray-500">{displayValue(customer.email)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                            customer.status
                          )}`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getCustomerTypeStyle(
                            customer.isPPM ? "PREPAID" : "POSTPAID"
                          )}`}
                        >
                          {customer.isPPM ? "PREPAID" : "POSTPAID"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{displayValue(customer.accountNumber)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{displayValue(customer.provinceName)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{displayValue(customer.serviceCenterName)}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getArrearsStyle(
                            (customer.customerOutstandingDebtBalance || 0).toString()
                          )}`}
                        >
                          ₦{(customer.customerOutstandingDebtBalance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <VscEye className="size-3.5" />
                          View
                        </button>
                      </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {customers.length > 0 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Rows per page:</span>
                <div className="relative">
                  <select
                    name="pageSize"
                    value={pagination.pageSize}
                    onChange={handleRowsChange}
                    className="h-9 w-16 cursor-pointer appearance-none rounded-md border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value={6}>6 rows</option>
                    <option value={12}>12 rows</option>
                    <option value={18}>18 rows</option>
                    <option value={24}>24 rows</option>
                    <option value={50}>50 rows</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`flex size-8 items-center justify-center rounded-md border ${
                    pagination.currentPage === 1
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <BiSolidLeftArrow className="size-3" />
                </button>

                <div className="flex items-center gap-1">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex size-8 items-center justify-center rounded-md text-sm ${
                          pagination.currentPage === item
                            ? "bg-[#004B23] font-medium text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => changePage(item)}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-sm text-gray-500">
                        {item}
                      </span>
                    )
                  )}
                </div>

                <button
                  className={`flex size-8 items-center justify-center rounded-md border ${
                    pagination.currentPage === pagination.totalPages
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <BiSolidRightArrow className="size-3" />
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Filters Sidebar */}
        {showDesktopFilters && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden w-80 shrink-0 rounded-lg border border-gray-200 bg-gradient-to-b from-emerald-50/40 to-white p-4 shadow-sm 2xl:block"
          >
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-semibold text-gray-900">Filters & Sorting</h2>
              <button onClick={resetFilters} className="text-sm font-medium text-[#004B23] hover:text-[#00361a]">
                Clear all
              </button>
            </div>

            <div className="space-y-4">
              {/* DSS Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Distribution Substation</label>
                <FormSelectModule
                  name="dss"
                  value={localFilters.dss}
                  onChange={(e) => handleFilterChange("dss", e.target.value)}
                  options={[
                    { value: "", label: "All DSS" },
                    ...distributionSubstations.map((dss) => ({
                      value: dss.id.toString(),
                      label: `${dss.dssCode} - ${dss.feeder.name}`,
                    })),
                  ]}
                  className="w-full"
                  controlClassName="h-8 text-sm"
                />
              </div>

              {/* Service Center Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Service Center</label>
                <FormSelectModule
                  name="serviceCenter"
                  value={localFilters.serviceCenter}
                  onChange={(e) => handleFilterChange("serviceCenter", e.target.value)}
                  options={[
                    { value: "", label: "All Service Centers" },
                    ...serviceStations.map((sc) => ({
                      value: sc.id.toString(),
                      label: sc.name,
                    })),
                  ]}
                  className="w-full"
                  controlClassName="h-8 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["ACTIVE", "INACTIVE", "SUSPENDED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange("status", localFilters.status === status ? "" : status)}
                        className={`rounded-md px-3 py-2 text-xs transition-colors ${
                          localFilters.status === status
                          ? "border border-emerald-200 bg-emerald-50 font-medium text-emerald-700"
                          : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Customer Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["PREPAID", "POSTPAID"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange("customerType", localFilters.customerType === type ? "" : type)}
                      className={`rounded-md px-3 py-2 text-xs transition-colors ${
                        localFilters.customerType === type
                          ? "border border-green-200 bg-green-50 font-medium text-green-700"
                          : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tariff Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Tariff Band</label>
                <FormSelectModule
                  name="tariff"
                  value={localFilters.tariff}
                  onChange={(e) => handleFilterChange("tariff", e.target.value)}
                  options={[
                    { value: "", label: "All Tariffs" },
                    ...serviceBands.map((band) => ({ value: band, label: band })),
                  ]}
                  className="w-full"
                  controlClassName="h-8 text-sm"
                />
              </div>

              {/* Region Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Region</label>
                <FormSelectModule
                  name="region"
                  value={localFilters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                  options={[
                    { value: "", label: "All Regions" },
                    ...regions.map((region) => ({ value: region, label: region })),
                  ]}
                  className="w-full"
                  controlClassName="h-8 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700"
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
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                          localFilters.sortBy === option.value && localFilters.sortOrder === option.order
                            ? "border border-emerald-200 bg-emerald-50 font-medium text-emerald-700"
                            : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.sortBy === option.value && localFilters.sortOrder === option.order && (
                          <span>
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-6">
              <button
                onClick={applyFilters}
                className="w-full rounded-md bg-[#004B23] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00361a] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
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
        serviceStations={serviceStations}
        distributionSubstations={distributionSubstations}
      />

      {/* Modal Components */}
      <SendReminderModal isOpen={activeModal === "reminder"} onRequestClose={closeAllModals} onConfirm={() => {}} />
    </>
  )
}

export default AllCustomers
