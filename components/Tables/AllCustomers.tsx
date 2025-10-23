import React, { useState, useEffect } from "react"
import { RxDotsVertical } from "react-icons/rx"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { PiNoteBold } from "react-icons/pi"
import { IoMdFunnel } from "react-icons/io"
import { IoFunnelOutline } from "react-icons/io5"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { GoXCircle } from "react-icons/go"
import { WiTime3 } from "react-icons/wi"
import { VscEye } from "react-icons/vsc"
import { SearchModule } from "components/ui/Search/search-module"
import { useGetCustomersQuery } from "lib/redux/customerSlice"
import { motion, AnimatePresence } from "framer-motion"

import SendReminderModal from "components/ui/Modal/send-reminder-modal"
import UpdateStatusModal from "components/ui/Modal/update-status-modal"
import SuspendAccountModal from "components/ui/Modal/suspend-account-modal"
import CustomerDetailsModal from "components/ui/Modal/customer-details-modal"

type SortOrder = "asc" | "desc" | null

interface Customer {
  id: string
  accountNumber: string
  customerName: string
  customerType: "PREPAID" | "POSTPAID"
  serviceBand: string
  tariffClass: string
  region: string
  businessUnit: string
  feederId: string | null
  transformerId: string | null
  address: string
  phoneNumber: string
  email: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  outstandingArrears: string
  createdAt: string
  updatedAt: string
  meters: any[]
  prepaidAccount: any | null
  postpaidAccount: any | null
}

interface CustomerCategory {
  name: string
  code: string
  customerCount: number
  rate: string
  type: "residential" | "commercial"
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
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
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

const AllCustomers = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [rowsPerPage, setRowsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [showCategories, setShowCategories] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string>("")

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Modal states - only one modal can be open at a time
  const [activeModal, setActiveModal] = useState<"details" | "suspend" | "reminder" | "status" | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // API call with pagination and filtering
  const {
    data: customersData,
    isLoading,
    error,
  } = useGetCustomersQuery({
    page: currentPage,
    limit: rowsPerPage,
    region: selectedRegion || undefined,
  })

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-root="customer-actions"]')) {
        setActiveDropdown(null)
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
  const handleOpenDetailsModal = (customer: Customer) => {
    openModal("details", customer)
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

  const toggleSort = (column: keyof Customer) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  // Filter customers based on search text
  const filteredCustomers =
    customersData?.data?.customers?.filter((customer: Customer) =>
      Object.values(customer).some((value) => value?.toString().toLowerCase().includes(searchText.toLowerCase()))
    ) || []

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value))
    setCurrentPage(1)
  }

  const totalPages = customersData?.data?.pagination?.totalPages || 1
  const totalRecords = customersData?.data?.pagination?.totalRecords || 0

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page)
  }

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <span className="font-semibold text-blue-600">
              {customer.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{customer.customerName}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div
                style={getStatusStyle(customer.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(customer.status)}></span>
                {customer.status}
              </div>
              <div style={getCustomerTypeStyle(customer.customerType)} className="rounded-full px-2 py-1 text-xs">
                {customer.customerType}
              </div>
            </div>
          </div>
        </div>
        <div className="relative" data-dropdown-root="customer-actions">
          <RxDotsVertical
            onClick={() => toggleDropdown(customer.id)}
            className="cursor-pointer text-gray-400 hover:text-gray-600"
          />
          {activeDropdown === customer.id && (
            <div className="modal-style absolute right-0 top-full z-[100] mt-2 w-48 rounded border border-gray-300 bg-white shadow-lg">
              <ul className="text-sm">
                <li
                  className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleOpenStatusModal(customer)}
                >
                  <VscEye />
                  Update Status
                </li>
                <li
                  className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                  onClick={handleOpenReminderModal}
                >
                  <WiTime3 /> Send Reminder
                </li>
                <li
                  className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                  onClick={handleOpenSuspendModal}
                >
                  <GoXCircle /> Suspend Account
                </li>
                <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100">
                  <PiNoteBold />
                  Export Data
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Account No:</span>
          <span className="font-medium">{customer.accountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Region:</span>
          <span className="font-medium">{customer.region}</span>
        </div>
        <div className="flex justify-between">
          <span>Service Band:</span>
          <span className="font-medium">{customer.serviceBand}</span>
        </div>
        <div className="flex justify-between">
          <span>Tariff:</span>
          <span className="font-medium">{customer.tariffClass}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Outstanding Arrears:</span>
          <div
            style={getArrearsStyle(customer.outstandingArrears)}
            className="rounded-full px-2 py-1 text-xs font-medium"
          >
            ₦{parseFloat(customer.outstandingArrears).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-500">{customer.address}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleOpenDetailsModal(customer)}
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
              {customer.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">{customer.customerName}</h3>
              <div
                style={getStatusStyle(customer.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(customer.status)}></span>
                {customer.status}
              </div>
              <div style={getCustomerTypeStyle(customer.customerType)} className="rounded-full px-2 py-1 text-xs">
                {customer.customerType}
              </div>
              <div
                style={getArrearsStyle(customer.outstandingArrears)}
                className="rounded-full px-2 py-1 text-xs font-medium"
              >
                Arrears: ₦{parseFloat(customer.outstandingArrears).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Account:</strong> {customer.accountNumber}
              </span>
              <span>
                <strong>Region:</strong> {customer.region}
              </span>
              <span>
                <strong>Service Band:</strong> {customer.serviceBand}
              </span>
              <span>
                <strong>Tariff:</strong> {customer.tariffClass}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{customer.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">
              Created: {new Date(customer.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleOpenDetailsModal(customer)} className="button-oulined flex items-center gap-2">
              <VscEye className="size-4" />
              View
            </button>
            <div className="relative" data-dropdown-root="customer-actions">
              <RxDotsVertical
                onClick={() => toggleDropdown(customer.id)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              />
              {activeDropdown === customer.id && (
                <div className="modal-style absolute right-0 top-full z-[100] mt-2 w-48 rounded border border-gray-300 bg-white shadow-lg">
                  <ul className="text-sm">
                    <li
                      className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleOpenStatusModal(customer)}
                    >
                      <VscEye />
                      Update Status
                    </li>
                    <li
                      className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                      onClick={handleOpenReminderModal}
                    >
                      <WiTime3 /> Send Reminder
                    </li>
                    <li
                      className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100"
                      onClick={handleOpenSuspendModal}
                    >
                      <GoXCircle /> Suspend Account
                    </li>
                    <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100">
                      <PiNoteBold />
                      Export Data
                    </li>
                  </ul>
                </div>
              )}
            </div>
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

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-lg text-red-600">Error loading customers</div>
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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

              <button className="button-oulined" onClick={() => setShowCategories(!showCategories)}>
                {showCategories ? "Hide Categories" : "Show Categories"}
              </button>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="button-oulined"
              >
                <option value="">All Regions</option>
                <option value="South">South</option>
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>

              <button className="button-oulined" type="button">
                <IoMdFunnel />
                <p>Sort By</p>
              </button>
            </div>
          </div>

          {/* Customer Display Area */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCustomers.map((customer: Customer) => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {filteredCustomers.map((customer: Customer) => (
                  <CustomerListItem key={customer.id} customer={customer} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p>Show rows</p>
              <select value={rowsPerPage} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                className={`px-3 py-2 ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"}`}
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <BiSolidLeftArrow />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`flex h-[27px] w-[30px] items-center justify-center rounded-md ${
                      currentPage === index + 1 ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                    }`}
                    onClick={() => changePage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className={`px-3 py-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <BiSolidRightArrow />
              </button>
            </div>
            <p>
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </p>
          </div>
        </div>

        {/* Customer Categories Sidebar */}
        <AnimatePresence initial={false}>
          {showCategories && (
            <motion.div
              key="categories-sidebar"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="w-80 rounded-md border bg-white p-5"
            >
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">Customer Categories</h2>
              </div>

              <div className="mt-4 space-y-3">
                {customerCategories.map((category, index) => (
                  <CategoryCard key={index} category={category} />
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 rounded-lg bg-gray-50 p-3">
                <h3 className="mb-2 font-medium text-gray-900">Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Residential:</span>
                    <span className="font-medium">106,150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commercial:</span>
                    <span className="font-medium">15,400</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Components - Only one modal can be open at a time */}
      <CustomerDetailsModal
        isOpen={activeModal === "details"}
        onRequestClose={closeAllModals}
        customer={selectedCustomer}
        onUpdateStatus={handleOpenStatusModal}
        onSendReminder={handleOpenReminderModal}
        onSuspendAccount={handleOpenSuspendModal}
      />

      <SuspendAccountModal
        isOpen={activeModal === "suspend"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmSuspend}
      />

      <SendReminderModal
        isOpen={activeModal === "reminder"}
        onRequestClose={closeAllModals}
        onConfirm={handleConfirmReminder}
      />

      <UpdateStatusModal
        isOpen={activeModal === "status"}
        onRequestClose={closeAllModals}
        customer={selectedCustomer}
      />
    </>
  )
}

export default AllCustomers
