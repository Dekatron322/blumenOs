import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import {
  AddAgentIcon,
  BillsIcon,
  CycleIcon,
  DateIcon,
  FloatIcon,
  MapIcon,
  PerformanceIcon,
  PhoneIcon,
  RateIcon,
  RevenueGeneratedIcon,
  RouteIcon,
  StatusIcon,
  TargetIcon,
  UserIcon,
} from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendors } from "lib/redux/vendorSlice"
import { ButtonModule } from "components/ui/Button/Button"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface Vendor {
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
  totalRevenue: string
  contactPerson: string
}

interface VendorManagementProps {
  onStartNewCycle?: () => void
}

const VendorManagement: React.FC<VendorManagementProps> = ({ onStartNewCycle }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { vendors: apiVendors, loading, error } = useAppSelector((state) => state.vendors)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")

  const handleCancelSearch = () => {
    setSearchText("")
    setSearchInput("")
  }

  const handleManualSearch = () => {
    const trimmed = searchInput.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
    }
  }

  useEffect(() => {
    dispatch(
      fetchVendors({
        pageNumber: 1,
        pageSize: 50,
      })
    )
  }, [dispatch])

  const mapStatus = (status: string, isSuspended: boolean): Vendor["status"] => {
    if (isSuspended) return "inactive"
    const normalized = status.toLowerCase()
    if (normalized.includes("inactive")) return "inactive"
    if (normalized.includes("low")) return "low stock"
    return "active"
  }

  const mappedVendors: Vendor[] = apiVendors.map((v) => ({
    id: v.id,
    name: v.name,
    status: mapStatus(v.status, v.isSuspended),
    phone: v.phoneNumber,
    location: [v.city, v.state].filter(Boolean).join(", "),
    dailySales: "₦0",
    transactionsToday: 0,
    stockBalance: "₦0",
    commissionRate: `${v.commission}%`,
    performance: "Good",
    businessType: "",
    totalRevenue: "₦0",
    contactPerson: v.employeeName,
  }))

  const vendors = mappedVendors.filter((vendor) => {
    if (!searchText) return true
    const q = searchText.toLowerCase()
    return (
      vendor.name.toLowerCase().includes(q) ||
      vendor.contactPerson.toLowerCase().includes(q) ||
      vendor.location.toLowerCase().includes(q)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "low stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "active"
      case "inactive":
        return "inactive"
      case "low stock":
        return "low stock"
      default:
        return status
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 md:flex-row"
    >
      {/* Left Column - Vendor Directory */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Vendor Directory</h3>
            <SearchModule
              placeholder="Search vendors..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onCancel={handleCancelSearch}
              onSearch={handleManualSearch}
            />
          </div>

          {/* Vendors List */}
          <div className="space-y-4">
            {loading && vendors.length === 0 && <p className="text-sm text-gray-500">Loading vendors...</p>}
            {!loading && error && vendors.length === 0 && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && vendors.length === 0 && <p className="text-sm text-gray-500">No vendors found.</p>}
            {vendors.map((vendor) => (
              <div key={vendor.id} className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 hover:shadow-sm">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <UserIcon />
                        <div>
                          <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                          <p className="text-sm text-gray-500">Contact: {vendor.contactPerson}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(vendor.status)}`}>
                        {getStatusText(vendor.status)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex items-center gap-1">
                        <PhoneIcon />
                        <p className="mt-1 text-sm text-gray-600">{vendor.phone}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapIcon />
                        <p className="text-sm text-gray-600">{vendor.location}</p>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-2 max-sm:hidden">
                      <p className="text-sm text-gray-500">Business Type:</p>
                      <p className="text-sm font-medium text-gray-700">{vendor.businessType}</p>
                    </div>
                  </div>

                  <div className="w-full text-sm max-sm:flex max-sm:justify-between md:text-right">
                    <div>
                      <p className="font-semibold text-gray-900">{vendor.dailySales}</p>
                      <p className="text-gray-500">{vendor.transactionsToday} transactions today</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Total Revenue</p>
                      <p className="font-semibold text-blue-600">{vendor.totalRevenue}</p>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="mt-3 flex flex-col gap-3 border-t pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-4 max-sm:hidden sm:flex-1 sm:flex-row sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <BillsIcon />
                        <p className="text-gray-500">Stock Balance:</p>
                      </div>
                      <p className={`font-medium ${vendor.status === "low stock" ? "text-red-600" : "text-green-600"}`}>
                        {vendor.stockBalance}
                      </p>
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <RateIcon />
                        <div>
                          <p className="text-gray-500">Commission Rate:</p>
                          <p className="font-medium text-green-600">{vendor.commissionRate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <PerformanceIcon />
                      <div>
                        <p className="text-gray-500">Performance:</p>
                        <p
                          className={`font-medium ${
                            vendor.performance === "Excellent"
                              ? "text-green-600"
                              : vendor.performance === "Good"
                              ? "text-blue-600"
                              : vendor.performance === "Average"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {vendor.performance}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={() => router.push(`/vendor-management/vendor-detail/${vendor.id}`)}
                  >
                    View details
                  </ButtonModule>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 font-semibold">Vendor Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-gray-500">Total Vendors</p>
                <p className="font-semibold">{vendors.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Active</p>
                <p className="font-semibold text-green-600">{vendors.filter((v) => v.status === "active").length}</p>
              </div>
              <div>
                <p className="text-gray-500">Low Stock</p>
                <p className="font-semibold text-red-600">{vendors.filter((v) => v.status === "low stock").length}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Daily Sales</p>
                <p className="font-semibold">₦0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VendorManagement
