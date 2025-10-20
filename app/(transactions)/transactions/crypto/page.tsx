"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import InsightIcon from "public/insight-icon"
import IncomingIcon from "public/incoming-icon"
import OutgoingIcon from "public/outgoing-icon"
import UnresolvedTransactions from "public/unresolved-transactions"
import ArrowIcon from "public/arrow-icon"
import { useState } from "react"
import CryptoTransactionTable from "components/Tables/CryptoTransactionTable"

import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/24/outline"
import { useGetTransactionOverviewQuery } from "lib/redux/overviewSlice"

interface PaymentAccount {
  id: number
  src: any
  name: string
  balance: string
}

type TimeFilter = "allTime" | "today" | "thisWeek" | "thisMonth"

interface TransactionMetrics {
  count: number
  volume: number
}

interface CryptoTransactionData {
  buyCrypto: TransactionMetrics
  sellCrypto: TransactionMetrics
  total: TransactionMetrics
  incoming: TransactionMetrics
  outgoing: TransactionMetrics
}

const SkeletonRow = () => {
  return (
    <tr className="animate-pulse">
      {[...Array(8)].map((_, index) => (
        <td key={index} className="whitespace-nowrap border-b p-4">
          <div className={`h-4 rounded bg-gray-200 ${index % 2 === 0 ? "w-3/4" : "w-full"}`}></div>
        </td>
      ))}
    </tr>
  )
}

// Skeleton Loading Components
const SummaryCardSkeleton = () => (
  <div className="animate-pulse border-b-4 border-gray-300 bg-white p-6">
    <div className="mb-4 flex items-center justify-between">
      <div className="h-4 w-24 rounded bg-gray-300"></div>
      <div className="h-5 w-5 rounded bg-gray-300"></div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-gray-300"></div>
        <div className="h-6 w-12 rounded bg-gray-300"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-gray-300"></div>
        <div className="h-6 w-20 rounded bg-gray-300"></div>
      </div>
    </div>
  </div>
)

const BreakdownCardSkeleton = () => (
  <div className="animate-pulse rounded-md bg-white p-4">
    <div className="mb-2 border-b pb-2">
      <div className="h-3 w-16 rounded bg-gray-300"></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="h-5 w-8 rounded bg-gray-300"></div>
      <div className="h-4 w-16 rounded bg-gray-300"></div>
    </div>
  </div>
)

const TableSkeleton = () => {
  return (
    <div className="w-full overflow-x-auto border-l border-r bg-[#ffffff]">
      <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {[...Array(8)].map((_, index) => (
              <th key={index} className="whitespace-nowrap border-b p-4 text-sm">
                <div className="h-4 w-3/4 rounded bg-gray-300"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CryptoTransactions() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("allTime")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { data: transactionOverview, isLoading, isError } = useGetTransactionOverviewQuery()

  const getTimeFilterData = (): CryptoTransactionData => {
    if (!transactionOverview?.data) {
      return {
        buyCrypto: { count: 0, volume: 0 },
        sellCrypto: { count: 0, volume: 0 },
        total: { count: 0, volume: 0 },
        incoming: { count: 0, volume: 0 },
        outgoing: { count: 0, volume: 0 },
      }
    }

    const data = transactionOverview.data
    let buyCryptoCount = 0
    let buyCryptoVolume = 0
    let sellCryptoCount = 0
    let sellCryptoVolume = 0

    switch (timeFilter) {
      case "today":
        buyCryptoCount = data.buyCrypto_Today_Count
        buyCryptoVolume = data.buyCrypto_Today
        sellCryptoCount = data.sellCrypto_Today_Count
        sellCryptoVolume = data.sellCrypto_Today
        break
      case "thisWeek":
        buyCryptoCount = data.buyCrypto_ThisWeek_Count
        buyCryptoVolume = data.buyCrypto_ThisWeek
        sellCryptoCount = data.sellCrypto_ThisWeek_Count
        sellCryptoVolume = data.sellCrypto_ThisWeek
        break
      case "thisMonth":
        buyCryptoCount = data.buyCrypto_ThisMonth_Count
        buyCryptoVolume = data.buyCrypto_ThisMonth
        sellCryptoCount = data.sellCrypto_ThisMonth_Count
        sellCryptoVolume = data.sellCrypto_ThisMonth
        break
      default: // allTime
        buyCryptoCount = data.buyCrypto_AllTime_Count
        buyCryptoVolume = data.buyCrypto_AllTime
        sellCryptoCount = data.sellCrypto_AllTime_Count
        sellCryptoVolume = data.sellCrypto_AllTime
    }

    const totalCount = buyCryptoCount + sellCryptoCount
    const totalVolume = buyCryptoVolume + sellCryptoVolume

    return {
      buyCrypto: { count: buyCryptoCount, volume: buyCryptoVolume },
      sellCrypto: { count: sellCryptoCount, volume: sellCryptoVolume },
      total: { count: totalCount, volume: totalVolume },
      incoming: { count: buyCryptoCount, volume: buyCryptoVolume },
      outgoing: { count: sellCryptoCount, volume: sellCryptoVolume },
    }
  }

  const cryptoData = getTimeFilterData()

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today":
        return "Today"
      case "thisWeek":
        return "This Week"
      case "thisMonth":
        return "This Month"
      default:
        return "All Time"
    }
  }

  if (isLoading) {
    return (
      <section className="size-full">
        <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-col px-6 py-8">
              {/* Header Skeleton */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-64 animate-pulse rounded bg-gray-300"></div>
                </div>
                <div className="h-10 w-40 animate-pulse rounded bg-gray-300"></div>
              </div>

              {/* Summary Grid Skeleton */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
              </div>

              {/* Transaction Table Skeleton */}
              <TableSkeleton />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="size-full">
        <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex w-full flex-col">
            <DashboardNav />
            <div className="container mx-auto flex flex-col px-6 py-8">
              <div className="flex w-full items-center justify-center px-4 py-8">
                <div className="text-red-600">Error loading crypto transaction data</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col px-16 py-8 max-sm:px-3">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Crypto Transactions</h1>
                <p className="text-gray-600">Comprehensive overview of all crypto transactions</p>
              </div>

              {/* Time Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:border-gray-400"
                >
                  <CalendarIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">{getTimeFilterLabel()}</span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                    {(["today", "thisWeek", "thisMonth", "allTime"] as TimeFilter[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setTimeFilter(filter)
                          setIsFilterOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          timeFilter === filter ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                        } first:rounded-t-lg last:rounded-b-lg`}
                      >
                        {filter === "today" && "Today"}
                        {filter === "thisWeek" && "This Week"}
                        {filter === "thisMonth" && "This Month"}
                        {filter === "allTime" && "All Time"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Total Overview */}
              <div className="rounded-lg border-b-4 border-blue-500 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">TOTAL OVERVIEW</h3>
                  <InsightIcon />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className=" text-gray-500">Transactions</p>
                    <p className="text-xl font-semibold text-gray-900">{cryptoData.total.count.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className=" text-gray-500">Total Volume</p>
                    <p className="text-xl font-semibold text-gray-900">NGN {formatCurrency(cryptoData.total.volume)}</p>
                  </div>
                </div>
              </div>

              {/* Incoming (Buy Crypto) */}
              <div className="rounded-lg border-b-4 border-green-500 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">BUY CRYPTO</h3>
                  <IncomingIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className=" text-gray-500">Transactions</p>
                    <p className="text-xl font-semibold text-gray-900">{cryptoData.incoming.count.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className=" text-gray-500">Total Volume</p>
                    <p className="text-xl font-semibold text-gray-900">
                      NGN {formatCurrency(cryptoData.incoming.volume)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Outgoing (Sell Crypto) */}
              <div className="rounded-lg border-b-4 border-red-500 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">SELL CRYPTO</h3>
                  <OutgoingIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className=" text-gray-500">Transactions</p>
                    <p className="text-xl font-semibold text-gray-900">{cryptoData.outgoing.count.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className=" text-gray-500">Total Volume</p>
                    <p className="text-xl font-semibold text-gray-900">
                      NGN {formatCurrency(cryptoData.outgoing.volume)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Unresolved */}
              {/* <div className="rounded-lg border-b-4 border-yellow-500 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">UNRESOLVED</h3>
                  <UnresolvedTransactions />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className=" text-gray-500">Total</p>
                    <p className="text-xl font-semibold text-gray-900">0</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className=" text-gray-500">Total Volume</p>
                    <p className="text-xl font-semibold text-gray-900">NGN 0.00</p>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Crypto Transaction Table */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <CryptoTransactionTable />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
