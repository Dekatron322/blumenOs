"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { MapIcon, UserIcon } from "components/Icons/Icons"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface Bill {
  id: number
  customerName: string
  accountNumber: string
  billingCycle: string
  amount: string
  status: "Paid" | "Pending" | "Overdue" | "Cancelled"
  dueDate: string
  issueDate: string
  customerType: "Residential" | "Commercial" | "Industrial"
  location: string
  consumption: string
  tariff: string
}

interface AllBillsProps {
  onViewBillDetails?: (bill: Bill) => void
}

const AllBills: React.FC<AllBillsProps> = ({ onViewBillDetails }) => {
  const [searchText, setSearchText] = useState("")

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const bills: Bill[] = [
    {
      id: 1,
      customerName: "Fatima Hassan",
      accountNumber: "2301567890",
      billingCycle: "January 2024",
      amount: "₦425",
      status: "Paid",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Residential",
      location: "Lagos Island",
      consumption: "35 units",
      tariff: "Residential Tier 1",
    },
    {
      id: 2,
      customerName: "John Adebayo",
      accountNumber: "2301456789",
      billingCycle: "January 2024",
      amount: "₦250",
      status: "Pending",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Residential",
      location: "Ikeja",
      consumption: "25 units",
      tariff: "Residential Tier 1",
    },
    {
      id: 3,
      customerName: "Grace Okonkwo",
      accountNumber: "2301678901",
      billingCycle: "January 2024",
      amount: "₦187",
      status: "Overdue",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Commercial",
      location: "Surulere",
      consumption: "55 units",
      tariff: "Commercial Tier 2",
    },
    {
      id: 4,
      customerName: "Tech Solutions Ltd",
      accountNumber: "2301789012",
      billingCycle: "January 2024",
      amount: "₦1,250",
      status: "Paid",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Commercial",
      location: "Victoria Island",
      consumption: "230 units",
      tariff: "Commercial Tier 3",
    },
    {
      id: 5,
      customerName: "Michael Johnson",
      accountNumber: "2301890123",
      billingCycle: "January 2024",
      amount: "₦320",
      status: "Cancelled",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Residential",
      location: "Lekki",
      consumption: "30 units",
      tariff: "Residential Tier 1",
    },
    {
      id: 6,
      customerName: "Sarah Blumenthal",
      accountNumber: "2301901234",
      billingCycle: "January 2024",
      amount: "₦550",
      status: "Paid",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Industrial",
      location: "Ilupeju",
      consumption: "580 units",
      tariff: "Industrial Tier 1",
    },
  ]

  const getStatusStyle = (status: Bill["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-blue-100 text-blue-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      case "Cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCustomerTypeStyle = (type: Bill["customerType"]) => {
    switch (type) {
      case "Residential":
        return "bg-blue-100 text-blue-800"
      case "Commercial":
        return "bg-green-100 text-green-800"
      case "Industrial":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleViewDetails = (bill: Bill) => {
    if (onViewBillDetails) {
      onViewBillDetails(bill)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Bills Table */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">All Bills</h3>
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search customers, accounts, or locations..."
            />
          </div>

          {/* Bills Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">Customer</th>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                      Billing Cycle
                    </th>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">Amount</th>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">Due Date</th>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                      Customer Type
                    </th>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">Location</th>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">Consumption</th>
                    <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bills.map((bill, index) => (
                    <motion.tr
                      key={bill.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <UserIcon />
                          <div>
                            <div className="font-medium text-gray-900">{bill.customerName}</div>
                            <div className="text-xs text-gray-500">{bill.accountNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        {bill.billingCycle}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                        {bill.amount}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                            bill.status
                          )}`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        {formatDate(bill.dueDate)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCustomerTypeStyle(
                            bill.customerType
                          )}`}
                        >
                          {bill.customerType}
                        </span>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapIcon />
                          {bill.location}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">{bill.consumption}</div>
                          <div className="text-xs text-gray-500">{bill.tariff}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <button
                          onClick={() => handleViewDetails(bill)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing 1 to {bills.length} of {bills.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">Previous</button>
              <button className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white">1</button>
              <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AllBills
