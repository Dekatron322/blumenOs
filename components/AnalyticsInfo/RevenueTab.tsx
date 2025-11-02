import React, { useState } from "react"
import { motion } from "framer-motion"
import SearchInput from "components/Search/SearchInput"
import Pagination from "components/Pagination/Pagination"
import FinanceChart from "components/Chart/FinanceChart"

// Types
interface RevenueData {
  id: string
  period: string
  totalRevenue: number
  prepaidRevenue: number
  postpaidRevenue: number
  collectionRate: number
  outstandingAmount: number
  customerCount: number
  averageBill: number
  growthRate: number
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
const mockRevenueData: RevenueData[] = [
  {
    id: "REV-001",
    period: "January 2024",
    totalRevenue: 25000000,
    prepaidRevenue: 15000000,
    postpaidRevenue: 10000000,
    collectionRate: 95.5,
    outstandingAmount: 1200000,
    customerCount: 1500,
    averageBill: 16667,
    growthRate: 12.5,
  },
  {
    id: "REV-002",
    period: "February 2024",
    totalRevenue: 27500000,
    prepaidRevenue: 16500000,
    postpaidRevenue: 11000000,
    collectionRate: 96.2,
    outstandingAmount: 1050000,
    customerCount: 1520,
    averageBill: 18092,
    growthRate: 10.0,
  },
  {
    id: "REV-003",
    period: "March 2024",
    totalRevenue: 30000000,
    prepaidRevenue: 18000000,
    postpaidRevenue: 12000000,
    collectionRate: 97.1,
    outstandingAmount: 890000,
    customerCount: 1550,
    averageBill: 19355,
    growthRate: 9.1,
  },
]

const RevenueTab: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [_selectedPeriod, _setSelectedPeriod] = useState<RevenueData | null>(null)
  const pageSize = 10

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const revenueData = mockRevenueData
  const totalRecords = revenueData.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const getGrowthRateStyle = (rate: number) => {
    if (rate > 0) {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    } else {
      return {
        backgroundColor: "#F7EDED",
        color: "#AF4B4B",
      }
    }
  }

  const getCollectionRateStyle = (rate: number) => {
    if (rate >= 95) {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    } else if (rate >= 90) {
      return {
        backgroundColor: "#FEF6E6",
        color: "#D97706",
      }
    } else {
      return {
        backgroundColor: "#F7EDED",
        color: "#AF4B4B",
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

  const filteredRevenueData = revenueData.filter((data) =>
    data.period.toLowerCase().includes(searchText.toLowerCase())
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
        <div className="text-center">
          <p className="text-gray-500">Failed to load revenue data</p>
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
      className="space-y-6"
    >
      {/* Revenue Chart */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <p className="text-sm text-gray-500">Monthly revenue performance over time</p>
        </div>
        <div className="h-80">
          <FinanceChart />
        </div>
      </div>

      {/* Revenue Table */}
      <div className="rounded-lg border bg-white p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <p className="text-sm text-gray-500">Detailed revenue breakdown by period</p>
          </div>
          <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search periods..."
            value={searchText}
            onChange={handleSearch}
            className="w-80"
          />
            <button className="rounded-md bg-[#0a0a0a] px-4 py-2 text-white hover:bg-[#000000]">
              Export Report
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Prepaid Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Postpaid Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Collection Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Growth Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRevenueData.map((data) => (
                <tr key={data.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{data.period}</div>
                    <div className="text-sm text-gray-500">{data.customerCount} customers</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ₦{data.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Avg: ₦{data.averageBill.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      ₦{data.prepaidRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {((data.prepaidRevenue / data.totalRevenue) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      ₦{data.postpaidRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {((data.postpaidRevenue / data.totalRevenue) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                      style={getCollectionRateStyle(data.collectionRate)}
                    >
                      {data.collectionRate.toFixed(1)}%
                    </span>
                    <div className="text-sm text-gray-500">
                      Outstanding: ₦{data.outstandingAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                      style={getGrowthRateStyle(data.growthRate)}
                    >
                      {data.growthRate > 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button className="rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200">
                        View Details
                      </button>
                      <button className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                        Export
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
      </div>
    </motion.div>
  )
}

export default RevenueTab
