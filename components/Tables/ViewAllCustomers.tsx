import React, { useEffect, useState } from "react"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel, IoMdSearch } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { ChevronDown } from "lucide-react"
import { SearchModule } from "components/ui/Search/search-module"
import { AnimatePresence, motion } from "framer-motion"
import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import { useRouter } from "next/navigation"
import { Customer, fetchCustomers, setFilters, setPagination } from "lib/redux/customerSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
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
        <div className="h-5 w-10 rounded bg-gray-200 md:w-12"></div>
        <div className="h-5 w-16 rounded bg-gray-200 md:w-20"></div>
      </div>
      <div className="h-4 w-12 rounded bg-gray-200 md:w-16"></div>
    </div>
    <div className="mt-2 space-y-1 md:mt-3">
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
        <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-16"></div>
      </div>
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
      <div className="h-9 w-full rounded bg-gray-200 md:h-10 md:w-60 lg:w-80"></div>
      <div className="flex flex-wrap gap-1 md:gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 lg:w-24"></div>
        ))}
      </div>
    </div>
  </motion.div>
)

const MobileFilterSkeleton = () => (
  <motion.div
    className="flex gap-2 md:hidden"
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
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-8 w-20 rounded-full bg-gray-200"></div>
    ))}
  </motion.div>
)

const AllCustomers = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showCategories, setShowCategories] = useState(true)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
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

    // Always show first page
    items.push(1)

    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      // Close to the start: show first few pages
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      // Close to the end: show ellipsis then last few pages
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      // In the middle: show ellipsis, surrounding pages, then ellipsis
      items.push("...", current - 1, current, current + 1, "...")
    }

    // Always show last page
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

    // Example for early pages on mobile: 1,2,3,...,last
    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    // Middle pages: 1, ..., current, ..., last
    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    // Near the end: 1, ..., last-2, last-1, last
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

  const customerCategories: CustomerCategory[] = React.useMemo(() => {
    const counts = {
      prepaid: 0,
      postpaid: 0,
      md: 0,
      urban: 0,
      hrb: 0,
      govt: 0,
    }

    customers.forEach((customer) => {
      if (customer.isPPM) {
        counts.prepaid += 1
      } else {
        counts.postpaid += 1
      }

      if (customer.isMD) {
        counts.md += 1
      }

      if (customer.isUrban) {
        counts.urban += 1
      }

      if (customer.isHRB) {
        counts.hrb += 1
      }

      if (customer.isCustomerAccGovt) {
        counts.govt += 1
      }
    })

    const categories: CustomerCategory[] = []

    if (counts.prepaid > 0) {
      categories.push({
        name: "Prepaid Customers",
        code: "Prepaid",
        customerCount: counts.prepaid,
        rate: "",
        type: "residential",
      })
    }

    if (counts.postpaid > 0) {
      categories.push({
        name: "Postpaid Customers",
        code: "Postpaid",
        customerCount: counts.postpaid,
        rate: "",
        type: "residential",
      })
    }

    if (counts.md > 0) {
      categories.push({
        name: "MD Customers",
        code: "MD",
        customerCount: counts.md,
        rate: "",
        type: "commercial",
      })
    }

    if (counts.urban > 0) {
      categories.push({
        name: "Urban Customers",
        code: "Urban",
        customerCount: counts.urban,
        rate: "",
        type: "commercial",
      })
    }

    if (counts.hrb > 0) {
      categories.push({
        name: "HRB Customers",
        code: "HRB",
        customerCount: counts.hrb,
        rate: "",
        type: "commercial",
      })
    }

    if (counts.govt > 0) {
      categories.push({
        name: "Government Accounts",
        code: "Government",
        customerCount: counts.govt,
        rate: "",
        type: "commercial",
      })
    }

    return categories
  }, [customers])

  const CategoryCard = ({ category }: { category: CustomerCategory }) => (
    <div className="rounded-lg border bg-[#f9f9f9] p-3 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900 md:text-base">{category.code}</h3>
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
      <div className="mt-2 space-y-1 md:mt-3">
        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-gray-600">Customers:</span>
          <span className="font-medium">{category.customerCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
        {/* Main Content Skeleton */}
        <div className={`w-full rounded-md border bg-white p-3 md:p-5 ${showCategories ? "lg:flex-1" : ""}`}>
          <HeaderSkeleton />

          {/* Mobile Filters Skeleton */}
          <div className="mt-3 md:hidden">
            <MobileFilterSkeleton />
          </div>

          {/* Customer Display Area Skeleton */}
          <div className="mt-4 w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
          <div className="mt-4 w-full rounded-md border bg-white p-3 md:p-5 lg:mt-0 lg:w-80">
            <div className="border-b pb-3 md:pb-4">
              <div className="h-6 w-32 rounded bg-gray-200 md:w-40"></div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 lg:grid-cols-1">
              {[...Array(6)].map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </div>

            {/* Summary Stats Skeleton */}
            <div className="mt-4 rounded-lg bg-gray-50 p-3 md:mt-6">
              <div className="mb-2 h-5 w-16 rounded bg-gray-200 md:w-20"></div>
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-24"></div>
                    <div className="h-3 w-10 rounded bg-gray-200 md:h-4 md:w-12"></div>
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
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 max-md:px-3 2xl:mt-5 2xl:flex-row">
        {/* Main Content - Customers List/Grid */}
        <div className={`w-full rounded-md border bg-white p-3 md:p-5 ${showCategories ? "lg:flex-1" : ""}`}>
          <div className="flex flex-col py-2">
            <div className="mb-3 flex w-full items-center justify-between gap-3">
              <p className="whitespace-nowrap text-lg font-medium sm:text-xl md:text-2xl">All Customers</p>

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
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onCancel={handleCancelSearch}
                    placeholder="Search by name, account number, or meter number"
                    className="w-full max-w-full md:max-w-[300px]"
                  />
                </div>
              </div>
            </div>

            {/* Mobile search input revealed when icon is tapped */}
            {showMobileSearch && (
              <div className="mb-3 sm:hidden">
                <SearchModule
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onCancel={handleCancelSearch}
                  placeholder="Search by name, account number, or meter number"
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

              <button
                className="button-oulined hidden text-sm sm:block md:text-base xl:block"
                onClick={() => setShowCategories(!showCategories)}
              >
                {showCategories ? "Hide Categories" : "Show Categories"}
              </button>

              <div className="relative" data-dropdown-root="status-filter">
                <button
                  type="button"
                  className="button-oulined flex items-center gap-2 text-sm md:text-base"
                  onClick={() => setIsStatusFilterOpen((open) => !open)}
                >
                  <IoMdFunnel className="size-4 md:size-5" />
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
                    className={`size-3 text-gray-500 transition-transform md:size-4 ${
                      isStatusFilterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isStatusFilterOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 md:w-48">
                    <div className="py-1">
                      <button
                        className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                          filters.status === "" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleStatusFilterChange("")}
                      >
                        All Status
                      </button>
                      <button
                        className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                          filters.status === "ACTIVE" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleStatusFilterChange("ACTIVE")}
                      >
                        Active
                      </button>
                      <button
                        className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
                          filters.status === "INACTIVE" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => handleStatusFilterChange("INACTIVE")}
                      >
                        Inactive
                      </button>
                      <button
                        className={`flex w-full items-center px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-gray-50 md:px-4 md:text-sm ${
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

              <button className="button-oulined text-sm md:text-base" type="button">
                <IoMdFunnel className="size-4 md:size-5" />
                <p className="text-sm md:text-base">Sort By</p>
              </button>
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
                <select
                  value={pagination.pageSize}
                  onChange={handleRowsChange}
                  className="bg-[#F2F2F2] p-1 text-sm md:text-base"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                  <option value={50}>50</option>
                </select>
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

      {/* Modal Components - Only one modal can be open at a time */}
      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />
    </>
  )
}

export default AllCustomers
