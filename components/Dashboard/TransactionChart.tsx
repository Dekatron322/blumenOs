"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useGetTransactionOverviewQuery } from "lib/redux/overviewSlice"
import { useMemo } from "react"

type TimeFilter = "day" | "week" | "month" | "all"

interface TransactionChartProps {
  timeFilter: TimeFilter
  theme?: string
}

export function TransactionChart({ timeFilter, theme }: TransactionChartProps) {
  const { data: transactionData, isLoading, isError } = useGetTransactionOverviewQuery()

  const chartData = useMemo(() => {
    if (!transactionData?.data) {
      return []
    }

    const data = transactionData.data

    // Generate chart data based on time filter
    const getDataForPeriod = () => {
      switch (timeFilter) {
        case "day":
          return {
            crypto: (data.buyCrypto_Today || 0) + (data.sellCrypto_Today || 0),
            fiat:
              (data.topUp_Today || 0) +
              (data.withdraw_Today || 0) +
              (data.airtime_Today || 0) +
              (data.internetBundle_Today || 0) +
              (data.utility_Today || 0),
          }
        case "week":
          return {
            crypto: (data.buyCrypto_ThisWeek || 0) + (data.sellCrypto_ThisWeek || 0),
            fiat:
              (data.topUp_ThisWeek || 0) +
              (data.withdraw_ThisWeek || 0) +
              (data.airtime_ThisWeek || 0) +
              (data.internetBundle_ThisWeek || 0) +
              (data.utility_ThisWeek || 0),
          }
        case "month":
          return {
            crypto: (data.buyCrypto_ThisMonth || 0) + (data.sellCrypto_ThisMonth || 0),
            fiat:
              (data.topUp_ThisMonth || 0) +
              (data.withdraw_ThisMonth || 0) +
              (data.airtime_ThisMonth || 0) +
              (data.internetBundle_ThisMonth || 0) +
              (data.utility_ThisMonth || 0),
          }
        default: // all
          return {
            crypto: (data.buyCrypto_AllTime || 0) + (data.sellCrypto_AllTime || 0),
            fiat:
              (data.topUp_AllTime || 0) +
              (data.withdraw_AllTime || 0) +
              (data.airtime_AllTime || 0) +
              (data.internetBundle_AllTime || 0) +
              (data.utility_AllTime || 0),
          }
      }
    }

    const periodData = getDataForPeriod()

    // Create a simple chart with current period data
    // In a real scenario, you might want historical data for multiple periods
    return [
      {
        period:
          timeFilter === "day"
            ? "Today"
            : timeFilter === "week"
            ? "This Week"
            : timeFilter === "month"
            ? "This Month"
            : "All Time",
        crypto: Math.round(periodData.crypto),
        fiat: Math.round(periodData.fiat),
      },
    ]
  }, [transactionData, timeFilter])

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-64 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (isError || !chartData.length) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-gray-500">Unable to load transaction data</p>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
          <XAxis dataKey="period" stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
          <YAxis stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
              borderRadius: "0.5rem",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
          />
          <Legend />
          <Bar dataKey="crypto" fill="#3b82f6" name="Crypto Transactions" />
          <Bar dataKey="fiat" fill="#10b981" name="Fiat Transactions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
