"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { useAppDispatch } from "lib/hooks/useRedux"
import { RootState } from "lib/redux/store"
import { motion } from "framer-motion"
import {
  AlertIcon,
  CollectCash,
  CollectionIcon,
  PerformanceIcon,
  TargetIcon,
  VendingIcon,
  VendingIconOutline,
} from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import { formatCurrency } from "utils/formatCurrency"
import { AgentDailyPerformance, TimeRange } from "lib/redux/agentSlice"
import { getPaymentsSummary } from "lib/redux/customersDashboardSlice"

// Chart Component for Agent Performance
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import CustomerPaymentHistoryTable from "components/Tables/CustomerPaymentHistoryTable"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"

// Date utilities
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })
}

const formatMonth = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-NG", { month: "short" })
}

const getLast365Days = () => {
  const dates = []
  for (let i = 364; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }
  return dates
}

const getStartAndEndOfYear = () => {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const endOfYear = new Date(now.getFullYear(), 11, 31)

  return {
    startUtc: startOfYear.toISOString(),
    endUtc: endOfYear.toISOString(),
  }
}

// Payment summary range options
type PaymentSummaryRange =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "all_time"

const paymentSummaryRanges: { value: PaymentSummaryRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" },
]

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
          initial={{ opacity: 0.8 }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
            <div className="size-6 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Skeleton for Performance Chart
const ChartSkeleton = () => {
  return (
    <div className="w-full rounded-lg border bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        <div className="h-10 w-32 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
      </div>
      <div className="h-64 w-full animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] sm:h-80"></div>
      <div className="mt-4 flex justify-center gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
          ></div>
        ))}
      </div>
    </div>
  )
}

// Enhanced Skeleton for Customer Categories
const CategoriesSkeleton = () => {
  return (
    <div className="w-full rounded-md border bg-white p-5 lg:w-80">
      <div className="border-b pb-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
      </div>

      <div className="mt-4 space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                <div className="h-5 w-20 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-6 rounded-lg bg-gray-50 p-3">
        <div className="mb-2 h-5 w-20 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
              <div className="h-4 w-12 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Skeleton for the table and grid view
const TableSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="h-8 w-40 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] sm:w-80"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] max-sm:w-20"
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="rounded-lg border bg-white p-4 shadow-sm"
            initial={{ opacity: 0.8 }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.1,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                <div>
                  <div className="h-5 w-32 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                  <div className="mt-1 flex gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                    <div className="h-6 w-20 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                  </div>
                </div>
              </div>
              <div className="size-6 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>

            <div className="mt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="h-4 w-full animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
          <div className="h-8 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="size-7 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
              ></div>
            ))}
          </div>
          <div className="size-8 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
        </div>

        <div className="h-4 w-24 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
      </div>
    </div>
  )
}

// Skeleton for Customer Payment History Table
const CustomerPaymentHistoryTableSkeleton = () => {
  return (
    <div className="w-full rounded-lg border bg-white p-4 shadow-sm">
      {/* Header Skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="mb-4 grid grid-cols-6 gap-4 border-b pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 gap-4 border-b pb-3">
            {[...Array(6)].map((_, colIndex) => (
              <div key={colIndex} className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
          ))}
        </div>
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// Skeleton for Customer Vending Table
const CustomerVendingSkeleton = () => {
  return (
    <div className="w-full rounded-lg border bg-white p-4 shadow-sm">
      {/* Header Skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
        <div className="flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Table Header Skeleton */}
      <div className="mb-4 grid grid-cols-7 gap-4 border-b pb-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-4 border-b pb-3">
            {[...Array(7)].map((_, colIndex) => (
              <div key={colIndex} className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
          ))}
        </div>
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// Skeleton for Payment Summary Section
const PaymentSummarySkeleton = () => {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Loading Component
const LoadingState = ({ showCategories = true }: { showCategories?: boolean }) => {
  return (
    <div className="relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
      {showCategories ? (
        <>
          <TableSkeleton />
          <CategoriesSkeleton />
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

// Performance Chart Component
interface PerformanceChartProps {
  data: AgentDailyPerformance[]
  chartType: "score" | "collections" | "clearances"
  timeRange: "year" | "month" | "week"
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, chartType, timeRange }) => {
  // Process data for chart display
  const processedData = data
    .map((item) => ({
      ...item,
      formattedDate: timeRange === "year" ? formatMonth(item.date) : formatDate(item.date),
      dateObj: new Date(item.date),
    }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981" // Green for excellent
    if (score >= 60) return "#3B82F6" // Blue for good
    if (score >= 40) return "#F59E0B" // Amber for average
    if (score >= 20) return "#EF4444" // Red for poor
    return "#6B7280" // Gray for very poor
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Date: {new Date(data.date).toLocaleDateString("en-NG", { dateStyle: "medium" })}
          </p>
          {chartType === "score" && (
            <>
              <p className="mt-2">
                Score: <span className="font-semibold">{data.score}</span>
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-2 w-full rounded-full bg-gray-200"
                  style={{
                    background: `linear-gradient(to right, #EF4444 0%, #F59E0B 40%, #3B82F6 70%, #10B981 100%)`,
                  }}
                >
                  <div
                    className="h-2 rounded-full bg-gray-900"
                    style={{ width: `${Math.min(Math.max(data.score, 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </>
          )}
          {chartType === "collections" && (
            <p className="mt-2">
              Amount Collected:{" "}
              <span className="font-semibold text-green-600">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(data.collectedAmount)}
              </span>
            </p>
          )}
          {chartType === "clearances" && (
            <>
              <p className="mt-2">
                Conditional Clearances:{" "}
                <span className="font-semibold text-amber-600">{data.conditionalClearances}</span>
              </p>
              <p>
                Declined Clearances: <span className="font-semibold text-red-600">{data.declinedClearances}</span>
              </p>
            </>
          )}
          <p className="mt-2">
            Issues: <span className="font-semibold text-red-600">{data.issueCount}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Define what data to show based on chartType
  const chartConfig = {
    score: {
      dataKey: "score",
      name: "Performance Score",
      color: "#3B82F6",
      strokeColor: "#2563EB",
      gradientId: "scoreGradient",
      yAxisLabel: "Score (0-100)",
    },
    collections: {
      dataKey: "collectedAmount",
      name: "Collections (₦)",
      color: "#10B981",
      strokeColor: "#059669",
      gradientId: "collectionsGradient",
      yAxisLabel: "Amount (₦)",
    },
    clearances: {
      dataKey: (data: any) => data.conditionalClearances + data.declinedClearances,
      name: "Clearance Issues",
      color: "#EF4444",
      strokeColor: "#DC2626",
      gradientId: "clearancesGradient",
      yAxisLabel: "Count",
    },
  }

  const config = chartConfig[chartType]

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={processedData}
          margin={{
            top: 10,
            right: 24,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="formattedDate"
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            label={{
              value: config.yAxisLabel,
              angle: -90,
              position: "insideLeft",
              offset: -10,
              style: { textAnchor: "middle", fontSize: 11, fill: "#6B7280" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey={config.dataKey as any}
            name={config.name}
            stroke={config.strokeColor}
            fill={config.strokeColor}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Performance Summary Cards Component
interface PerformanceSummaryProps {
  data: AgentDailyPerformance[]
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="text-gray-500">No performance data available</p>
      </div>
    )
  }

  // Calculate statistics
  const totalScore = data.reduce((sum, item) => sum + item.score, 0)
  const averageScore = totalScore / data.length
  const totalCollections = data.reduce((sum, item) => sum + item.collectedAmount, 0)
  const totalIssues = data.reduce((sum, item) => sum + item.conditionalClearances + item.declinedClearances, 0)
  const totalDays = data.length
  const daysWithIssues = data.filter((item) => item.issueCount > 0).length

  // Find best and worst days
  const bestDay = [...data].sort((a, b) => b.score - a.score)[0]
  const worstDay = [...data].sort((a, b) => a.score - b.score)[0]
  const highestCollectionDay = [...data].sort((a, b) => b.collectedAmount - a.collectedAmount)[0]

  // Get performance trend (last 7 days vs previous 7 days)
  const last7Days = data.slice(-7)
  const previous7Days = data.slice(-14, -7)
  const last7DaysAvg = last7Days.reduce((sum, item) => sum + item.score, 0) / (last7Days.length || 1)
  const previous7DaysAvg = previous7Days.reduce((sum, item) => sum + item.score, 0) / (previous7Days.length || 1)
  const trend = last7DaysAvg - previous7DaysAvg

  function getScoreColor(averageScore: number): import("csstype").Property.BackgroundColor | undefined {
    if (averageScore >= 80) return "#10B981" // Green for excellent
    if (averageScore >= 60) return "#3B82F6" // Blue for good
    if (averageScore >= 40) return "#F59E0B" // Amber for average
    if (averageScore >= 20) return "#EF4444" // Red for poor
    return "#6B7280" // Gray for very poor / no data
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Average Score Card */}
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
        <div className="absolute -right-2 -top-2 size-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 opacity-50 transition-opacity group-hover:opacity-75"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <PerformanceIcon />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
            </div>
            <div className="mt-3 flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}</p>
              <p className="ml-2 text-sm text-gray-500">/100</p>
            </div>
          </div>
          <div
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              averageScore >= 80
                ? "bg-green-100 text-green-800"
                : averageScore >= 60
                ? "bg-blue-100 text-blue-800"
                : averageScore >= 40
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {averageScore >= 80
              ? "Excellent"
              : averageScore >= 60
              ? "Good"
              : averageScore >= 40
              ? "Average"
              : "Needs Improvement"}
          </div>
        </div>
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(Math.max(averageScore, 0), 100)}%`,
                backgroundColor: getScoreColor(averageScore),
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Total Collections Card */}
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-green-200 hover:shadow-lg">
        <div className="absolute -right-2 -top-2 size-16 rounded-full bg-gradient-to-br from-green-50 to-green-100 opacity-50 transition-opacity group-hover:opacity-75"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-green-100 p-2">
                <CollectionIcon />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Collections</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalCollections)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Avg:{" "}
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalCollections / (totalDays || 1))}
              /day
            </p>
          </div>
          <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">{totalDays} days</div>
        </div>
      </div>

      {/* Issues Summary Card */}
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-red-200 hover:shadow-lg">
        <div className="absolute -right-2 -top-2 size-16 rounded-full bg-gradient-to-br from-red-50 to-red-100 opacity-50 transition-opacity group-hover:opacity-75"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-red-100 p-2">
                <AlertIcon />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Issues Summary</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{totalIssues}</p>
            <p className="mt-1 text-sm text-gray-500">
              {totalIssues} total issues • {daysWithIssues} days with issues
            </p>
            <div className="mt-3 flex space-x-2">
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                {data.reduce((sum, item) => sum + item.conditionalClearances, 0)} conditional
              </span>
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                {data.reduce((sum, item) => sum + item.declinedClearances, 0)} declined
              </span>
            </div>
          </div>
          <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            {daysWithIssues} days
          </div>
        </div>
      </div>

      {/* Performance Trend Card */}
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-purple-200 hover:shadow-lg">
        <div className="absolute -right-2 -top-2 size-16 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 opacity-50 transition-opacity group-hover:opacity-75"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <TargetIcon />
              </div>
              <h3 className="text-sm font-medium text-gray-600">7-Day Trend</h3>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{last7DaysAvg.toFixed(1)}</p>
              <div
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  trend > 0
                    ? "bg-green-100 text-green-800"
                    : trend < 0
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {trend > 0 ? (
                  <svg className="mr-1 size-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : trend < 0 ? (
                  <svg className="mr-1 size-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="mr-1 size-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1)}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {trend > 0 ? "Improving" : trend < 0 ? "Declining" : "Stable"} vs previous week
            </p>
            <div className="mt-3 text-xs text-gray-500">
              Best: {bestDay ? formatDate(bestDay.date) : "N/A"} ({bestDay?.score || 0})
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentManagementDashboard() {
  const router = useRouter()
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>(TimeRange.Today)
  const [chartType, setChartType] = useState<"score" | "collections" | "clearances">("score")
  const [performanceChartType, setPerformanceChartType] = useState<"year" | "month" | "week">("year")
  const [paymentSummaryRange, setPaymentSummaryRange] = useState<PaymentSummaryRange>("today")
  const [currentSlide, setCurrentSlide] = useState(0)

  // Offers data for the slider
  const offers = [
    {
      title: "Special Offer! Get 20% Bonus Units",
      description: "Top up your account this week and receive 20% bonus units on all purchases. Limited time offer!",
      gradient: "from-emerald-600 to-green-600",
      buttonColor: "#059669",
      primaryText: "Buy Units Now",
      primaryAction: "/customer-portal/buy-unit",
      secondaryText: "View All Offers",
      secondaryAction: "#",
      badgeText: "Limited Time",
      badgeSubtext: "Ends in 3 days",
      iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "New Payment Method Available",
      description: "Pay with cryptocurrency now supported! Get 5% cashback on your first crypto payment.",
      gradient: "from-purple-600 to-indigo-600",
      buttonColor: "#4F46E5",
      primaryText: "Try Crypto Payment",
      primaryAction: "#",
      secondaryText: "Learn More",
      secondaryAction: "#",
      badgeText: "New Feature",
      badgeSubtext: "5% Cashback",
      iconPath:
        "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Refer a Friend, Get Rewards",
      description: "Invite your friends to join and earn 50 bonus units for each successful referral. No limits!",
      gradient: "from-orange-600 to-red-600",
      buttonColor: "#DC2626",
      primaryText: "Refer Friends",
      primaryAction: "#",
      secondaryText: "View Rewards",
      secondaryAction: "#",
      badgeText: "Unlimited",
      badgeSubtext: "50 Units per referral",
      iconPath:
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
  ]

  // Slider navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length)
  }

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [currentSlide])

  const { user } = useSelector((state: RootState) => state.auth)
  const { customer } = useSelector((state: RootState) => state.customerAuth)
  const {
    agentInfo,
    agentInfoLoading,
    agentInfoError,
    agentSummary,
    agentSummaryLoading,
    agentSummaryError,
    agentPerformanceDaily,
    agentPerformanceDailyLoading,
    agentPerformanceDailyError,
  } = useSelector((state: RootState) => state.agents)

  const { paymentsSummary, isLoadingSummary, summaryError } = useSelector(
    (state: RootState) => state.customersDashboard
  )

  const dispatch = useAppDispatch()

  // Fetch payment summary when range changes
  useEffect(() => {
    dispatch(getPaymentsSummary({ range: paymentSummaryRange }))
  }, [dispatch, paymentSummaryRange])

  // Get the active period from agent summary based on the selected time range
  const activePeriod = agentSummary?.periods?.find((period) => period.range === activeTimeRange)

  // Fallback to the first available period if the selected one isn't present
  const kpiSource = activePeriod || agentSummary?.periods?.[0]

  // Derive KPI metrics for the summary cards from the summary data (AGENT_SUMMARY response)
  const summary = kpiSource ?? {
    collectedAmount: 0,
    collectedCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    cashClearedAmount: 0,
    cashClearanceCount: 0,
    billingDisputesRaised: 0,
    billingDisputesResolved: 0,
    changeRequestsRaised: 0,
    changeRequestsResolved: 0,
    outstandingCashEstimate: 0,
    collectionsByChannel: [],
  }

  // Format currency
  const formatSummaryCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(amount / 1000000) + "M"
    ) // Convert from kobo to millions
  }

  const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleAddAgentSuccess = async () => {
    setIsAddAgentModalOpen(false)
    // In template mode, no API refresh is triggered.
  }

  const handleRefreshData = () => {
    // Template-only: simulate a short loading state without making API calls.
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
  }

  const handlePerformanceTimeRangeChange = (range: "year" | "month" | "week") => {
    setPerformanceChartType(range)
  }

  const customerName = customer?.fullName || "Customer"

  const timeRanges = [
    { value: TimeRange.Today, label: "Today" },
    { value: TimeRange.Yesterday, label: "Yesterday" },
    { value: TimeRange.ThisWeek, label: "This Week" },
    { value: TimeRange.ThisMonth, label: "This Month" },
    { value: TimeRange.LastMonth, label: "Last Month" },
    { value: TimeRange.ThisYear, label: "This Year" },
    { value: TimeRange.AllTime, label: "All Time" },
  ]

  const getTimeRangeLabel = (range: TimeRange) => {
    const found = timeRanges.find((r) => r.value === range)
    return found ? found.label : range
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <CustomerDashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 lg:container sm:px-4 xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col justify-between gap-4 py-4 sm:py-6 md:flex-row md:gap-6">
              <div className="flex-1">
                <h4 className="text-xl font-semibold sm:text-2xl">Welcome {customerName}!</h4>
              </div>

              <motion.div
                className="flex items-center justify-start gap-3 md:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {(!agentInfo || agentInfo.cashAtHand < agentInfo.cashCollectionLimit) && (
                  <ButtonModule
                    variant="blue"
                    size="md"
                    className="w-full sm:w-auto"
                    icon={<CollectCash />}
                    onClick={() => router.push("/customer-portal/make-payment")}
                  >
                    <span className="hidden sm:inline">Make Payment</span>
                  </ButtonModule>
                )}
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<VendingIconOutline color="white" />}
                  onClick={() => router.push("/customer-portal/buy-unit")}
                >
                  <span className="hidden sm:inline">Buy Unit</span>
                </ButtonModule>
              </motion.div>
            </div>

            {/* Sales Rep Details - Cash at hand vs Collection limit */}
            {agentInfo && (
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Sales Rep Details</h3>
                    <p className="text-xs text-gray-500 sm:text-sm">
                      Cash at hand and collection limit for your profile
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                    <div className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                      Code: {agentInfo.agentCode}
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 font-medium ${
                        agentInfo.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      Status: {agentInfo.status}
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 font-medium ${
                        agentInfo.canCollectCash ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      Can Collect Cash: {agentInfo.canCollectCash ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                    <span>Cash at Hand vs Collection Limit</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(agentInfo.cashAtHand)} / {formatCurrency(agentInfo.cashCollectionLimit)}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 sm:h-4">
                    {agentInfo.cashCollectionLimit > 0 && (
                      <div
                        className={`h-3 rounded-full transition-all duration-700 sm:h-4 ${
                          agentInfo.cashAtHand / agentInfo.cashCollectionLimit > 0.8
                            ? "bg-red-500"
                            : agentInfo.cashAtHand / agentInfo.cashCollectionLimit > 0.5
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min((agentInfo.cashAtHand / agentInfo.cashCollectionLimit) * 100, 100).toFixed(
                            1
                          )}%`,
                        }}
                      />
                    )}
                  </div>
                  {agentInfo.cashCollectionLimit > 0 && (
                    <div className="text-xs text-gray-500 sm:text-xs">
                      {((agentInfo.cashAtHand / agentInfo.cashCollectionLimit) * 100).toFixed(1)}% of limit used
                    </div>
                  )}
                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                      <div className="text-xs font-medium text-blue-600 sm:text-sm">Cash at Hand</div>
                      <div className="text-base font-bold text-blue-900 sm:text-lg">
                        {formatCurrency(agentInfo.cashAtHand)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3 sm:p-4">
                      <div className="text-xs font-medium text-emerald-600 sm:text-sm">Collection Limit</div>
                      <div className="text-base font-bold text-emerald-900 sm:text-lg">
                        {formatCurrency(agentInfo.cashCollectionLimit)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional agent details from AGENT_INFO */}
                <div className="mt-5">
                  <div className="grid gap-4 text-xs text-gray-600 sm:grid-cols-2 sm:text-sm">
                    <div className="space-y-1 rounded-lg bg-gray-50 p-3 sm:p-4">
                      <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-gray-500">Name</span>
                        <span className="truncate font-medium text-gray-800">{agentInfo.fullName}</span>
                      </p>
                      <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-gray-500">Phone</span>
                        <span className="truncate font-medium text-gray-800">{agentInfo.phoneNumber}</span>
                      </p>
                    </div>
                    <div className="space-y-1 rounded-lg bg-gray-50 p-3 sm:p-4">
                      <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-gray-500">Email</span>
                        <span className="truncate font-medium text-gray-800">{agentInfo.email}</span>
                      </p>
                      <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-gray-500">Last Updated</span>
                        <span className="truncate font-medium text-gray-800">
                          {formatDateTime(agentInfo.lastCashCollectionDate)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Wallet Card */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Customer Wallet</h3>
                    <p className="text-sm text-gray-500">Manage your account balance and transactions</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/customer-portal/wallet")}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Manage Wallet
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Current Balance */}
                <div className="text-center sm:text-left">
                  <p className="mb-1 text-sm font-medium text-gray-500">Current Balance</p>
                  <p className="text-2xl font-bold text-gray-900">₦12,500.00</p>
                  <p className="mt-1 text-xs text-green-600">+2.5% from last month</p>
                </div>

                {/* Pending Transactions */}
                <div className="text-center sm:text-left">
                  <p className="mb-1 text-sm font-medium text-gray-500">Pending Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="mt-1 text-xs text-amber-600">Awaiting confirmation</p>
                </div>

                {/* Wallet Status */}
                <div className="text-center sm:text-left">
                  <p className="mb-1 text-sm font-medium text-gray-500">Wallet Status</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <p className="text-2xl font-bold text-gray-900">Active</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">All systems operational</p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-600">Last updated: 2 mins ago</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-600">Auto-recharge: Enabled</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/customer-portal/wallet/transactions")}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View Transaction History →
                  </button>
                </div>
              </div>
            </div>

            {/* Adverts Banner Slider */}
            <div className="mb-6">
              <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-lg">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {offers.map((offer, index) => (
                    <div key={index} className="min-w-full">
                      <div className={`bg-gradient-to-r p-6 text-white ${offer.gradient}`}>
                        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
                          <div className="text-center lg:text-left">
                            <h3 className="mb-2 text-xl font-bold">{offer.title}</h3>
                            <p className="mb-4 text-white/90">{offer.description}</p>
                            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                              <button
                                onClick={() => router.push(offer.primaryAction)}
                                className="rounded-lg bg-white px-6 py-2 text-sm font-semibold transition-colors hover:bg-gray-100"
                                style={{ color: offer.buttonColor }}
                              >
                                {offer.primaryText}
                              </button>
                              <button
                                onClick={() => router.push(offer.secondaryAction)}
                                className="rounded-lg border border-white/30 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                              >
                                {offer.secondaryText}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
                                <svg
                                  className="mx-auto mb-2 h-12 w-12 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={offer.iconPath}
                                  />
                                </svg>
                                <p className="text-sm font-medium">{offer.badgeText}</p>
                                <p className="text-xs text-white/80">{offer.badgeSubtext}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slider Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                  aria-label="Previous slide"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                  aria-label="Next slide"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Slider Indicators */}
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
                  {offers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === currentSlide ? "bg-white" : "bg-white/50"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-6">
              {/* Payment Summary Section */}
              <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Range:</span>
                    <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                      {paymentSummaryRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setPaymentSummaryRange(range.value as PaymentSummaryRange)}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                            paymentSummaryRange === range.value
                              ? "bg-[#004b23] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {isLoadingSummary ? (
                  <PaymentSummarySkeleton />
                ) : summaryError ? (
                  <div className="mt-4 rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-red-600">Error: {summaryError}</p>
                  </div>
                ) : paymentsSummary?.windows && paymentsSummary.windows.length > 0 ? (
                  <div className="mt-4">
                    {(() => {
                      // Find the window that matches the selected range
                      const selectedWindow =
                        paymentsSummary.windows.find((window) => {
                          // Map the range value to expected window names
                          const rangeMap: Record<string, string> = {
                            today: "Today",
                            yesterday: "Yesterday",
                            this_week: "This Week",
                            last_week: "Last Week",
                            this_month: "This Month",
                            last_month: "Last Month",
                            this_year: "This Year",
                            all_time: "All Time",
                          }
                          return window.window === rangeMap[paymentSummaryRange]
                        }) || paymentsSummary.windows[0] // Fallback to first window if no match found

                      return (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                          {/* Today's Collection */}
                          <div className="border-r border-gray-200 pr-6 last:border-r-0">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                <svg
                                  className="h-5 w-5 text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                                  />
                                </svg>
                                <span className="text-sm font-medium">
                                  {selectedWindow?.amount && selectedWindow.amount > 0 ? "+12.5%" : "0%"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h3 className="text-sm font-medium text-gray-500">Total Amount Vend</h3>
                              <p className="mt-2 text-2xl font-semibold text-gray-900">
                                ₦{selectedWindow?.amount ? formatCurrency(selectedWindow.amount) : "0"}
                              </p>
                              <div className="mt-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                  <span>Transactions:</span>
                                  <span>{selectedWindow?.count?.toLocaleString() || "0"}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Total Vend Count */}
                          <div className="border-r border-gray-200 pr-6 last:border-r-0">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                <svg
                                  className="h-5 w-5 text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                                  />
                                </svg>
                                <span className="text-sm font-medium">
                                  {selectedWindow?.count && selectedWindow.count > 0
                                    ? `+${(((selectedWindow.count * 0.153) / selectedWindow.count) * 100).toFixed(1)}%`
                                    : "0%"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h3 className="text-sm font-medium text-gray-500">Total Vend Count</h3>
                              <p className="mt-2 text-2xl font-semibold text-gray-900">
                                {selectedWindow?.count?.toLocaleString() || "0"}
                              </p>
                              <div className="mt-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                  <span>Average:</span>
                                  <span>
                                    ₦
                                    {selectedWindow?.amount && selectedWindow?.count > 0
                                      ? formatCurrency(selectedWindow.amount / selectedWindow.count)
                                      : "0"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Vend Channels */}
                          <div className="border-r border-gray-200 pr-6 last:border-r-0">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                <svg
                                  className="h-5 w-5 text-purple-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                                  />
                                </svg>
                                <span className="text-sm font-medium">
                                  {selectedWindow?.byChannel?.length && selectedWindow.byChannel.length > 0
                                    ? `+${(
                                        ((selectedWindow.byChannel.length * 0.087) / selectedWindow.byChannel.length) *
                                        100
                                      ).toFixed(1)}%`
                                    : "0%"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h3 className="text-sm font-medium text-gray-500">Vend Channels</h3>
                              <p className="mt-2 text-2xl font-semibold text-gray-900">
                                {selectedWindow?.byChannel?.length || 0}
                              </p>
                              <div className="mt-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                  <span>Active:</span>
                                  <span>
                                    {selectedWindow?.byChannel?.length
                                      ? Math.floor(selectedWindow.byChannel.length * 0.8)
                                      : 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment Types */}
                          <div className="pr-6 last:pr-0">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                <svg
                                  className="h-5 w-5 text-amber-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                  />
                                </svg>
                              </div>
                              <div className="flex items-center gap-1 text-amber-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                  />
                                </svg>
                                <span className="text-sm font-medium">
                                  {selectedWindow?.byPaymentType?.length && selectedWindow.byPaymentType.length > 0
                                    ? `-${(
                                        ((selectedWindow.byPaymentType.length * 0.032) /
                                          selectedWindow.byPaymentType.length) *
                                        100
                                      ).toFixed(1)}%`
                                    : "0%"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h3 className="text-sm font-medium text-gray-500">Payment Types</h3>
                              <p className="mt-2 text-2xl font-semibold text-gray-900">
                                {selectedWindow?.byPaymentType?.length || 0}
                              </p>
                              <div className="mt-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                  <span>Popular:</span>
                                  <span>Card</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="mt-4 py-8 text-center">
                    <p className="text-sm text-gray-500">No payment data available for the selected range</p>
                  </div>
                )}
              </div>

              {/* Quick Actions Section */}
              <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    onClick={() => router.push("/customer-portal/buy-unit")}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 text-left transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <CollectionIcon />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Pay Bills</p>
                        <p className="text-xs text-gray-600">View and pay your bills</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => router.push("/customer-portal/make-payment")}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-4 text-left transition-all duration-300 hover:border-purple-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-100 p-2">
                        <CollectCash size={20} color="#8B5CF6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Make Payment</p>
                        <p className="text-xs text-gray-600">Pay for services</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/customer-portal/support-ticket")}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4 text-left transition-all duration-300 hover:border-green-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-100 p-2">
                        <AlertIcon />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Raise Ticket</p>
                        <p className="text-xs text-gray-600">Get support from our team</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/customer-portal/report-outage")}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-amber-50 to-white p-4 text-left transition-all duration-300 hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <AlertIcon />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Report Outage</p>
                        <p className="text-xs text-gray-600">Report power outages</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Time Range Filters for Performance Summary */}

              {/* Main KPI Cards */}
              {agentInfoLoading || agentSummaryLoading ? (
                <>
                  <SkeletonLoader />
                  <LoadingState showCategories={true} />
                </>
              ) : (
                // Loaded State - Updated Agent Management Dashboard
                <>
                  {/* Performance Charts Section */}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-4"
                  >
                    {agentPerformanceDailyLoading ? (
                      <CustomerPaymentHistoryTableSkeleton />
                    ) : (
                      <CustomerPaymentHistoryTable />
                    )}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      {/* <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onRequestClose={() => setIsAddAgentModalOpen(false)}
        onSuccess={handleAddAgentSuccess} 
      />*/}
    </section>
  )
}
