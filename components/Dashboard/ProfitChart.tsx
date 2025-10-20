"use client"

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useGetTransactionSeriesQuery } from "lib/redux/overviewSlice"
import { useEffect, useState } from "react"

interface ProfitChartProps {
  timeFilter?: "day" | "week" | "month" | "all"
}

export function ProfitChart({ timeFilter = "month" }: ProfitChartProps) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({})
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  })
  const [useCustomDates, setUseCustomDates] = useState<boolean>(false)

  // Calculate date range based on time filter or custom dates
  useEffect(() => {
    if (useCustomDates && customDateRange.from && customDateRange.to) {
      setDateRange({ from: customDateRange.from, to: customDateRange.to })
      return
    }

    const now = new Date()
    let from: string | undefined
    let to: string | undefined

    switch (timeFilter) {
      case "day":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split("T")[0]
        to = from
        break
      case "week":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        from = weekStart.toISOString().split("T")[0]
        to = now.toISOString().split("T")[0]
        break
      case "month":
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
        to = now.toISOString().split("T")[0]
        break
      case "all":
      default:
        // For all time, don't set date filters
        from = undefined
        to = undefined
        break
    }

    setDateRange({ from, to })
  }, [timeFilter, useCustomDates, customDateRange])

  const {
    data: seriesData,
    isLoading,
    error,
  } = useGetTransactionSeriesQuery({
    type: selectedType || undefined,
    from: dateRange.from,
    to: dateRange.to,
  })

  // Transform the data for the chart
  const chartData =
    seriesData?.data?.map((item) => ({
      day: new Date(item.day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: item.amount,
      count: item.count,
      type: item.type,
    })) || []

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-64 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Failed to load transaction data</p>
        </div>
      </div>
    )
  }

  const transactionTypes = [
    { value: "", label: "All Types" },
    { value: "topUp", label: "Deposits" },
    { value: "withdraw", label: "Withdrawals" },
    { value: "buyCrypto", label: "Buy Crypto" },
    { value: "sellCrypto", label: "Sell Crypto" },
    { value: "airtime", label: "Airtime" },
    { value: "internetBundle", label: "Internet Bundle" },
    { value: "utility", label: "Utility" },
  ]

  const handleCustomDateChange = (field: "from" | "to", value: string) => {
    setCustomDateRange((prev) => ({ ...prev, [field]: value }))
  }

  const toggleCustomDates = () => {
    setUseCustomDates((prev) => !prev)
    if (useCustomDates) {
      // Reset custom dates when switching back to time filter
      setCustomDateRange({ from: "", to: "" })
    }
  }

  return (
    <div>
      <div className="mb-4 space-y-3">
        {/* Transaction Type Filter */}
        <div className="flex justify-end">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Toggle */}
        <div className="flex items-center justify-end">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={useCustomDates}
              onChange={toggleCustomDates}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Use custom date range</span>
          </label>
        </div>

        {/* Custom Date Range Inputs */}
        {useCustomDates && (
          <div className="flex items-center justify-end space-x-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={customDateRange.from}
                onChange={(e) => handleCustomDateChange("from", e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={customDateRange.to}
                onChange={(e) => handleCustomDateChange("to", e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Amount" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
