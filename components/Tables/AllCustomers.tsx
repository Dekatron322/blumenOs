import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel, IoMdSearch } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import { useRouter } from "next/navigation"
import { Customer, fetchCustomers, setFilters, setPagination } from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import Image from "next/image"

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

// Responsive Skeleton Components
const CustomerCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-4 shadow-sm"
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
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gray-200 md:size-12"></div>
        <div className="min-w-0 flex-1">
          <div className="h-5 w-24 rounded bg-gray-200 md:w-32"></div>
          <div className="mt-1 flex flex-wrap gap-1 md:gap-2">
            <div className="mt-1 h-6 w-12 rounded-full bg-gray-200 md:w-16"></div>
            <div className="mt-1 h-6 w-16 rounded-full bg-gray-200 md:w-20"></div>
          </div>
        </div>
      </div>
      <div className="size-5 rounded bg-gray-200 md:size-6"></div>
    </div>

    <div className="mt-3 space-y-2 md:mt-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
          <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-16"></div>
        </div>
      ))}
    </div>

    <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
      <div className="h-3 w-full rounded bg-gray-200 md:h-4"></div>
    </div>

    <div className="mt-2 flex gap-2 md:mt-3">
      <div className="h-8 flex-1 rounded bg-gray-200 md:h-9"></div>
    </div>
  </motion.div>
)

const CustomerListItemSkeleton = () => (
  <motion.div
    className="border-b bg-white p-3 md:p-4"
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
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
      <div className="flex items-start gap-3 md:items-center md:gap-4">
        <div className="size-8 flex-shrink-0 rounded-full bg-gray-200 md:size-10"></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <div className="h-5 w-32 rounded bg-gray-200 md:w-40"></div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              <div className="h-6 w-12 rounded-full bg-gray-200 md:w-16"></div>
              <div className="h-6 w-16 rounded-full bg-gray-200 md:w-20"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-24"></div>
            ))}
          </div>
          <div className="mt-2 hidden h-3 w-40 rounded bg-gray-200 md:block md:h-4 md:w-64"></div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:justify-end md:gap-3">
        <div className="hidden text-right md:block">
          <div className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-24"></div>
          <div className="mt-1 h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-14 rounded bg-gray-200 md:h-9 md:w-20"></div>
          <div className="size-5 rounded bg-gray-200 md:size-6"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const FilterPanelSkeleton = () => (
  <motion.div
    className="hidden w-full rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:block 2xl:w-80"
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
    <div className="border-b pb-3 md:pb-4">
      <div className="h-6 w-32 rounded bg-gray-200 md:w-40"></div>
    </div>

    <div className="mt-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-20 rounded bg-gray-200 md:w-24"></div>
          <div className="h-9 w-full rounded bg-gray-200"></div>
        </div>
      ))}
    </div>

    <div className="mt-6 space-y-3">
      <div className="h-4 w-24 rounded bg-gray-200"></div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-4 rounded bg-gray-200"></div>
          <div className="h-4 w-20 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0"
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
    <div className="order-2 flex items-center gap-2 md:order-1">
      <div className="hidden h-4 w-12 rounded bg-gray-200 md:block md:w-16"></div>
      <div className="h-7 w-12 rounded bg-gray-200 md:h-8 md:w-16"></div>
    </div>

    <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
      <div className="size-7 rounded bg-gray-200 md:size-8"></div>
      <div className="flex gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-6 rounded bg-gray-200 md:size-7"></div>
        ))}
      </div>
      <div className="size-7 rounded bg-gray-200 md:size-8"></div>
    </div>

    <div className="order-3 hidden h-4 w-20 rounded bg-gray-200 md:block md:w-24"></div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="flex flex-col py-2"
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
    <div className="h-7 w-32 rounded bg-gray-200 md:h-8 md:w-40"></div>
    <div className="mt-2 flex flex-col gap-3 md:mt-3 md:flex-row md:gap-4">
      <div className="h-9 w-full rounded bg-gray-200 md:h-10 md:w-60 2xl:w-80"></div>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 2xl:w-24"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

// Mobile & All Screens Filter Sidebar Component (up to 2xl)
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
              {/* DSS Filter */}
              <div>
                <FormSelectModule
                  label="Distribution Substation"
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
                <FormSelectModule
                  label="Service Center"
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
                <label className="mb-2 block text-sm font-medium">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["ACTIVE", "INACTIVE", "SUSPENDED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange("status", localFilters.status === status ? "" : status)}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        localFilters.status === status
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Type Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">Customer Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["PREPAID", "POSTPAID"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange("customerType", localFilters.customerType === type ? "" : type)}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        localFilters.customerType === type
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tariff Filter */}
              <div>
                <FormSelectModule
                  label="Tariff Band"
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
                <FormSelectModule
                  label="Region"
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

            {/* Bottom Action Buttons - confined to sidebar width */}
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

const AllCustomers = () => {
  const [searchInput, setSearchInput] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [isSortExpanded, setIsSortExpanded] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false) // For mobile/tablet/desktop up to 2xl
  const [showDesktopFilters, setShowDesktopFilters] = useState(true) // For desktop 2xl and above

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    dss: "",
    serviceCenter: "",
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

  // Fetch customers on component mount and when filters/pagination change
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        fetchCustomers({
          pageNumber: pagination.currentPage,
          pageSize: pagination.pageSize,
          search: filters.search,
          status: filters.status,
          isSuspended: filters.isSuspended !== null ? filters.isSuspended : undefined,
          distributionSubstationId:
            filters.distributionSubstationId !== null ? filters.distributionSubstationId : undefined,
          serviceCenterId: filters.serviceCenterId !== null ? filters.serviceCenterId : undefined,
        })
      )
    }

    fetchData()
  }, [dispatch, pagination.currentPage, pagination.pageSize, filters])

  // Sync local search input with Redux filters
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim()
      const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

      if (shouldUpdate && trimmed !== filters.search) {
        dispatch(setFilters({ search: trimmed }))
        dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [searchInput, filters.search, dispatch, pagination.pageSize])

  // Fetch service centers and distribution substations for filters
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

  const handleCancelSearch = () => {
    setSearchInput("")
    dispatch(setFilters({ search: "" }))
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Apply all filters at once
  const applyFilters = () => {
    dispatch(
      setFilters({
        search: searchInput,
        status: localFilters.status || undefined,
        serviceCenterId: localFilters.serviceCenter ? Number(localFilters.serviceCenter) : undefined,
        distributionSubstationId: localFilters.dss ? Number(localFilters.dss) : undefined,
      })
    )
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      dss: "",
      serviceCenter: "",
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
      case "ACTIVE":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "INACTIVE":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "SUSPENDED":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return {}
    }
  }

  const getCustomerTypeStyle = (type: string) => {
    switch (type) {
      case "PREPAID":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "POSTPAID":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      default:
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    }
  }

  const getArrearsStyle = (arrears: string) => {
    const amount = parseFloat(arrears)
    if (amount === 0) {
      return { backgroundColor: "#EEF5F0", color: "#589E67" }
    } else if (amount <= 5000) {
      return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    } else {
      return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
    }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { backgroundColor: "#589E67" }
      case "INACTIVE":
        return { backgroundColor: "#D28E3D" }
      case "SUSPENDED":
        return { backgroundColor: "#AF4B4B" }
      default:
        return {}
    }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-green-100 md:size-12">
            <span className="text-sm font-semibold text-green-600 md:text-base">
              {customer.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 md:text-base">{customer.fullName}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1 md:gap-2">
              <div
                style={getStatusStyle(customer.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(customer.status)}></span>
                {customer.status}
              </div>
              <div
                style={getCustomerTypeStyle(customer.isPPM ? "PREPAID" : "POSTPAID")}
                className="rounded-full px-2 py-1 text-xs"
              >
                {customer.isPPM ? "PREPAID" : "POSTPAID"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-600 md:mt-4">
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Account No:</span>
          <span className="text-xs font-medium md:text-sm">{customer.accountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Region:</span>
          <span className="text-xs font-medium md:text-sm">{customer.state}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Service Center:</span>
          <span className="text-xs font-medium md:text-sm">{customer.serviceCenterName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs md:text-sm">Tariff:</span>
          <span className="text-xs font-medium md:text-sm">{customer.band}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm">Outstanding Arrears:</span>
          <div
            style={getArrearsStyle(customer.customerOutstandingDebtBalance.toString())}
            className="rounded-full px-2 py-1 text-xs font-medium"
          >
            ₦{customer.customerOutstandingDebtBalance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
        <p className="text-xs text-gray-500">{customer.address}</p>
      </div>

      <div className="mt-2 flex gap-2 md:mt-3">
        <button
          onClick={() => handleViewDetails(customer)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white text-sm transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#004B23] focus-within:ring-offset-2 hover:border-[#004B23] hover:bg-[#f9f9f9] md:text-base"
        >
          <VscEye className="size-3 md:size-4" />
          View Details
        </button>
      </div>
    </div>
  )

  const CustomerListItem = ({ customer }: { customer: Customer }) => (
    <div className="border-b bg-white p-3 transition-all hover:bg-gray-50 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-start gap-3 md:items-center md:gap-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-100 max-sm:hidden md:size-10">
            <span className="text-xs font-semibold text-green-600 md:text-sm">
              {customer.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <h3 className="text-sm font-semibold text-gray-900 md:text-base">{customer.fullName}</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <div
                  style={getStatusStyle(customer.status)}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                >
                  <span className="size-2 rounded-full" style={dotStyle(customer.status)}></span>
                  {customer.status}
                </div>
                <div
                  style={getCustomerTypeStyle(customer.isPPM ? "PREPAID" : "POSTPAID")}
                  className="rounded-full px-2 py-1 text-xs"
                >
                  {customer.isPPM ? "PREPAID" : "POSTPAID"}
                </div>
                {customer.isMD && <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">MD</div>}
                {customer.isUrban && (
                  <div className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">Urban</div>
                )}
                <div
                  style={getArrearsStyle(customer.customerOutstandingDebtBalance.toString())}
                  className="rounded-full px-2 py-1 text-xs font-medium"
                >
                  ₦{customer.customerOutstandingDebtBalance.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 md:gap-4 md:text-sm">
              <span>
                <strong className="md:hidden">Acc:</strong>
                <strong className="hidden md:inline">Account:</strong> {customer.accountNumber}
              </span>
              <span>
                <strong>Region:</strong> {customer.state}
              </span>
              <span>
                <strong>Service Center:</strong> {customer.serviceCenterName}
              </span>
              <span>
                <strong>Tariff:</strong> {customer.band}
              </span>
            </div>
            <p className="mt-2 hidden text-xs text-gray-500 md:block md:text-sm">{customer.address}</p>
          </div>
        </div>

        <div className="flex items-start justify-between md:items-center md:gap-3">
          <div className="text-right text-xs md:text-sm">
            <div className="hidden font-medium text-gray-900 md:block">Phone: {customer.phoneNumber}</div>
            <div className="hidden text-gray-600 md:block">Email: {customer.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewDetails(customer)}
              className="button-oulined flex items-center gap-2 text-xs md:text-sm"
            >
              <VscEye className="size-3 md:size-4" />
              <span className="hidden md:inline">View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 2xl:flex-row">
        {/* Main Content Skeleton */}
        <div className="w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1">
          <HeaderSkeleton />

          {/* Customer Display Area Skeleton */}
          <div className="mt-4 w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 2xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <CustomerCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {[...Array(5)].map((_, index) => (
                  <CustomerListItemSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          <PaginationSkeleton />
        </div>

        {/* Desktop Filters Sidebar Skeleton (2xl and above) */}
        <FilterPanelSkeleton />
      </div>
    )
  }

  return (
    <>
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
              {/* DSS Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                  Distribution Substation (DSS)
                </label>
                <FormSelectModule
                  name="dss"
                  value={localFilters.dss}
                  onChange={(e) => handleFilterChange("dss", e.target.value)}
                  options={[
                    { value: "", label: "All DSS" },
                    ...distributionSubstations.map((dss) => ({
                      value: dss.id.toString(),
                      label: dss.nameOfNewOAreaffice || dss.name || `DSS ${dss.id}`,
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
                  name="serviceCenter"
                  value={localFilters.serviceCenter}
                  onChange={(e) => handleFilterChange("serviceCenter", e.target.value)}
                  options={[
                    { value: "", label: "All Service Centers" },
                    ...serviceStations.map((sc) => ({
                      value: sc.id.toString(),
                      label: sc.name || `Service Center ${sc.id}`,
                    })),
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <FormSelectModule
                  name="status"
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                    { value: "SUSPENDED", label: "Suspended" },
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Customer Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Customer Type</label>
                <FormSelectModule
                  name="customerType"
                  value={localFilters.customerType}
                  onChange={(e) => handleFilterChange("customerType", e.target.value)}
                  options={[
                    { value: "", label: "All Types" },
                    { value: "PREPAID", label: "Prepaid" },
                    { value: "POSTPAID", label: "Postpaid" },
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Tariff Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Tariff Band</label>
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
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Region</label>
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
                  <span className="font-medium">{pagination.totalCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {pagination.currentPage} / {pagination.totalPages}
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

        {/* Main Content - Customers List/Grid */}
        <div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
        >
          <div className="flex flex-col py-2">
            <div className="mb-3 flex w-full items-center justify-between gap-3">
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

                <p className="whitespace-nowrap text-lg font-medium sm:text-xl md:text-2xl">All Customers</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile search icon button */}
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 sm:hidden md:size-9"
                  onClick={() => setShowMobileSearch((prev) => !prev)}
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
                    placeholder="Search by name or account number"
                    className="w-full max-w-full sm:max-w-[320px]"
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
              </div>
            </div>

            {/* Mobile search input revealed when icon is tapped */}
            {showMobileSearch && (
              <div className="mb-3 sm:hidden">
                <SearchModule
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onCancel={handleCancelSearch}
                  placeholder="Search by name or account number"
                  className="w-full"
                />
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2 md:flex-nowrap md:gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`button-oulined ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <MdGridView className="size-4 md:size-5" />
                  <p className="text-sm md:text-base">Grid</p>
                </button>
                <button
                  className={`button-oulined ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <MdFormatListBulleted className="size-4 md:size-5" />
                  <p className="text-sm md:text-base">List</p>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 md:p-4 md:text-base">
              <p>Error loading customers: {error}</p>
            </div>
          )}

          {/* Customer Display Area */}
          <div className="w-full">
            {customers.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <div className="text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-gray-100 md:size-12">
                    <VscEye className="size-5 text-gray-400 md:size-6" />
                  </div>
                  <h3 className="mt-3 text-base font-medium text-gray-900 md:mt-4 md:text-lg">No customers found</h3>
                  <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm">
                    {filters.search ? "Try adjusting your search criteria" : "No customers available"}
                  </p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 2xl:grid-cols-3">
                {customers.map((customer: Customer) => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {customers.map((customer: Customer) => (
                  <CustomerListItem key={customer.id} customer={customer} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {customers.length > 0 && (
            <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 md:flex-row">
              <div className="flex items-center gap-1 max-sm:hidden">
                <p className="text-sm md:text-base">Show rows</p>
                <div className="min-w-[80px]">
                  <FormSelectModule
                    label=""
                    name="pageSize"
                    value={pagination.pageSize}
                    onChange={handleRowsChange}
                    options={[
                      { value: 6, label: "6" },
                      { value: 12, label: "12" },
                      { value: 18, label: "18" },
                      { value: 24, label: "24" },
                      { value: 50, label: "50" },
                    ]}
                    className="w-full"
                    controlClassName="h-8 text-sm md:h-9 md:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start md:gap-3">
                <button
                  className={`px-2 py-1 md:px-3 md:py-2 ${
                    pagination.currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                  }`}
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <BiSolidLeftArrow className="size-4 md:size-5" />
                </button>

                <div className="flex items-center gap-1 md:gap-2">
                  <div className="hidden items-center gap-1 md:flex md:gap-2">
                    {getPageItems().map((item, index) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          className={`flex size-6 items-center justify-center rounded-md text-xs md:h-7 md:w-8 md:text-sm ${
                            pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
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

                  <div className="flex items-center gap-1 md:hidden">
                    {getMobilePageItems().map((item, index) =>
                      typeof item === "number" ? (
                        <button
                          key={item}
                          className={`flex size-6 items-center justify-center rounded-md text-xs md:w-8 ${
                            pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
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
                  className={`px-2 py-1 md:px-3 md:py-2 ${
                    pagination.currentPage === pagination.totalPages
                      ? "cursor-not-allowed text-gray-400"
                      : "text-[#000000]"
                  }`}
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <BiSolidRightArrow className="size-4 md:size-5" />
                </button>
              </div>
              <p className="text-sm max-sm:hidden md:text-base">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total records)
              </p>
            </div>
          )}
        </div>
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
      />

      {/* Modal Components */}
      <SendReminderModal isOpen={activeModal === "reminder"} onRequestClose={closeAllModals} onConfirm={() => {}} />
    </>
  )
}

export default AllCustomers
