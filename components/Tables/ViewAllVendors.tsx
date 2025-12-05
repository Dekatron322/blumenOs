"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxDotsVertical } from "react-icons/rx"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { IoMdFunnel } from "react-icons/io"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { VscEye } from "react-icons/vsc"
import { ExportCsvIcon, MapIcon, PhoneIcon, UserIcon } from "components/Icons/Icons"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendors } from "lib/redux/vendorSlice"
import { ChevronDown } from "lucide-react"

interface VendorUI {
  id: number
  name: string
  status: "active" | "inactive" | "low stock"
  phone: string
  location: string
  dailySales: string
  transactionsToday: number
  stockBalance: string
  commissionRate: string
  performance: "Excellent" | "Good" | "Average" | "Poor"
  businessType: string
  contactPerson: string
  totalRevenue: string
}

// Skeleton Components
const VendorCardSkeleton = () => (
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

    <div className="mt-4 space-y-2 text-sm">
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

const VendorListItemSkeleton = () => (
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

const ActionDropdown: React.FC<{ vendor: VendorUI; onViewDetails: (vendor: VendorUI) => void }> = ({
  vendor,
  onViewDetails,
}) => {
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
    onViewDetails(vendor)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef} data-dropdown-root="vendor-actions">
      <motion.div
        className="flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RxDotsVertical />
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="py-1">
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Details
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Edit vendor:", vendor.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Edit Vendor
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Manage stock:", vendor.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Manage Stock
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const AllVendors: React.FC = () => {
  const router = useRouter()
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedBusinessType, setSelectedBusinessType] = useState("")
  const [isBusinessTypeOpen, setIsBusinessTypeOpen] = useState(false)

  const dispatch = useAppDispatch()
  const { vendors, loading: isLoading, error, pagination } = useAppSelector((state) => state.vendors)

  const pageSize = pagination.pageSize || 10

  useEffect(() => {
    void dispatch(
      fetchVendors({
        pageNumber: currentPage,
        pageSize,
        search: searchText || undefined,
      })
    )
  }, [dispatch, currentPage, pageSize, searchText])

  const totalRecords = pagination.totalCount || vendors.length
  const totalPages = pagination.totalPages || Math.ceil((vendors.length || 1) / pageSize)

  const uiVendors: VendorUI[] = vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    status: vendor.isSuspended ? "inactive" : "active",
    phone: vendor.phoneNumber,
    location: `${vendor.city || ""}${vendor.state ? ", " + vendor.state : ""}`.trim(),
    dailySales: "-",
    transactionsToday: 0,
    stockBalance: "-",
    commissionRate: `${vendor.commission}%`,
    performance: "Good",
    businessType: "Vendor",
    contactPerson: vendor.employeeName || "-",
    totalRevenue: "-",
  }))

  const getStatusStyle = (status: VendorUI["status"]) => {
    switch (status) {
      case "active":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "inactive":
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
      case "low stock":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  const getPerformanceStyle = (performance: VendorUI["performance"]) => {
    switch (performance) {
      case "Excellent":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "Good":
        return { backgroundColor: "#F0F7FF", color: "#003F9F" }
      case "Average":
        return { backgroundColor: "#FEF6E6", color: "#D97706" }
      case "Poor":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F3F4F6", color: "#6B7280" }
    }
  }

  const dotStyle = (status: VendorUI["status"]) => {
    return {
      backgroundColor: status === "active" ? "#589E67" : status === "inactive" ? "#6B7280" : "#AF4B4B",
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleAddVendorSuccess = async () => {
    setIsAddVendorModalOpen(false)
  }

  const handleViewVendorDetails = (vendor: VendorUI) => {
    router.push(`/vendor-management/vendor-detail/${vendor.id}`)
  }

  // CSV Export functionality
  const exportToCSV = () => {
    if (!uiVendors || uiVendors.length === 0) {
      alert("No vendor data to export")
      return
    }

    const headers = [
      "ID",
      "Vendor Name",
      "Status",
      "Phone",
      "Location",
      "Daily Sales",
      "Transactions Today",
      "Stock Balance",
      "Commission Rate",
      "Performance",
      "Business Type",
      "Contact Person",
      "Total Revenue",
    ]

    const csvRows = uiVendors.map((vendor) => [
      vendor.id.toString(),
      `"${vendor.name.replace(/"/g, '""')}"`,
      vendor.status,
      `"${vendor.phone}"`,
      `"${vendor.location}"`,
      `"${vendor.dailySales}"`,
      vendor.transactionsToday.toString(),
      `"${vendor.stockBalance}"`,
      `"${vendor.commissionRate}"`,
      vendor.performance,
      vendor.businessType,
      `"${vendor.contactPerson}"`,
      `"${vendor.totalRevenue}"`,
    ])

    const csvContent = [headers, ...csvRows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `vendors_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const businessTypes = ["Retail", "Wholesale", "Service", "Manufacturing", "Distribution"]

  const filteredVendors = uiVendors.filter((vendor) => {
    const matchesSearch =
      searchText === "" ||
      Object.values(vendor).some((value) => value?.toString().toLowerCase().includes(searchText.toLowerCase()))
    const matchesBusinessType =
      selectedBusinessType === "" || vendor.businessType?.toLowerCase().includes(selectedBusinessType.toLowerCase())
    return matchesSearch && matchesBusinessType
  })

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      fetchVendors({
        pageNumber: 1,
        pageSize: newPageSize,
      })
    )
    setCurrentPage(1)
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const VendorCard = ({ vendor }: { vendor: VendorUI }) => (
    <div className="mt-3 rounded-lg border bg-[#f9f9f9] p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
            <UserIcon />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div
                style={getStatusStyle(vendor.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(vendor.status)}></span>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </div>
              <div style={getPerformanceStyle(vendor.performance)} className="rounded-full px-2 py-1 text-xs">
                {vendor.performance}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Contact:</span>
          <span className="font-medium">{vendor.contactPerson}</span>
        </div>
        <div className="flex justify-between">
          <span>Phone:</span>
          <span className="font-medium">{vendor.phone}</span>
        </div>
        <div className="flex justify-between">
          <span>Location:</span>
          <span className="font-medium">{vendor.location}</span>
        </div>
        <div className="flex justify-between">
          <span>Commission:</span>
          <span className="font-medium">{vendor.commissionRate}</span>
        </div>
        <div className="flex justify-between">
          <span>Business Type:</span>
          <span className="font-medium">{vendor.businessType}</span>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Daily Sales:</span>
          <span className="font-semibold">{vendor.dailySales}</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleViewVendorDetails(vendor)}
          className="button-oulined flex flex-1 items-center justify-center gap-2 bg-white transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#f9f9f9]"
        >
          <VscEye className="size-4" />
          View Details
        </button>
        <ActionDropdown vendor={vendor} onViewDetails={handleViewVendorDetails} />
      </div>
    </div>
  )

  const VendorListItem = ({ vendor }: { vendor: VendorUI }) => (
    <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
            <UserIcon />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">{vendor.name}</h3>
              <div
                style={getStatusStyle(vendor.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(vendor.status)}></span>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </div>
              <div style={getPerformanceStyle(vendor.performance)} className="rounded-full px-2 py-1 text-xs">
                {vendor.performance}
              </div>
              <div className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                Commission: {vendor.commissionRate}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <PhoneIcon />
                <strong>Phone:</strong> {vendor.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapIcon />
                <strong>Location:</strong> {vendor.location}
              </span>
              <span>
                <strong>Contact:</strong> {vendor.contactPerson}
              </span>
              <span>
                <strong>Business Type:</strong> {vendor.businessType}
              </span>
            </div>
            <div className="mt-2 flex gap-4 text-sm text-gray-500">
              <span>Daily Sales: {vendor.dailySales}</span>
              <span>Transactions: {vendor.transactionsToday}</span>
              <span>Stock: {vendor.stockBalance}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">Revenue: {vendor.totalRevenue}</div>
            <div className="mt-1 text-xs text-gray-500">{vendor.businessType}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleViewVendorDetails(vendor)} className="button-oulined flex items-center gap-2">
              <VscEye className="size-4" />
              View
            </button>
            <ActionDropdown vendor={vendor} onViewDetails={handleViewVendorDetails} />
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content Skeleton */}
        <div className="w-full rounded-md border bg-white p-5">
          <HeaderSkeleton />

          {/* Vendor Display Area Skeleton */}
          <div className="w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <VendorCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {[...Array(5)].map((_, index) => (
                  <VendorListItemSkeleton key={index} />
                ))}
              </div>
            )}
          </div>

          <PaginationSkeleton />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-3 relative mt-5 flex items-start gap-6">
        {/* Main Content - Vendors List/Grid */}
        <div className="w-full rounded-md border bg-white p-5">
          <div className="flex flex-col py-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-2xl font-medium">All Vendors</p>
              <div className="flex items-center gap-3">
                <button
                  className="button-oulined flex items-center gap-2 border-[#2563EB] bg-[#DBEAFE] hover:border-[#2563EB] hover:bg-[#DBEAFE]"
                  onClick={exportToCSV}
                  disabled={!uiVendors || uiVendors.length === 0}
                >
                  <ExportCsvIcon color="#2563EB" size={20} />
                  <p className="text-sm text-[#2563EB]">Export CSV</p>
                </button>
              </div>
            </div>
            <div className="mt-2 flex gap-4">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search by name, phone, or location"
                className="max-w-[300px]"
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

              <div className="relative" data-dropdown-root="business-type-filter">
                <button
                  type="button"
                  className="button-oulined flex items-center gap-2"
                  onClick={() => setIsBusinessTypeOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isBusinessTypeOpen}
                >
                  <IoMdFunnel />
                  <span>{selectedBusinessType || "All Business Types"}</span>
                  <ChevronDown
                    className={`size-4 text-gray-500 transition-transform ${isBusinessTypeOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isBusinessTypeOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                          selectedBusinessType === "" ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedBusinessType("")
                          setIsBusinessTypeOpen(false)
                        }}
                      >
                        All Business Types
                      </button>
                      {businessTypes.map((type) => (
                        <button
                          key={type}
                          className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50 ${
                            selectedBusinessType === type ? "bg-gray-50" : ""
                          }`}
                          onClick={() => {
                            setSelectedBusinessType(type)
                            setIsBusinessTypeOpen(false)
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Display Area */}
          <div className="w-full">
            {filteredVendors.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No vendors found</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVendors.map((vendor: VendorUI) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {filteredVendors.map((vendor: VendorUI) => (
                  <VendorListItem key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <p>Show rows</p>
              <select value={pageSize} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
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
      </div>

      <AddAgentModal
        isOpen={isAddVendorModalOpen}
        onRequestClose={() => setIsAddVendorModalOpen(false)}
        onSuccess={handleAddVendorSuccess}
      />
    </>
  )
}

export default AllVendors
