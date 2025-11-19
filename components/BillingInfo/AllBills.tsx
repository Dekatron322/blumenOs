"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { MapIcon, UserIcon } from "components/Icons/Icons"
import { fetchPostpaidBills, setFilters, clearFilters, setPagination } from "lib/redux/postpaidSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

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
  name: string
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
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Get state from Redux store
  const { bills, loading, error, pagination, filters } = useAppSelector((state) => state.postpaidBilling)

  console.log("AllBills Redux State:", {
    billsCount: bills?.length,
    loading,
    error,
    pagination,
    filters,
  })

  // Fetch bills on component mount and when filters/pagination change
  useEffect(() => {
    console.log("AllBills useEffect triggered - fetching bills...")

    const fetchBills = async () => {
      const requestParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...filters,
      }

      console.log("AllBills Dispatching fetchPostpaidBills with params:", requestParams)

      const result = await dispatch(fetchPostpaidBills(requestParams))

      console.log("AllBills Fetch result:", result)

      if (fetchPostpaidBills.fulfilled.match(result)) {
        console.log("AllBills fetched successfully:", result.payload.data?.length)
      } else if (fetchPostpaidBills.rejected.match(result)) {
        console.error("AllBills failed to fetch bills:", result.error)
      }
    }

    fetchBills()
  }, [dispatch, pagination.currentPage, pagination.pageSize, filters])

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text)
    if (text.trim()) {
      dispatch(setFilters({ accountNumber: text.trim() }))
    } else {
      dispatch(clearFilters())
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(clearFilters())
  }

  // Transform API PostpaidBill data to component Bill format
  const transformApiBillsToTableBills = (): Bill[] => {
    if (!bills || bills.length === 0) {
      console.log("No API bills to transform")
      return []
    }

    console.log("Transforming API bills to table format, count:", bills.length)

    return bills.map((apiBill) => {
      // Determine status based on bill data
      let status: "Paid" | "Pending" | "Overdue" | "Cancelled" = "Pending"

      // Map your API status to component status
      if (apiBill.status === 1) status = "Paid"
      else if (apiBill.status === 2) status = "Pending"
      else if (apiBill.status === 3) status = "Overdue"
      else if (apiBill.status === 4) status = "Cancelled"

      // Determine customer type based on category
      let customerType: "Residential" | "Commercial" | "Industrial" = "Residential"
      if (apiBill.category === 1) customerType = "Residential"
      else if (apiBill.category === 2) customerType = "Commercial"
      else if (apiBill.category === 3) customerType = "Industrial"

      // Format amount
      const amount = `₦${(apiBill.totalDue || 0).toLocaleString()}`

      // Format consumption
      const consumption = `${apiBill.consumptionKwh || 0} kWh`

      // Use feeder name or area office as location
      const location = apiBill.feederName || apiBill.areaOfficeName || "Unknown"

      // Format dates - ensure we always return a string, never undefined
      const formatApiDate = (dateString?: string) => {
        try {
          const date = new Date(dateString ?? new Date())
          return date.toISOString().split("T")[0]
        } catch {
          return new Date().toISOString().split("T")[0]
        }
      }

      return {
        id: apiBill.id,
        customerName: apiBill.customerName || "Unknown Customer",
        accountNumber: apiBill.customerAccountNumber || "N/A",
        billingCycle: apiBill.period || "Unknown Period",
        name: apiBill.name || "Unnamed Bill",
        amount,
        status,
        dueDate: formatApiDate(apiBill.dueDate),
        issueDate: formatApiDate(apiBill.createdAt),
        customerType,
        location,
        consumption,
        tariff: `₦${apiBill.tariffPerKwh || 0}/kWh`,
      } as Bill
    })
  }

  const tableBills = transformApiBillsToTableBills()
  console.log("Transformed table bills:", tableBills)

  // Fallback data if no API data
  const fallbackBills: Bill[] = [
    {
      id: 1,
      customerName: "Fatima Hassan",
      accountNumber: "2301567890",
      billingCycle: "January 2024",
      name: "January, 2024",
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
      name: "January, 2024",
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
      name: "January, 2024",
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
      name: "January, 2024",
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
      name: "January, 2024",
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
      name: "January, 2024",
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

  // Only show fallback if no data and not loading
  const shouldShowFallback = !loading && tableBills.length === 0
  const displayBills = shouldShowFallback ? fallbackBills : tableBills

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
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "Invalid Date"
    }
  }

  const handleViewDetails = (bill: Bill) => {
    // Navigate to the bill details page
    router.push(`/billing/bills/${bill.id}`)

    // Still allow parent components to react if they provided a callback
    if (onViewBillDetails) {
      onViewBillDetails(bill)
    }
  }

  // Loading state
  if (loading && tableBills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-6"
      >
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">All Bills</h3>
              <div className="h-12 animate-pulse rounded-lg bg-gray-200"></div>
            </div>

            {/* Loading skeleton for table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {[...Array(9)].map((_, i) => (
                        <th key={i} className="whitespace-nowrap border-y p-4">
                          <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {[...Array(6)].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {[...Array(9)].map((_, colIndex) => (
                          <td key={colIndex} className="whitespace-nowrap border-b px-4 py-3">
                            <div className="h-3 animate-pulse rounded bg-gray-200"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-black bg-opacity-80 p-4 text-xs text-white">
          <div>API Bills: {bills?.length || 0}</div>
          <div>Table Bills: {tableBills.length}</div>
          <div>Loading: {loading ? "Yes" : "No"}</div>
          <div>Error: {error || "None"}</div>
          <div>Using: {shouldShowFallback ? "Fallback Data" : "API Data"}</div>
        </div>
      )}

      {/* Left Column - Bills Table */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">All Bills</h3>
            <SearchModule
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search customers, accounts, or locations..."
            />
            {error && (
              <div className="mt-2 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-600">Error loading bills: {error}</p>
              </div>
            )}
            {shouldShowFallback && (
              <div className="mt-2 rounded-lg bg-yellow-50 p-3">
                <p className="text-sm text-yellow-600">Showing sample data - no bills found</p>
              </div>
            )}
          </div>

          {/* Bills Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Customer</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Billing Cycle
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Amount</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Due Date</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">
                      Customer Type
                    </th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Location</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Consumption</th>
                    <th className="whitespace-nowrap border-b p-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {displayBills.map((bill, index) => (
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
                        <div>
                          <div className="font-medium">{bill.name}</div>
                          <div className="text-xs text-gray-500">{bill.billingCycle}</div>
                        </div>
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
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  dispatch(setPagination({ page: pagination.currentPage - 1, pageSize: pagination.pageSize }))
                }
                disabled={!pagination.hasPrevious}
                className={`rounded-md border px-3 py-1 text-sm ${
                  pagination.hasPrevious
                    ? "border-gray-300 hover:bg-gray-50"
                    : "cursor-not-allowed border-gray-200 text-gray-400"
                }`}
              >
                Previous
              </button>
              <span className="rounded-md bg-gray-900 px-3 py-1 text-sm text-white">{pagination.currentPage}</span>
              <button
                onClick={() =>
                  dispatch(setPagination({ page: pagination.currentPage + 1, pageSize: pagination.pageSize }))
                }
                disabled={!pagination.hasNext}
                className={`rounded-md border px-3 py-1 text-sm ${
                  pagination.hasNext
                    ? "border-gray-300 hover:bg-gray-50"
                    : "cursor-not-allowed border-gray-200 text-gray-400"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AllBills
