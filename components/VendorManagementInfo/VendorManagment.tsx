import React, { useState } from "react"
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
  const [searchText, setSearchText] = useState("")

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const vendors: Vendor[] = [
    {
      id: 1,
      name: "Buy Power",
      status: "active",
      phone: "+234801234567",
      location: "Lagos Island",
      dailySales: "₦12,500",
      transactionsToday: 45,
      stockBalance: "₦8,500",
      commissionRate: "2.5%",
      performance: "Excellent",
      businessType: "Energy Retailer",
      totalRevenue: "₦2.4M",
      contactPerson: "Mr. Johnson Ade",
    },
    {
      id: 2,
      name: "Blumentech",
      status: "active",
      phone: "+234802345678",
      location: "Ikeja",
      dailySales: "₦9,800",
      transactionsToday: 38,
      stockBalance: "₦12,000",
      commissionRate: "2.5%",
      performance: "Good",
      businessType: "Tech Solutions",
      totalRevenue: "₦1.8M",
      contactPerson: "Ms. Sarah Blume",
    },
    {
      id: 3,
      name: "PowerVend",
      status: "low stock",
      phone: "+234803456789",
      location: "Surulere",
      dailySales: "₦7,500",
      transactionsToday: 28,
      stockBalance: "₦4,500",
      commissionRate: "2%",
      performance: "Good",
      businessType: "Vending Services",
      totalRevenue: "₦1.2M",
      contactPerson: "Mr. James Okafor",
    },
    {
      id: 4,
      name: "EnergyPlus",
      status: "active",
      phone: "+234804567890",
      location: "Victoria Island",
      dailySales: "₦15,200",
      transactionsToday: 52,
      stockBalance: "₦15,000",
      commissionRate: "3%",
      performance: "Excellent",
      businessType: "Energy Distribution",
      totalRevenue: "₦3.1M",
      contactPerson: "Dr. Fatima Bello",
    },
    {
      id: 5,
      name: "TechVendors",
      status: "inactive",
      phone: "+234805678901",
      location: "Yaba",
      dailySales: "₦0",
      transactionsToday: 0,
      stockBalance: "₦2,000",
      commissionRate: "2%",
      performance: "Average",
      businessType: "Technology Retail",
      totalRevenue: "₦850K",
      contactPerson: "Mr. Chinedu Nwosu",
    },
    {
      id: 6,
      name: "SmartEnergy",
      status: "active",
      phone: "+234806789012",
      location: "Lekki",
      dailySales: "₦18,300",
      transactionsToday: 61,
      stockBalance: "₦20,000",
      commissionRate: "3.5%",
      performance: "Excellent",
      businessType: "Smart Meter Solutions",
      totalRevenue: "₦4.2M",
      contactPerson: "Ms. Amina Yusuf",
    },
  ]

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
      className="flex gap-6"
    >
      {/* Left Column - Vendor Directory */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Vendor Directory</h3>
            <SearchModule
              placeholder="Search vendors..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
            />
          </div>

          {/* Vendors List */}
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 hover:shadow-sm">
                <div className="flex w-full items-start justify-between gap-3">
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

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <PhoneIcon />
                        <p className="mt-1 text-sm text-gray-600">{vendor.phone}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapIcon />
                        <p className="text-sm text-gray-600">{vendor.location}</p>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm text-gray-500">Business Type:</p>
                      <p className="text-sm font-medium text-gray-700">{vendor.businessType}</p>
                    </div>
                  </div>

                  <div className="text-right text-sm">
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
                <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
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
                <p className="font-semibold">₦62,800</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VendorManagement
