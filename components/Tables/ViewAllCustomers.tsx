import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import { useRouter } from "next/navigation"
import { Customer, fetchCustomers, setFilters, setPagination } from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

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

// Skeleton Components
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
  </motion.div>
)

const CustomerListItemSkeleton = () => (
  <motion.div
    className="border-b bg-white p-4"
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-gray-200"></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="h-5 w-40 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-gray-200"></div>
              <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="mt-2 h-4 w-64 rounded bg-gray-200"></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded bg-gray-200"></div>
          <div className="size-6 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const CategoryCardSkeleton = () => (
  <motion.div
    className="rounded-lg border bg-white p-3"
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
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-4 flex items-center justify-between"
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
    <div className="h-8 w-40 rounded bg-gray-200"></div>
    <div className="mt-2 flex gap-4">
      <div className="h-10 w-80 rounded bg-gray-200"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

const ViewAllCustomers = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showCategories, setShowCategories] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState("")

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)

  // Modal states - only one modal can be open at a time
  const [activeModal, setActiveModal] = useState<"details" | "suspend" | "reminder" | "status" | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerAssets, setCustomerAssets] = useState<Asset[]>([])
  const router = useRouter()

  // Redux hooks
  const dispatch = useAppDispatch()
  const { customers, loading, error, pagination, filters } = useAppSelector((state) => state.customers)

  // Fetch customers on component mount and when filters/pagination change
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(
        fetchCustomers({
          pageNumber: pagination.currentPage,
          pageSize: pagination.pageSize,
          search: filters.search,
          status: filters.status,
          isSuspended: filters.isSuspended || undefined,
          distributionSubstationId: filters.distributionSubstationId || undefined,
          serviceCenterId: filters.serviceCenterId || undefined,
        })
      )
    }

    fetchData()
  }, [dispatch, pagination.currentPage, pagination.pageSize, filters])

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

  // Modal management functions
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

  // Specific modal handlers
  const handleViewDetails = (customer: Customer) => {
    // Navigate to customer details page
    router.push(`/customers/${customer.id}`)
  }

  const handleOpenSuspendModal = () => {
    openModal("suspend")
  }

  const handleOpenReminderModal = () => {
    openModal("reminder")
  }

  const handleOpenStatusModal = (customer?: Customer) => {
    openModal("status", customer ?? selectedCustomer ?? undefined)
  }

  // Modal confirmation handlers
  const handleConfirmSuspend = () => {
    console.log("Customer suspended")
    closeAllModals()
  }

  const handleConfirmReminder = (message: string) => {
    console.log("Reminder sent:", message)
    closeAllModals()
  }

  const handleConfirmStatusChange = (status: string) => {
    console.log("Status changed to:", status)
    closeAllModals()
  }

  // Search and filter handlers
  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }))
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
  }

  const handleCancelSearch = () => {
    dispatch(setFilters({ search: "" }))
  }

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(setPagination({ page: 1, pageSize: newPageSize }))
  }

  const handleStatusFilterChange = (status: string) => {
    dispatch(setFilters({ status }))
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }))
    setIsStatusFilterOpen(false)
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      dispatch(setPagination({ page, pageSize: pagination.pageSize }))
    }
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
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
            <span className="font-semibold text-blue-600">
              {customer.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{customer.fullName}</h3>
            <div className="mt-1 flex items-center gap-2">
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

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Account No:</span>
          <span className="font-medium">{customer.accountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Region:</span>
          <span className="font-medium">{customer.state}</span>
        </div>
        <div className="flex justify-between">
          <span>Service Center:</span>
          <span className="font-medium">{customer.serviceCenterName}</span>
        </div>
        <div className="flex justify-between">
          <span>Tariff:</span>
          <span className="font-medium">{customer.band}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Outstanding Arrears:</span>
          <div
            style={getArrearsStyle(customer.customerOutstandingDebtBalance.toString())}
            className="rounded-full px-2 py-1 text-xs font-medium"
          >
            ₦{customer.customerOutstandingDebtBalance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-500">{customer.address}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleViewDetails(customer)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#f9f9f9]"
        >
          <VscEye className="size-4" />
          View Details
        </button>
      </div>
    </div>
  )

  const CustomerListItem = ({ customer }: { customer: Customer }) => (
    <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {customer.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">{customer.fullName}</h3>
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
              <div
                style={getArrearsStyle(customer.customerOutstandingDebtBalance.toString())}
                className="rounded-full px-2 py-1 text-xs font-medium"
              >
                Arrears: ₦{customer.customerOutstandingDebtBalance.toLocaleString()}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Account:</strong> {customer.accountNumber}
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
            <p className="mt-2 text-sm text-gray-500">{customer.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">Phone: {customer.phoneNumber}</div>
            <div className="text-gray-600">Email: {customer.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleViewDetails(customer)} className="button-oulined flex items-center gap-2">
              <VscEye className="size-4" />
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const customerCategories: CustomerCategory[] = [
    {
      name: "Residential - R1",
      code: "R1",
      customerCount: 45200,
      rate: "₦68/kWh",
      type: "residential",
    },
    {
      name: "Residential - R2",
      code: "R2",
      customerCount: 38150,
      rate: "₦92.5/kWh",
      type: "residential",
    },
    {
      name: "Residential - R3",
      code: "R3",
      customerCount: 22800,
      rate: "₦118/kWh",
      type: "residential",
    },
    {
      name: "Commercial - C1",
      code: "C1",
      customerCount: 8400,
      rate: "₦125/kWh",
      type: "commercial",
    },
    {
      name: "Commercial - C2",
      code: "C2",
      customerCount: 4200,
      rate: "₦142.5/kWh",
      type: "commercial",
    },
    {
      name: "Commercial - C3",
      code: "C3",
      customerCount: 2800,
      rate: "₦168/kWh",
      type: "commercial",
    },
  ]

  const CategoryCard = ({ category }: { category: CustomerCategory }) => (
    <div className="rounded-lg border bg-[#f9f9f9] p-3 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{category.code}</h3>
          <div
            className={`rounded px-2 py-1 text-xs ${
              category.type === "residential" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
            }`}
          >
            {category.type}
          </div>
        </div>
        <div className="flex text-sm">
          <span className="font-medium">{category.rate}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Customers:</span>
          <span className="font-medium">{category.customerCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content Skeleton */}
        <div className={`rounded-md border bg-white p-5 ${showCategories ? "flex-1" : "w-full"}`}>
          <HeaderSkeleton />

          {/* Customer Display Area Skeleton */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        {/* Categories Sidebar Skeleton */}
        {showCategories && (
          <div className="w-80 rounded-md border bg-white p-5">
            <div className="border-b pb-4">
              <div className="h-6 w-40 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-3">
              {[...Array(6)].map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </div>

            {/* Summary Stats Skeleton */}
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
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content - Customers List/Grid */}
        <div className={`rounded-md border bg-white p-5 ${showCategories ? "flex-1" : "w-full"}`}>
          <div className="flex flex-col py-2">
            <p className="text-2xl font-medium">All Customers</p>
            <div className="mt-2 flex gap-4">
              <SearchModule
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by name, account number, or meter number"
                className="max-w-[300px] "
              />

              <div className="flex gap-2">
                <button
                  className={`button-oulined ${viewMode === "grid" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <MdGridView />
                  <p>Grid</p>
                </button>
                <button
                  className={`button-oulined ${viewMode === "list" ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <MdFormatListBulleted />
                  <p>List</p>
                </button>
              </div>

              <div className="relative" data-dropdown-root="status-filter">
                <button
                  type="button"
                  className="button-oulined flex items-center gap-2"
                  onClick={() => setIsStatusFilterOpen((open) => !open)}
                >
                  <IoMdFunnel />
                  <span>
                    {filters.status === "ACTIVE"
                      ? "Active"
                      : filters.status === "INACTIVE"
                      ? "Inactive"
                      : filters.status === "SUSPENDED"
                      ? "Suspended"
                      : "All Status"}
                  </span>
                  <ChevronDown
                    className={`size-4 text-gray-500 transition-transform ${isStatusFilterOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isStatusFilterOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50 ${
                          filters.status === "" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleStatusFilterChange("")}
                      >
                        All Status
                      </button>
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50 ${
                          filters.status === "ACTIVE" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleStatusFilterChange("ACTIVE")}
                      >
                        Active
                      </button>
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50 ${
                          filters.status === "INACTIVE" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleStatusFilterChange("INACTIVE")}
                      >
                        Inactive
                      </button>
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50 ${
                          filters.status === "SUSPENDED" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleStatusFilterChange("SUSPENDED")}
                      >
                        Suspended
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="button-oulined" type="button">
                <IoMdFunnel />
                <p>Sort By</p>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
              <p>Error loading customers: {error}</p>
            </div>
          )}

          {/* Customer Display Area */}
          <div className="w-full">
            {customers.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100">
                    <VscEye className="size-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {filters.search ? "Try adjusting your search criteria" : "No customers available"}
                  </p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p>Show rows</p>
                <select value={pagination.pageSize} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className={`px-3 py-2 ${
                    pagination.currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                  }`}
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <BiSolidLeftArrow />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      className={`flex h-[27px] w-[30px] items-center justify-center rounded-md ${
                        pagination.currentPage === index + 1 ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                      }`}
                      onClick={() => changePage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  className={`px-3 py-2 ${
                    pagination.currentPage === pagination.totalPages
                      ? "cursor-not-allowed text-gray-400"
                      : "text-[#000000]"
                  }`}
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <BiSolidRightArrow />
                </button>
              </div>
              <p>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total records)
              </p>
            </div>
          )}
        </div>

        {/* Customer Categories Sidebar */}
      </div>

      {/* Modal Components - Only one modal can be open at a time */}
      {/* <CustomerDetailsModal
        isOpen={activeModal === "details"}
        onRequestClose={closeAllModals}
        customer={selectedCustomer}
        assets={customerAssets}
        onUpdateStatus={handleOpenStatusModal}
        onSendReminder={handleOpenReminderModal}
        onSuspendAccount={handleOpenSuspendModal}
      /> */}

      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />

      {/* <UpdateStatusModal
        isOpen={activeModal === "status"}
        onRequestClose={closeAllModals}
        customer={selectedCustomer}
      /> */}
    </>
  )
}

export default ViewAllCustomers
