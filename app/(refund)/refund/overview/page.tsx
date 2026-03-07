"use client"

import React, { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  Loader2,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react"
import {
  MdAccountBalance,
  MdAttachMoney,
  MdCalendarToday,
  MdCheck,
  MdClose,
  MdCode,
  MdDevices,
  MdFilterList,
  MdPerson,
  MdReceipt,
  MdStore,
  MdSwapHoriz,
} from "react-icons/md"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { AgentsRequestParams, fetchAgents } from "lib/redux/agentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearPaymentTypes, fetchPaymentTypes } from "lib/redux/paymentTypeSlice"
import { fetchRefundSummary, RefundSummaryParams } from "lib/redux/refundSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchVendors } from "lib/redux/vendorSlice"
import AllRefundsTable from "components/Tables/AllRefundTable"

// ==================== Dropdown Popover Component ====================
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

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {children}
        <ChevronDown className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSelect(option.value)
                    setIsOpen(false)
                  }}
                  className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
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

// ==================== Modern Analytics Card ====================
const AnalyticsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  trendValue,
  isLoading = false,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color?: "blue" | "green" | "purple" | "amber" | "emerald" | "red"
  trend?: "up" | "down"
  trendValue?: string
  isLoading?: boolean
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
  }

  if (isLoading) {
    return (
      <motion.div
        className="rounded-xl border border-gray-200 bg-white p-5"
        initial={{ opacity: 0.6 }}
        animate={{
          opacity: [0.6, 1, 0.6],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <div className="flex items-start justify-between">
          <div className="size-10 rounded-lg bg-gray-200"></div>
          <div className="h-6 w-16 rounded-full bg-gray-200"></div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-8 w-32 rounded bg-gray-200"></div>
          <div className="h-3 w-20 rounded bg-gray-200"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${colorClasses[color].split(" ")[0]}`}>
          <Icon className={`size-5 ${iconColors[color]}`} />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trendValue}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

// ==================== Channel Breakdown Card ====================
const ChannelBreakdownCard = ({
  channel,
  count,
  amount,
  netAmount,
  color = "blue",
}: {
  channel: string
  count: number
  amount: number
  netAmount: number
  color?: "blue" | "purple" | "amber" | "emerald"
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    amber: "bg-amber-50 border-amber-200",
    emerald: "bg-emerald-50 border-emerald-200",
  }

  const iconColors = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
  }

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{channel}</p>
          <p className="mt-1 text-xs text-gray-600">{count} transactions</p>
        </div>
        <MdDevices className={`size-5 ${iconColors[color]}`} />
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium text-gray-900">₦{amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Net:</span>
          <span className="font-medium text-emerald-600">₦{netAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// ==================== Vendor Breakdown Item ====================
const VendorBreakdownItem = ({
  vendor,
  count,
  amount,
  netAmount,
}: {
  vendor: string
  count: number
  amount: number
  netAmount: number
}) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 hover:border-gray-200">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-purple-100 p-2">
          <MdStore className="size-4 text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{vendor}</p>
          <p className="text-xs text-gray-500">{count} transactions</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">₦{amount.toLocaleString()}</p>
        <p className="text-xs text-emerald-600">₦{netAmount.toLocaleString()}</p>
      </div>
    </div>
  )
}

// ==================== Date Breakdown Item ====================
const DateBreakdownItem = ({
  date,
  count,
  amount,
  netAmount,
}: {
  date: string
  count: number
  amount: number
  netAmount: number
}) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 hover:border-gray-200">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-amber-100 p-2">
          <Calendar className="size-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{new Date(date).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{count} transactions</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">₦{amount.toLocaleString()}</p>
        <p className="text-xs text-emerald-600">₦{netAmount.toLocaleString()}</p>
      </div>
    </div>
  )
}

// ==================== Refund Summary Section ====================
const RefundSummarySection = ({ data, isLoading, error }: { data: any; isLoading: boolean; error: string | null }) => {
  const [activeTab, setActiveTab] = useState<"channel" | "vendor" | "date">("channel")

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <AnalyticsCard key={i} title="" value="" icon={MdAttachMoney} isLoading={true} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Failed to load refund summary</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Calculate trends (mock data - in real app, compare with previous period)
  const totalAmountTrend = "+12.5%"
  const netAmountTrend = "+8.3%"
  const volumeTrend = "+5.2%"

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Refunds"
          value={data.totalCount || 0}
          subtitle="All refund transactions"
          icon={MdReceipt}
          color="blue"
          trend="up"
          trendValue={volumeTrend}
        />
        <AnalyticsCard
          title="Total Amount"
          value={`₦${(data.totalAmount || 0).toLocaleString()}`}
          subtitle="Gross amount"
          icon={MdAttachMoney}
          color="green"
          trend="up"
          trendValue={totalAmountTrend}
        />
        <AnalyticsCard
          title="Net Amount"
          value={`₦${(data.totalNetAmount || 0).toLocaleString()}`}
          subtitle="After deductions"
          icon={MdAccountBalance}
          color="purple"
          trend="up"
          trendValue={netAmountTrend}
        />
        <AnalyticsCard
          title="Top Channel"
          value={data.byChannel?.[0]?.channel || "N/A"}
          subtitle={`${data.byChannel?.[0]?.totalCount || 0} transactions`}
          icon={MdSwapHoriz}
          color="amber"
        />
      </div>

      {/* Refund Breakdown Section */}
      {(data.byChannel?.length > 0 || data.byVendor?.length > 0 || data.byDate?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          {/* Header */}
          <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <PieChart className="size-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Refund Breakdown</h2>
                <p className="text-sm text-gray-600">Analysis by channel, vendor, and date</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {data.byChannel?.length > 0 && (
                <button
                  onClick={() => setActiveTab("channel")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "channel" ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  By Channel
                </button>
              )}
              {data.byVendor?.length > 0 && (
                <button
                  onClick={() => setActiveTab("vendor")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "vendor" ? "bg-white text-purple-700 shadow-sm" : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  By Vendor
                </button>
              )}
              {data.byDate?.length > 0 && (
                <button
                  onClick={() => setActiveTab("date")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "date" ? "bg-white text-amber-700 shadow-sm" : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  By Date
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "channel" && data.byChannel?.length > 0 && (
              <motion.div
                key="channel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 gap-4 lg:grid-cols-3"
              >
                {data.byChannel.slice(0, 6).map((item: any, index: number) => {
                  const colors = [
                    { bg: "bg-blue-50", text: "text-blue-700", gradient: "from-blue-500 to-blue-600" },
                    { bg: "bg-purple-50", text: "text-purple-700", gradient: "from-purple-500 to-purple-600" },
                    { bg: "bg-emerald-50", text: "text-emerald-700", gradient: "from-emerald-500 to-emerald-600" },
                  ][index % 3] || { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-500 to-gray-600" }
                  const percentage = data.totalCount > 0 ? Math.round((item.totalCount / data.totalCount) * 100) : 0

                  return (
                    <motion.div
                      key={`channel-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-lg p-2 ${colors.bg}`}>
                            <MdDevices className={`size-4 ${colors.text}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{item.channel}</h3>
                            <p className="text-xs text-gray-500">Payment Channel</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${colors.text}`}>
                          {item.totalCount.toLocaleString()}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Distribution</span>
                          <span className="font-medium text-gray-900">{percentage}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                          />
                        </div>
                      </div>

                      {/* Amount Breakdown */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-emerald-50 p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MdAttachMoney className="size-3 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">Gross</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-emerald-900">
                            ₦{item.totalAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MdSwapHoriz className="size-3 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">Net</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-amber-900">
                            ₦{item.totalNetAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {activeTab === "vendor" && data.byVendor?.length > 0 && (
              <motion.div
                key="vendor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 gap-4 lg:grid-cols-3"
              >
                {data.byVendor.slice(0, 6).map((item: any, index: number) => {
                  const colors = [
                    { bg: "bg-purple-50", text: "text-purple-700", gradient: "from-purple-500 to-purple-600" },
                    { bg: "bg-blue-50", text: "text-blue-700", gradient: "from-blue-500 to-blue-600" },
                    { bg: "bg-emerald-50", text: "text-emerald-700", gradient: "from-emerald-500 to-emerald-600" },
                  ][index % 3] || { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-500 to-gray-600" }
                  const percentage = data.totalCount > 0 ? Math.round((item.totalCount / data.totalCount) * 100) : 0

                  return (
                    <motion.div
                      key={`vendor-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-lg p-2 ${colors.bg}`}>
                            <MdStore className={`size-4 ${colors.text}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{item.vendorName}</h3>
                            <p className="text-xs text-gray-500">Payment Vendor</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${colors.text}`}>
                          {item.totalCount.toLocaleString()}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Distribution</span>
                          <span className="font-medium text-gray-900">{percentage}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                          />
                        </div>
                      </div>

                      {/* Amount Breakdown */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-emerald-50 p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MdAttachMoney className="size-3 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">Gross</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-emerald-900">
                            ₦{item.totalAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MdSwapHoriz className="size-3 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">Net</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-amber-900">
                            ₦{item.totalNetAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {activeTab === "date" && data.byDate?.length > 0 && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 gap-4 lg:grid-cols-3"
              >
                {data.byDate.slice(0, 6).map((item: any, index: number) => {
                  const colors = [
                    { bg: "bg-amber-50", text: "text-amber-700", gradient: "from-amber-500 to-amber-600" },
                    { bg: "bg-blue-50", text: "text-blue-700", gradient: "from-blue-500 to-blue-600" },
                    { bg: "bg-purple-50", text: "text-purple-700", gradient: "from-purple-500 to-purple-600" },
                  ][index % 3] || { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-500 to-gray-600" }
                  const percentage = data.totalCount > 0 ? Math.round((item.totalCount / data.totalCount) * 100) : 0

                  return (
                    <motion.div
                      key={`date-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-lg p-2 ${colors.bg}`}>
                            <MdCalendarToday className={`size-4 ${colors.text}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {new Date(item.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </h3>
                            <p className="text-xs text-gray-500">Refund Date</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${colors.text}`}>
                          {item.totalCount.toLocaleString()}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Distribution</span>
                          <span className="font-medium text-gray-900">{percentage}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                          />
                        </div>
                      </div>

                      {/* Amount Breakdown */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-emerald-50 p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MdAttachMoney className="size-3 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-700">Gross</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-emerald-900">
                            ₦{item.totalAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MdSwapHoriz className="size-3 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">Net</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-amber-900">
                            ₦{item.totalNetAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

// ==================== Filter Modal ====================
const FilterModal = ({
  isOpen,
  onRequestClose,
  localFilters,
  handleFilterChange,
  applyFilters,
  resetFilters,
  agentOptions,
  channelOptions,
  customerOptions,
  vendorOptions,
}: {
  isOpen: boolean
  onRequestClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | number | undefined) => void
  applyFilters: () => void
  resetFilters: () => void
  agentOptions: Array<{ value: string | number; label: string }>
  channelOptions: Array<{ value: string; label: string }>
  customerOptions: Array<{ value: string | number; label: string }>
  vendorOptions: Array<{ value: string | number; label: string }>
}) => {
  const [modalTab, setModalTab] = useState<"filters" | "active">("filters")

  const handleSubmit = () => {
    applyFilters()
    onRequestClose()
  }

  const handleClearAll = () => {
    resetFilters()
    onRequestClose()
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.customerId) count++
    if (localFilters.vendorId) count++
    if (localFilters.agentId) count++
    if (localFilters.channel) count++
    if (localFilters.fromUtc) count++
    if (localFilters.toUtc) count++
    if (localFilters.refundTypeKey) count++
    return count
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onRequestClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#004B23] to-[#006B33] px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold text-white">FILTERS</span>
                {getActiveFilterCount() > 0 && (
                  <motion.span
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="size-2 rounded-full bg-white" />
                    {getActiveFilterCount()} Active
                  </motion.span>
                )}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Filter Refunds</h3>
              <p className="mt-1 text-sm text-white/70">Apply filters to refine refund data</p>
            </div>
            <motion.button
              onClick={onRequestClose}
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdClose className="text-xl" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1">
            {[
              { id: "filters", label: "Filters", icon: MdFilterList },
              { id: "active", label: "Active Filters", icon: MdCheck },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setModalTab(tab.id as typeof modalTab)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  modalTab === tab.id ? "bg-white text-[#004B23]" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {modalTab === "filters" && (
              <motion.div
                key="filters"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Customer ID & Vendor ID */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdPerson className="text-[#004B23]" />
                    Entity Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Customer</label>
                      <FormSelectModule
                        name="customerId"
                        value={localFilters.customerId || ""}
                        onChange={(e) =>
                          handleFilterChange("customerId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={customerOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Vendor</label>
                      <FormSelectModule
                        name="vendorId"
                        value={localFilters.vendorId || ""}
                        onChange={(e) =>
                          handleFilterChange("vendorId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={vendorOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent & Channel */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdDevices className="text-[#004B23]" />
                    Processing Filters
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Agent</label>
                      <FormSelectModule
                        name="agentId"
                        value={localFilters.agentId || ""}
                        onChange={(e) =>
                          handleFilterChange("agentId", e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={agentOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Channel</label>
                      <FormSelectModule
                        name="channel"
                        value={localFilters.channel || ""}
                        onChange={(e) => handleFilterChange("channel", e.target.value || undefined)}
                        options={channelOptions}
                        className="w-full"
                        controlClassName="h-10 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Refund Type */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCode className="text-[#004B23]" />
                    Type Filters
                  </h4>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Refund Type</label>
                    <input
                      type="text"
                      value={localFilters.refundTypeKey || ""}
                      onChange={(e) => handleFilterChange("refundTypeKey", e.target.value || undefined)}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter refund type"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCalendarToday className="text-[#004B23]" />
                    Date Range
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">From Date</label>
                      <input
                        type="date"
                        value={localFilters.fromUtc || ""}
                        onChange={(e) => handleFilterChange("fromUtc", e.target.value || undefined)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">To Date</label>
                      <input
                        type="date"
                        value={localFilters.toUtc || ""}
                        onChange={(e) => handleFilterChange("toUtc", e.target.value || undefined)}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {modalTab === "active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                    <MdCheck className="text-[#004B23]" />
                    Active Filters
                  </h4>

                  {getActiveFilterCount() === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-200">
                        <MdFilterList className="size-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No active filters</p>
                      <p className="mt-1 text-sm text-gray-400">Apply filters to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {localFilters.customerId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Customer</p>
                            <p className="text-xs text-gray-500">
                              {customerOptions.find((opt) => opt.value === localFilters.customerId)?.label ||
                                localFilters.customerId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("customerId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.vendorId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Vendor</p>
                            <p className="text-xs text-gray-500">
                              {vendorOptions.find((opt) => opt.value === localFilters.vendorId)?.label ||
                                localFilters.vendorId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("vendorId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.agentId && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Agent</p>
                            <p className="text-xs text-gray-500">
                              {agentOptions.find((opt) => opt.value === localFilters.agentId)?.label ||
                                localFilters.agentId}
                            </p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("agentId", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.channel && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Channel</p>
                            <p className="text-xs text-gray-500">{localFilters.channel}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("channel", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.refundTypeKey && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Refund Type</p>
                            <p className="text-xs text-gray-500">{localFilters.refundTypeKey}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("refundTypeKey", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.fromUtc && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">From Date</p>
                            <p className="text-xs text-gray-500">{localFilters.fromUtc}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("fromUtc", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                      {localFilters.toUtc && (
                        <div className="flex items-center justify-between rounded-lg bg-white p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">To Date</p>
                            <p className="text-xs text-gray-500">{localFilters.toUtc}</p>
                          </div>
                          <button
                            onClick={() => handleFilterChange("toUtc", undefined)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{getActiveFilterCount()} active filter(s)</p>
            <div className="flex gap-3">
              <motion.button
                onClick={handleClearAll}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear All
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                className="rounded-lg bg-[#004B23] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003318]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Filters
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== Loading State ====================
const LoadingState = () => {
  return (
    <div className="w-full">
      {/* Analytics Cards Skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <AnalyticsCard key={i} title="" value="" icon={MdAttachMoney} isLoading={true} />
        ))}
      </div>

      {/* Breakdown Section Skeleton */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-40 rounded bg-gray-200"></div>
          <div className="h-6 w-24 rounded-full bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-100"></div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-7 w-48 rounded bg-gray-200"></div>
            <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded bg-gray-200"></div>
            <div className="h-9 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 w-full rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== Main Page Component ====================
export default function RefundOverviewPage() {
  const dispatch = useAppDispatch()
  const { agents } = useAppSelector((state) => state.agents)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)
  const { paymentTypes } = useAppSelector((state) => state.paymentTypes)
  const { refundSummaryData, refundSummaryLoading, refundSummaryError } = useAppSelector((state) => state.refunds)
  const { customers } = useAppSelector((state) => state.customers)
  const { vendors } = useAppSelector((state) => state.vendors)

  const [showFilterModal, setShowFilterModal] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // 8 minutes default

  // Local state for filters to avoid too many Redux dispatches
  const [localFilters, setLocalFilters] = useState({
    customerId: undefined as number | undefined,
    vendorId: undefined as number | undefined,
    agentId: undefined as number | undefined,
    channel: undefined as
      | "Cash"
      | "BankTransfer"
      | "Pos"
      | "Card"
      | "VendorWallet"
      | "Chaque"
      | "BankDeposit"
      | "Vendor"
      | "Migration"
      | undefined,
    fromUtc: undefined as string | undefined,
    toUtc: undefined as string | undefined,
    refundTypeKey: undefined as string | undefined,
  })

  // Applied filters state - triggers API calls
  const [appliedFilters, setAppliedFilters] = useState<RefundSummaryParams>({})

  // Fetch refund summary data and other options
  useEffect(() => {
    dispatch(fetchRefundSummary(appliedFilters))
  }, [dispatch, appliedFilters])

  // Fetch agents, area offices, and payment types for filter options
  useEffect(() => {
    dispatch(
      fetchAgents({
        pageNumber: 1,
        pageSize: 100,
      } as AgentsRequestParams)
    )

    dispatch(
      fetchAreaOffices({
        PageNumber: 1,
        PageSize: 100,
      })
    )

    dispatch(fetchPaymentTypes())

    // Fetch customers and vendors for filter options
    dispatch(
      fetchCustomers({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    dispatch(
      fetchVendors({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    return () => {
      dispatch(clearAreaOffices())
      dispatch(clearPaymentTypes())
    }
  }, [dispatch])

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      dispatch(fetchRefundSummary(appliedFilters))
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, isPolling, pollingInterval, appliedFilters])

  // Filter options
  const agentOptions = [
    { value: "", label: "All Agents" },
    ...agents.map((agent) => ({
      value: agent.id,
      label: agent.user.fullName,
    })),
  ]

  const customerOptions = [
    { value: "", label: "All Customers" },
    ...customers.map((customer) => ({
      value: customer.id,
      label: `${customer.fullName} (${customer.accountNumber})`,
    })),
  ]

  const vendorOptions = [
    { value: "", label: "All Vendors" },
    ...vendors.map((vendor) => ({
      value: vendor.id,
      label: vendor.name,
    })),
  ]

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: "Cash", label: "Cash" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Pos", label: "POS" },
    { value: "Card", label: "Card" },
    { value: "VendorWallet", label: "Vendor Wallet" },
    { value: "Chaque", label: "Chaque" },
    { value: "BankDeposit", label: "Bank Deposit" },
    { value: "Vendor", label: "Vendor" },
    { value: "Migration", label: "Migration" },
  ]

  // Polling interval options
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 660000, label: "11m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Filter handlers
  const applyFilters = () => {
    // Convert date strings to ISO format with time components
    const formatFromUtc = (dateString: string | undefined) => {
      if (!dateString) return undefined
      return `${dateString}T00:00:00.000Z`
    }

    const formatToUtc = (dateString: string | undefined) => {
      if (!dateString) return undefined
      return `${dateString}T22:59:59.999Z`
    }

    setAppliedFilters({
      CustomerId: localFilters.customerId,
      VendorId: localFilters.vendorId,
      AgentId: localFilters.agentId,
      Channel: localFilters.channel || undefined,
      FromUtc: formatFromUtc(localFilters.fromUtc),
      ToUtc: formatToUtc(localFilters.toUtc),
      RefundTypeKey: localFilters.refundTypeKey,
    })
  }

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  const resetFilters = () => {
    setLocalFilters({
      customerId: undefined,
      vendorId: undefined,
      agentId: undefined,
      channel: undefined,
      fromUtc: undefined,
      toUtc: undefined,
      refundTypeKey: undefined,
    })
    setAppliedFilters({})
  }

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handleRefreshData = useCallback(() => {
    dispatch(fetchRefundSummary(appliedFilters))
  }, [dispatch, appliedFilters])

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.CustomerId) count++
    if (appliedFilters.VendorId) count++
    if (appliedFilters.AgentId) count++
    if (appliedFilters.Channel) count++
    if (appliedFilters.FromUtc) count++
    if (appliedFilters.ToUtc) count++
    if (appliedFilters.RefundTypeKey) count++
    return count
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Refund Overview</h1>
                  <p className="mt-1 text-sm text-gray-600">Track and manage all refund transactions</p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Filter className="size-4" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>

                  {/* Polling Controls */}
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1">
                    <button
                      onClick={togglePolling}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isPolling ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <RefreshCw className={`size-3.5 ${isPolling ? "animate-spin" : ""}`} />
                      {isPolling ? "ON" : "OFF"}
                    </button>

                    {isPolling && (
                      <DropdownPopover
                        options={pollingOptions}
                        selectedValue={pollingInterval}
                        onSelect={setPollingInterval}
                      >
                        {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                      </DropdownPopover>
                    )}
                  </div>

                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={refundSummaryLoading}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${refundSummaryLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Main Content */}
            {refundSummaryLoading && !refundSummaryData ? (
              <LoadingState />
            ) : (
              <div className="space-y-6">
                {/* Refund Summary Section */}
                <RefundSummarySection
                  data={refundSummaryData}
                  isLoading={refundSummaryLoading}
                  error={refundSummaryError}
                />

                {/* All Refunds Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4"
                >
                  <AllRefundsTable />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        agentOptions={agentOptions}
        channelOptions={channelOptions}
        customerOptions={customerOptions}
        vendorOptions={vendorOptions}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {refundSummaryLoading && !refundSummaryData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="size-12 animate-spin rounded-full border-4 border-[#004B23] border-t-transparent" />
                <div className="text-center">
                  <p className="font-medium text-gray-900">Loading Refund Data</p>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
