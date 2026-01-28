"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"
import { motion } from "framer-motion"
import DisputesChangesCard from "components/Cards/DisputesChangesCard"
import {
  AddAgentIcon,
  CollectCash,
  MetersProgrammedIcon,
  PerformanceIcon,
  TamperIcon,
  TargetIcon,
  VendingIcon,
  VendingIconOutline,
} from "components/Icons/Icons"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { ButtonModule } from "components/ui/Button/Button"
import AllPaymentsTable from "components/Tables/AllPaymentsTable"
import { formatCurrency } from "utils/formatCurrency"
import { useAppDispatch } from "lib/hooks/useRedux"

import {
  AgentDailyPerformance,
  fetchAgentInfo,
  fetchAgentPerformanceDaily,
  fetchAgentSummary,
  TimeRange,
} from "lib/redux/agentSlice"
// Chart Component for Agent Performance

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ServiceIcon, TokenIcon } from "components/Sidebar/Icons"
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

// Get agent type styling for Collections Summary card
const getCollectionsSummaryStyle = (agentType: string) => {
  switch (agentType) {
    case "SalesRep":
      return {
        bgGradient: "from-blue-50 to-blue-100",
        borderColor: "border-blue-100",
        iconColor: "text-blue-700",
        hoverBorder: "hover:border-blue-200",
        hoverShadow: "hover:shadow-blue-100",
      }
    case "Cashier":
      return {
        bgGradient: "from-green-50 to-green-100",
        borderColor: "border-green-100",
        iconColor: "text-green-700",
        hoverBorder: "hover:border-green-200",
        hoverShadow: "hover:shadow-green-100",
      }
    case "ClearingCashier":
      return {
        bgGradient: "from-purple-50 to-purple-100",
        borderColor: "border-purple-100",
        iconColor: "text-purple-700",
        hoverBorder: "hover:border-purple-200",
        hoverShadow: "hover:shadow-purple-100",
      }
    case "Supervisor":
      return {
        bgGradient: "from-teal-50 to-cyan-100",
        borderColor: "border-teal-100",
        iconColor: "text-teal-700",
        hoverBorder: "hover:border-teal-200",
        hoverShadow: "hover:shadow-teal-100",
      }
    case "FinanceManager":
      return {
        bgGradient: "from-emerald-50 to-emerald-100",
        borderColor: "border-emerald-100",
        iconColor: "text-emerald-700",
        hoverBorder: "hover:border-emerald-200",
        hoverShadow: "hover:shadow-emerald-100",
      }
    default:
      return {
        bgGradient: "from-gray-50 to-gray-100",
        borderColor: "border-gray-100",
        iconColor: "text-gray-700",
        hoverBorder: "hover:border-gray-200",
        hoverShadow: "hover:shadow-gray-100",
      }
  }
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
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
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
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}</p>
          <p className="ml-2 text-sm text-gray-500">/100</p>
        </div>
        <div className="mt-2">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.min(Math.max(averageScore, 0), 100)}%`,
                backgroundColor: getScoreColor(averageScore),
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Total Collections Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Total Collections</h3>
          <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">{totalDays} days</div>
        </div>
        <p className="mt-2 text-2xl font-bold text-gray-900">
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

      {/* Issues Summary Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Issues Summary</h3>
          <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            {daysWithIssues} days
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-gray-900">{totalIssues}</p>
        <p className="mt-1 text-sm text-gray-500">
          {totalIssues} total issues • {daysWithIssues} days with issues
        </p>
        <div className="mt-2 flex space-x-2">
          <span className="text-xs text-amber-600">
            {data.reduce((sum, item) => sum + item.conditionalClearances, 0)} conditional
          </span>
          <span className="text-xs text-red-600">
            {data.reduce((sum, item) => sum + item.declinedClearances, 0)} declined
          </span>
        </div>
      </div>

      {/* Performance Trend Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">7-Day Trend</h3>
          <div
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              trend > 0
                ? "bg-green-100 text-green-800"
                : trend < 0
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1)}
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-gray-900">{last7DaysAvg.toFixed(1)}</p>
        <p className="mt-1 text-sm text-gray-500">
          {trend > 0 ? "Improving" : trend < 0 ? "Declining" : "Stable"} vs previous week
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Best: {bestDay ? formatDate(bestDay.date) : "N/A"} ({bestDay?.score || 0})
        </div>
      </div>
    </div>
  )
}

export default function AgentManagementDashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>(TimeRange.Today)
  const [chartType, setChartType] = useState<"score" | "collections" | "clearances">("score")
  const [performanceChartType, setPerformanceChartType] = useState<"year" | "month" | "week">("year")

  const { user } = useSelector((state: RootState) => state.auth)
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

  useEffect(() => {
    dispatch(fetchAgentInfo())
    dispatch(fetchAgentSummary())

    // Fetch performance data for the current year
    const { startUtc, endUtc } = getStartAndEndOfYear()
    dispatch(fetchAgentPerformanceDaily({ startUtc, endUtc }))
  }, [dispatch])

  // Get the active period from agent summary based on the selected time range
  const activePeriod = agentSummary?.periods?.find((period) => period.range === activeTimeRange)

  // Fallback to the first available period if the selected one isn't present
  const kpiSource = activePeriod || agentSummary?.periods?.[0]

  // Derive KPI metrics for the summary cards from the summary data (AGENT_SUMMARY response)
  const summary = kpiSource ?? {
    collectedAmount: 0,
    collectedCount: 0,
    prepaidCollectedAmount: 0,
    prepaidCollectedCount: 0,
    postpaidCollectedAmount: 0,
    postpaidCollectedCount: 0,
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
    // Refresh data after adding agent
    handleRefreshData()
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    Promise.all([
      dispatch(fetchAgentInfo()),
      dispatch(fetchAgentSummary()),
      // Refresh performance data too
      (() => {
        const { startUtc, endUtc } = getStartAndEndOfYear()
        return dispatch(fetchAgentPerformanceDaily({ startUtc, endUtc }))
      })(),
    ]).finally(() => {
      setIsLoading(false)
    })
  }

  const handlePerformanceTimeRangeChange = (range: "year" | "month" | "week") => {
    setPerformanceChartType(range)

    let startDate = new Date()
    let endDate = new Date()

    switch (range) {
      case "year":
        startDate = new Date(endDate.getFullYear(), 0, 1)
        break
      case "month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
        break
      case "week":
        startDate = new Date(endDate)
        startDate.setDate(startDate.getDate() - 7)
        break
    }

    dispatch(
      fetchAgentPerformanceDaily({
        startUtc: startDate.toISOString(),
        endUtc: endDate.toISOString(),
      })
    )
  }

  const _agentLastName = user?.fullName
    ? user.fullName
        .trim()
        .split(" ")
        .filter((part) => part.length > 0)
        .slice(-1)[0]
    : "Agent"

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
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-4 lg:px-6 2xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col justify-between gap-4 py-4 sm:py-6 md:flex-row md:gap-6">
              <div className="flex-1">
                <h4 className="text-xl font-semibold sm:text-2xl">Welcome {_agentLastName}</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  {user?.position === "Supervisor" || user?.position === "FinanceManager"
                    ? `Welcome to  ${agentInfo?.areaOfficeName || "Loading..."}`
                    : "Overview of your monthly collections"}
                </p>
              </div>

              <motion.div
                className="flex items-center justify-start gap-3 md:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {agentInfo && (agentInfo.agentType === "SalesRep" || agentInfo.agentType === "Cashier") && (
                  <ButtonModule
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto"
                    icon={<VendingIconOutline color="white" />}
                    onClick={() => router.push("/sales-rep/vend")}
                  >
                    <span className="hidden sm:inline">Vend</span>
                  </ButtonModule>
                )}
                {agentInfo && (agentInfo.agentType === "SalesRep" || agentInfo.agentType === "Cashier") && (
                  <ButtonModule
                    variant="orange"
                    size="md"
                    icon={<CollectCash />}
                    className="w-full sm:w-auto"
                    onClick={() => router.push("/sales-rep/clear-cash")}
                  >
                    <span className="hidden sm:inline">Clear Cash</span>
                  </ButtonModule>
                )}

                {agentInfo && agentInfo.agentType === "ClearingCashier" && (
                  <ButtonModule
                    variant="black"
                    size="md"
                    icon={<CollectCash />}
                    className="w-full sm:w-auto"
                    onClick={() => router.push("/sales-rep/clear-cash")}
                  >
                    <span className="hidden sm:inline">Mopup Cash</span>
                  </ButtonModule>
                )}
                {/* {(!agentInfo || agentInfo.cashAtHand < agentInfo.cashCollectionLimit) && ( */}
                {agentInfo && (agentInfo.agentType === "SalesRep" || agentInfo.agentType === "Cashier") && (
                  <ButtonModule
                    variant="blue"
                    size="md"
                    className="w-full sm:w-auto"
                    icon={<CollectCash />}
                    onClick={() => router.push("/sales-rep/collect-payment")}
                  >
                    <span className="hidden sm:inline">Collect Payment</span>
                  </ButtonModule>
                )}
                {/* )} */}
              </motion.div>
            </div>

            {/* Sales Rep Details - Cash at hand vs Collection limit */}
            {agentInfo && (agentInfo.agentType === "SalesRep" || agentInfo.agentType === "Cashier") && (
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

            {/* Main Content Area */}
            <div className="mt-6">
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
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Desktop: inline buttons */}
                      <div className="hidden rounded-lg bg-white p-2 shadow-sm sm:block">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">Performance Range:</span>
                          <div className="flex items-center gap-2">
                            {timeRanges.map((range) => (
                              <button
                                key={range.value}
                                onClick={() => setActiveTimeRange(range.value)}
                                className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                                  activeTimeRange === range.value
                                    ? "bg-[#004B23] text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                }`}
                              >
                                {range.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Mobile: dropdown selector */}
                      <div className="w-full sm:hidden">
                        <div className="rounded-lg bg-white p-3 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-gray-500">Performance Range:</span>
                            <div className="relative">
                              <select
                                value={activeTimeRange}
                                onChange={(e) => setActiveTimeRange(e.target.value as TimeRange)}
                                className="block w-40 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {timeRanges.map((range) => (
                                  <option key={range.value} value={range.value}>
                                    {range.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {/* Collections Summary Card */}
                        <motion.div
                          className={`small-card rounded-md bg-gradient-to-br ${
                            agentInfo
                              ? getCollectionsSummaryStyle(agentInfo.agentType).bgGradient
                              : "from-gray-50 to-gray-100"
                          } ${
                            agentInfo ? getCollectionsSummaryStyle(agentInfo.agentType).borderColor : "border-gray-200"
                          } border p-4 shadow-sm transition duration-500 ${
                            agentInfo
                              ? getCollectionsSummaryStyle(agentInfo.agentType).hoverBorder
                              : "hover:border-gray-300"
                          } ${
                            agentInfo
                              ? getCollectionsSummaryStyle(agentInfo.agentType).hoverShadow
                              : "hover:shadow-gray-100"
                          }`}
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center justify-between gap-2 border-b pb-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={
                                  agentInfo
                                    ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                    : "text-gray-600"
                                }
                              >
                                <MetersProgrammedIcon />
                              </div>
                              <span
                                className={`text-sm font-medium sm:text-base ${
                                  agentInfo
                                    ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                    : "text-gray-700"
                                }`}
                              >
                                Collections Summary
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                                {getTimeRangeLabel(activeTimeRange)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p
                                className={`text-sm sm:text-base ${
                                  agentInfo
                                    ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                    : "text-gray-600"
                                }`}
                              >
                                Amount Collected:
                              </p>
                              <p
                                className={`text-lg font-bold sm:text-xl ${
                                  agentInfo
                                    ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                    : "text-gray-900"
                                }`}
                              >
                                <span
                                  className={`text-lg font-bold sm:text-xl ${
                                    agentInfo
                                      ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                      : "text-gray-900"
                                  }`}
                                >
                                  ₦{summary.collectedAmount.toLocaleString()}.<span className="text-sm">00</span>
                                </span>
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p
                                className={`text-sm sm:text-base ${
                                  agentInfo
                                    ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                    : "text-gray-600"
                                }`}
                              >
                                Collections Count:
                              </p>
                              <p
                                className={`text-lg font-bold sm:text-xl ${
                                  agentInfo
                                    ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                    : "text-gray-900"
                                }`}
                              >
                                {formatNumber(summary.collectedCount)}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p
                                className={`text-sm sm:text-base ${
                                  agentInfo
                                    ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                    : "text-gray-600"
                                }`}
                              >
                                Channels Used:
                              </p>
                              <p
                                className={`text-sm font-medium sm:text-base ${
                                  agentInfo
                                    ? getCollectionsSummaryStyle(agentInfo.agentType).iconColor
                                    : "text-gray-700"
                                }`}
                              >
                                {formatNumber(summary.collectionsByChannel?.length ?? 0)}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Pending Collections Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-amber-600">
                              <MetersProgrammedIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Pending Collections</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Pending Amount:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                <span className="text-secondary text-lg font-bold sm:text-xl">
                                  ₦{summary.pendingAmount.toLocaleString()}.<span className="text-sm">00</span>
                                </span>
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Pending Count:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {formatNumber(summary.pendingCount)}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Outstanding Cash Est.:</p>
                              <p className="text-secondary text-sm font-medium sm:text-base">
                                {formatSummaryCurrency(summary.outstandingCashEstimate)}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Cash Clearance Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-green-600">
                              <VendingIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Cash Clearance</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Cash Cleared Amount:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                <span className="text-secondary text-lg font-bold sm:text-xl">
                                  ₦{summary.cashClearedAmount.toLocaleString()}.<span className="text-sm">00</span>
                                </span>
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Clearance Count:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {formatNumber(summary.cashClearanceCount)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      {/* Quick Actions - Agents Card */}
                      <div className="small-card mt-6 flex w-full flex-col rounded-md bg-white p-4 shadow-sm transition duration-500 md:border">
                        <div className="flex items-center gap-2 border-b pb-4">
                          <span className="text-sm font-medium sm:text-base">Quick Actions</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-4 max-sm:grid-cols-1">
                          {agentInfo && (agentInfo.agentType === "SalesRep" || agentInfo.agentType === "Cashier") && (
                            <button
                              onClick={() => router.push("vend")}
                              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-3 text-left transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                  <VendingIcon />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Vend</p>
                                  <p className="text-xs text-gray-600">Process vending transactions</p>
                                </div>
                              </div>
                            </button>
                          )}
                          {agentInfo && (agentInfo.agentType === "SalesRep" || agentInfo.agentType === "Cashier") && (
                            <button
                              onClick={() => router.push("clear-cash")}
                              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-3 text-left transition-all duration-300 hover:border-green-300 hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                  <VendingIconOutline />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Clear Cash</p>
                                  <p className="text-xs text-gray-600">Clear cash collections</p>
                                </div>
                              </div>
                            </button>
                          )}
                          {agentInfo && agentInfo.agentType === "ClearingCashier" && (
                            <button
                              onClick={() => router.push("mop-cash")}
                              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-amber-50 to-white p-3 text-left transition-all duration-300 hover:border-amber-300 hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-100 p-2">
                                  <CollectCash />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Mop Cash</p>
                                  <p className="text-xs text-gray-600">Mop up cash collections</p>
                                </div>
                              </div>
                            </button>
                          )}
                          {agentInfo && (agentInfo.agentType === "SalesRep" || agentInfo.agentType === "Cashier") && (
                            <button
                              onClick={() => router.push("collect-payment")}
                              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-3 text-left transition-all duration-300 hover:border-purple-300 hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-2">
                                  <CollectCash />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Collect Payment</p>
                                  <p className="text-xs text-gray-600">Collect customer payments</p>
                                </div>
                              </div>
                            </button>
                          )}
                          <button
                            onClick={() => router.push("view-cash-clearance-history")}
                            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 text-left transition-all duration-300 hover:border-gray-300 hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-gray-100 p-2">
                                <VendingIcon />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">View Cash Clearance</p>
                                <p className="text-xs text-gray-600">Check clearance status</p>
                              </div>
                            </div>
                          </button>
                          {agentInfo && agentInfo.agentType !== "SalesRep" && agentInfo.agentType !== "Cashier" && (
                            <button
                              onClick={() => router.push("assigned-officers")}
                              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-indigo-50 to-white p-3 text-left transition-all duration-300 hover:border-indigo-300 hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-100 p-2">
                                  <TargetIcon />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Assigned Officers</p>
                                  <p className="text-xs text-gray-600">View assigned officers</p>
                                </div>
                              </div>
                            </button>
                          )}
                          {agentInfo && agentInfo.agentType !== "SalesRep" && agentInfo.agentType !== "Cashier" && (
                            <button
                              onClick={() => router.push("mopping-history")}
                              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-red-50 to-white p-3 text-left transition-all duration-300 hover:border-red-300 hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-100 p-2">
                                  <TokenIcon isActive={false} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Mopping History</p>
                                  <p className="text-xs text-gray-600">View mopping history</p>
                                </div>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                      <DisputesChangesCard
                        billingDisputesRaised={summary.billingDisputesRaised}
                        billingDisputesResolved={summary.billingDisputesResolved}
                        changeRequestsRaised={summary.changeRequestsRaised}
                        changeRequestsResolved={summary.changeRequestsResolved}
                      />
                    </div>
                  </motion.div>

                  {/* Performance Charts Section */}
                  <motion.div
                    className="my-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Performance Overview</h3>
                          <p className="text-sm text-gray-600">Daily performance metrics and trends</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                            {["year", "month", "week"].map((range) => (
                              <button
                                key={range}
                                onClick={() => handlePerformanceTimeRangeChange(range as "year" | "month" | "week")}
                                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                                  performanceChartType === range
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                              </button>
                            ))}
                          </div>

                          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                            {[
                              { key: "score", label: "Score" },
                              { key: "collections", label: "Collections" },
                              { key: "clearances", label: "Clearances" },
                            ].map((type) => (
                              <button
                                key={type.key}
                                onClick={() => setChartType(type.key as "score" | "collections" | "clearances")}
                                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                                  chartType === type.key
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {agentPerformanceDailyLoading ? (
                        <ChartSkeleton />
                      ) : agentPerformanceDailyError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                          <p className="text-red-600">Error loading performance data: {agentPerformanceDailyError}</p>
                          <button
                            onClick={handleRefreshData}
                            className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Retry
                          </button>
                        </div>
                      ) : agentPerformanceDaily && agentPerformanceDaily.length > 0 ? (
                        <>
                          <PerformanceSummary data={agentPerformanceDaily} />
                          <div className="mt-6">
                            <PerformanceChart
                              data={agentPerformanceDaily}
                              chartType={chartType}
                              timeRange={performanceChartType}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                          <p className="text-gray-500">No performance data available for the selected period</p>
                          <button
                            onClick={handleRefreshData}
                            className="mt-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                          >
                            Refresh Data
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-6"
                  >
                    <AllPaymentsTable />
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onRequestClose={() => setIsAddAgentModalOpen(false)}
        onSuccess={handleAddAgentSuccess}
      />
    </section>
  )
}
