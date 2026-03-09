"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useState } from "react"
import AddCustomerModal from "components/ui/Modal/add-customer-modal"
import { AnimatePresence, motion } from "framer-motion"
import { useSelector } from "react-redux"
import { useAppDispatch } from "lib/hooks/useRedux"
import { RootState } from "lib/redux/store"
import { fetchPrepaidStats, fetchPrepaidSummaryAnalytics, PrepaidSummaryParams } from "lib/redux/analyticsSlice"
import PrepaidTransactionTable from "components/MeteringInfo/PrepaidTransaction"
import { ButtonModule } from "components/ui/Button/Button"
import {
  AlertCircle,
  BarChart3,
  Bolt,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  Home,
  Loader2,
  Mail,
  PieChart,
  RefreshCw,
  Shield,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react"

// Compact Dropdown Popover
const DropdownPopover = ({
  options,
  selectedValue,
  onSelect,
  children,
}: {
  options: { value: number; label: string }[]
  selectedValue: number
  onSelect: (value: number) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        {children}
        <svg
          className={`size-3.5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 z-20 mt-1 min-w-[100px] overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-xs shadow-lg"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value)
                    setIsOpen(false)
                  }}
                  className={`block w-full px-2 py-1.5 text-left transition-colors ${
                    option.value === selectedValue
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact Analytics Card
const CompactAnalyticsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  trendValue,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color?: "blue" | "green" | "purple" | "amber" | "emerald" | "red"
  trend?: "up" | "down"
  trendValue?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between">
        <div className={`rounded-md p-1.5 ${colorClasses[color]}`}>
          <Icon className="size-4" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trendValue}
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-xs text-gray-600">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value.toLocaleString()}</p>
        {subtitle && <p className="mt-0.5 text-[10px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// Compact Queue Status
const CompactQueueStatus = ({ stats }: { stats: any }) => {
  const items = [
    { label: "Pending", value: stats?.pendingPayments || 0, color: "amber", icon: Clock },
    { label: "Processing", value: stats?.processingPayments || 0, color: "blue", icon: Loader2 },
    { label: "Retry", value: stats?.retryPending || 0, color: "purple", icon: RefreshCw },
    { label: "Queue", value: stats?.retryRedisLength || 0, color: "indigo", icon: Database },
  ]

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Database className="size-4 text-gray-600" />
          <span className="text-xs font-medium text-gray-700">Queue Status</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`size-2 rounded-full ${stats ? "bg-green-500" : "bg-gray-400"}`} />
          <span className="text-[10px] text-gray-500">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {items.map((item, i) => (
          <div key={i} className="rounded bg-gray-50 p-1.5 text-center">
            <item.icon
              className={`mx-auto mb-1 size-3.5 ${
                item.color === "amber"
                  ? "text-amber-600"
                  : item.color === "blue"
                  ? "text-blue-600"
                  : item.color === "purple"
                  ? "text-purple-600"
                  : "text-indigo-600"
              } ${item.label === "Processing" ? "animate-spin" : ""}`}
            />
            <p className="text-xs font-semibold text-gray-900">{item.value}</p>
            <p className="text-[8px] text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Compact Channel Row
const CompactChannelRow = ({
  channel,
  formatCurrency,
}: {
  channel: any
  formatCurrency: (amount: number) => string
}) => {
  const successRate = channel.totalVends > 0 ? ((channel.successfulVends / channel.totalVends) * 100).toFixed(1) : 0

  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <CreditCard className="size-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-900">{channel.channel}</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-[10px] text-gray-500">{channel.totalVends} vends</span>
          <span className="text-[10px] text-gray-500">{successRate}% success</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-gray-900">{formatCurrency(channel.totalPaymentAmount)}</p>
        <p className="text-[10px] text-gray-500">{channel.totalKwh.toLocaleString()} kWh</p>
      </div>
    </div>
  )
}

// Compact Agent Row
const CompactAgentRow = ({
  agent,
  formatCurrency,
  index,
}: {
  agent: any
  formatCurrency: (amount: number) => string
  index: number
}) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-gray-900">{agent.agentName || `Agent ${index + 1}`}</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-[10px] text-gray-500">{agent.totalVends} vends</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-gray-900">{formatCurrency(agent.totalPaymentAmount)}</p>
        <p className="text-[10px] text-gray-500">{agent.totalKwh.toLocaleString()} kWh</p>
      </div>
    </div>
  )
}

// Compact Daily Trend Item
const CompactDailyItem = ({
  day,
  formatCurrency,
  formatDate,
}: {
  day: any
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
}) => {
  const successRate = day.totalVends > 0 ? ((day.successfulVends / day.totalVends) * 100).toFixed(1) : "0"

  return (
    <div className="rounded border border-gray-100 bg-gray-50 p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-gray-900">{formatDate(day.bucketDate)}</span>
        <span
          className={`text-[10px] font-medium ${parseFloat(successRate) >= 95 ? "text-emerald-600" : "text-amber-600"}`}
        >
          {successRate}%
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-gray-500">Revenue</span>
        <span className="text-xs font-semibold text-gray-900">{formatCurrency(day.totalPaymentAmount)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500">kWh</span>
        <span className="text-[10px] font-medium text-gray-900">{day.totalKwh.toLocaleString()}</span>
      </div>
    </div>
  )
}

// Compact Analytics Section
const CompactPrepaidAnalytics = () => {
  const dispatch = useAppDispatch()
  const { prepaidSummaryData, prepaidSummaryLoading, prepaidSummaryError, prepaidStatsData, prepaidStatsLoading } =
    useSelector((state: RootState) => state.analytics)

  const [isPolling, setIsPolling] = useState(false)
  const [pollingInterval, setPollingInterval] = useState(300000)

  useEffect(() => {
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    dispatch(fetchPrepaidSummaryAnalytics({ StartDateUtc: startDate, EndDateUtc: endDate }))
    dispatch(fetchPrepaidStats())
  }, [dispatch])

  const handleRefresh = useCallback(() => {
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    dispatch(fetchPrepaidSummaryAnalytics({ StartDateUtc: startDate, EndDateUtc: endDate }))
    dispatch(fetchPrepaidStats())
  }, [dispatch])

  useEffect(() => {
    if (!isPolling) return
    const interval = setInterval(handleRefresh, pollingInterval)
    return () => clearInterval(interval)
  }, [isPolling, pollingInterval, handleRefresh])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    })
  }

  if (prepaidSummaryLoading || prepaidStatsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading prepaid analytics...</p>
        </div>
      </div>
    )
  }

  if (prepaidSummaryError || !prepaidSummaryData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-xs text-red-700">Failed to load analytics</p>
      </div>
    )
  }

  const totals = prepaidSummaryData.totals
  const successRate = totals.successRatePercent || 0

  return (
    <div className="space-y-3">
      {/* Compact Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {formatDate(prepaidSummaryData.windowStartUtc)} - {formatDate(prepaidSummaryData.windowEndUtc)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPolling(!isPolling)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium ${
              isPolling ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            <RefreshCw className={`mr-1 inline-block size-3 ${isPolling ? "animate-spin" : ""}`} />
            {isPolling ? "ON" : "OFF"}
          </button>
          {isPolling && (
            <DropdownPopover
              options={[
                { value: 300000, label: "5m" },
                { value: 600000, label: "10m" },
                { value: 900000, label: "15m" },
              ]}
              selectedValue={pollingInterval}
              onSelect={setPollingInterval}
            >
              {pollingInterval / 60000}m
            </DropdownPopover>
          )}
          <button onClick={handleRefresh} className="rounded-md bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200">
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Cards Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <CompactAnalyticsCard
          title="Total Vends"
          value={totals.totalVends}
          subtitle={`${totals.successfulVends} OK · ${totals.failedVends} Failed`}
          icon={ShoppingCart}
          color="blue"
          trend="up"
          trendValue="+8%"
        />
        <CompactAnalyticsCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          subtitle={successRate >= 95 ? "Good" : "Needs attention"}
          icon={CheckCircle2}
          color={successRate >= 95 ? "green" : "amber"}
        />
        <CompactAnalyticsCard
          title="Revenue"
          value={formatCurrency(totals.totalPaymentAmount)}
          subtitle={`Avg ${formatCurrency(totals.averagePaymentAmount)}`}
          icon={DollarSign}
          color="purple"
          trend="up"
          trendValue="+15%"
        />
        <CompactAnalyticsCard
          title="kWh Sold"
          value={totals.totalKwh.toLocaleString()}
          subtitle={`Avg ${totals.averageKwhPerVend.toFixed(1)} kWh`}
          icon={Zap}
          color="amber"
          trend="up"
          trendValue="+12%"
        />
      </div>

      {/* Compact Queue Status */}
      {prepaidStatsData && <CompactQueueStatus stats={prepaidStatsData} />}

      {/* Compact Breakdown Grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Channels */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h3 className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-700">
            <BarChart3 className="size-3.5" />
            Top Channels
          </h3>
          <div className="space-y-1">
            {prepaidSummaryData.byChannel.slice(0, 3).map((channel, i) => (
              <CompactChannelRow key={i} channel={channel} formatCurrency={formatCurrency} />
            ))}
          </div>
        </div>

        {/* Agents */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h3 className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-700">
            <Users className="size-3.5" />
            Top Agents
          </h3>
          <div className="space-y-1">
            {prepaidSummaryData.byAgent.slice(0, 3).map((agent, i) => (
              <CompactAgentRow key={i} agent={agent} formatCurrency={formatCurrency} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Compact Daily Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <h3 className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-700">
          <Calendar className="size-3.5" />
          Last 7 Days
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
          {prepaidSummaryData.daily.slice(-7).map((day, i) => (
            <CompactDailyItem key={i} day={day} formatCurrency={formatCurrency} formatDate={formatDate} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Compact Table Section
const CompactTableSection = () => {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
        <h3 className="text-xs font-medium text-gray-700">Recent Transactions</h3>
      </div>
      <div className="p-2">
        <PrepaidTransactionTable pageSize={10} />
      </div>
    </div>
  )
}

export default function AllTransactions() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(true)

  return (
    <section className="min-h-screen w-full bg-gray-50">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-3 py-4">
            {/* Ultra Compact Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Prepaid Vending</h1>
                <p className="text-xs text-gray-600">STS token management</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    showAnalytics
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {showAnalytics ? "Hide Stats" : "Show Stats"}
                </button>
                <button
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Add Customer
                </button>
              </div>
            </div>

            {/* Compact Analytics - Collapsible */}
            <AnimatePresence>
              {showAnalytics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 overflow-hidden"
                >
                  <CompactPrepaidAnalytics />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compact Table */}
            <CompactTableSection />
          </div>
        </div>
      </div>

      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={() => setIsAddCustomerModalOpen(false)}
      />
    </section>
  )
}
