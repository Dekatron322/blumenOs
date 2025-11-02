import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"

// Types
interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  meterId: string
  accountType: "residential" | "commercial" | "industrial"
  status: "active" | "inactive" | "suspended"
  registrationDate: string
  lastPayment: string
  balance: number
}

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
                <div className="mt-1 h-3 w-24 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 rounded bg-gray-200"></div>
              <div className="h-8 w-16 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+234 801 234 5678",
    address: "123 Kaduna Central, Kaduna",
    meterId: "MTR-001",
    accountType: "residential",
    status: "active",
    registrationDate: "2023-01-15",
    lastPayment: "2024-01-15",
    balance: 0,
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+234 802 345 6789",
    address: "456 Barnawa, Kaduna",
    meterId: "MTR-002",
    accountType: "commercial",
    status: "active",
    registrationDate: "2023-02-20",
    lastPayment: "2024-01-10",
    balance: 1500,
  },
  {
    id: "CUST-003",
    name: "ABC Industries Ltd",
    email: "contact@abcindustries.com",
    phone: "+234 803 456 7890",
    address: "789 Industrial Area, Kaduna",
    meterId: "MTR-003",
    accountType: "industrial",
    status: "suspended",
    registrationDate: "2023-03-10",
    lastPayment: "2023-12-15",
    balance: 5000,
  },
]

const CustomersTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedCustomer, _setSelectedCustomer] = useState<Customer | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const customers = mockCustomers
  const totalRecords = customers.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getStatusStyle = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "inactive":
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      case "suspended":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getAccountTypeStyle = (type: Customer["accountType"]) => {
    switch (type) {
      case "residential":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "commercial":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      case "industrial":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const _toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.phone.includes(searchText) ||
    customer.address.toLowerCase().includes(searchText.toLowerCase())
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load customers data</p>
          <button className="mt-2 text-blue-600 hover:underline">Try again</button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border bg-white p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Management</h3>
          <p className="text-sm text-gray-500">Manage customer accounts and information</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search customers..."
            value={searchText}
            onChange={handleSearch}
            className="w-80"
          />
          <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">
            Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Customer Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Contact Information
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Account Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-medium text-blue-600">
                          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500">ID: {customer.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                  <div className="text-sm text-gray-500">{customer.address}</div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getAccountTypeStyle(customer.accountType)}
                  >
                    {customer.accountType.charAt(0).toUpperCase() + customer.accountType.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    style={getStatusStyle(customer.status)}
                  >
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className={`text-sm font-medium ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₦{customer.balance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Last payment: {customer.lastPayment}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
                      View
                    </button>
                    <button className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRecords={totalRecords}
          pageSize={pageSize}
        />
      </div>
    </motion.div>
  )
}

export default CustomersTab
