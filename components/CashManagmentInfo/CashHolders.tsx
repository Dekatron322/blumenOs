"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { CashHolder, fetchCashHolders } from "lib/redux/paymentSlice"

// Modern Analytics Card Component
const CashAnalyticsCard = ({
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
  color?: "blue" | "green" | "purple" | "amber" | "emerald"
  trend?: "up" | "down"
  trendValue?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
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

interface CashHoldersStats {
  totalAmount: string
  totalHolders: number
  totalTransactions: number
  topHolder: {
    name: string
    amount: string
    transactions: number
  }
}

interface CashHoldersProps {
  onViewDetails?: () => void
  onExportReport?: () => void
}

const CashHolders: React.FC<CashHoldersProps> = ({ onViewDetails, onExportReport }) => {
  const dispatch = useAppDispatch()
  const { cashHolders, cashHoldersLoading, cashHoldersError } = useAppSelector((state) => state.payments)
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [showMobileActions, setShowMobileActions] = useState(false)

  useEffect(() => {
    dispatch(fetchCashHolders({}))
  }, [dispatch])

  const handleRefreshData = () => {
    dispatch(fetchCashHolders({}))
  }

  const calculateStats = (): CashHoldersStats => {
    if (!cashHolders || cashHolders.length === 0) {
      return {
        totalAmount: "₦0",
        totalHolders: 0,
        totalTransactions: 0,
        topHolder: {
          name: "N/A",
          amount: "₦0",
          transactions: 0,
        },
      }
    }

    const totalAmount = cashHolders.reduce((sum, holder) => sum + holder.totalAmount, 0)
    const totalTransactions = cashHolders.reduce((sum, holder) => sum + holder.paymentCount, 0)
    const topHolder = cashHolders.reduce(
      (max: CashHolder, holder: CashHolder) => (holder.totalAmount > max.totalAmount ? holder : max),
      cashHolders[0]!
    )

    return {
      totalAmount: `₦${totalAmount.toLocaleString()}`,
      totalHolders: cashHolders.length,
      totalTransactions,
      topHolder: {
        name: topHolder.holderName,
        amount: `₦${topHolder.totalAmount.toLocaleString()}`,
        transactions: topHolder.paymentCount,
      },
    }
  }

  const stats = calculateStats()

  // Auto-collapse summary on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSummaryOpen(false)
      } else {
        setIsSummaryOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <section className="w-full bg-white">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Cash Holders Management</h1>
              <p className="mt-1 text-sm text-gray-600">Manage and track cash holder accounts and transactions</p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefreshData}
                disabled={cashHoldersLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${cashHoldersLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>

              {/* Mobile actions dropdown */}
              <div className="relative lg:hidden">
                <button
                  onClick={() => setShowMobileActions(!showMobileActions)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span>Actions</span>
                  {showMobileActions ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {cashHoldersError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Failed to load cash holders</p>
                  <p className="text-sm text-red-700">{cashHoldersError}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {cashHoldersLoading && !cashHolders ? (
          <div className="w-full">
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
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
              ))}
            </div>
          </div>
        ) : cashHolders ? (
          <div className="w-full">
            {/* Analytics Cards Row */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CashAnalyticsCard
                title="Total Amount"
                value={stats.totalAmount}
                subtitle="Across all holders"
                icon={DollarSign}
                color="green"
              />

              <CashAnalyticsCard
                title="Total Holders"
                value={stats.totalHolders.toLocaleString()}
                subtitle="Registered accounts"
                icon={Users}
                color="blue"
              />

              <CashAnalyticsCard
                title="Transactions"
                value={stats.totalTransactions.toLocaleString()}
                subtitle="Total processed"
                icon={ArrowUpRight}
                color="purple"
              />
            </div>

            {/* Cash Holders Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 rounded-xl border border-gray-200 bg-white p-5"
            >
              {/* Header */}
              <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Wallet className="size-5 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Cash Holders Summary</h2>
                    <p className="text-sm text-gray-600">Top performers and distribution</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  Total: {stats.totalHolders.toLocaleString()}
                </span>
              </div>

              {/* Summary Content */}
              <div className="space-y-4">
                {/* Top Performer Card */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">Top Performer</h4>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                          Leading
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Name</span>
                          <span className="text-sm font-semibold text-gray-900">{stats.topHolder.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Amount</span>
                          <span className="text-sm font-semibold text-green-600">{stats.topHolder.amount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Transactions</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {stats.topHolder.transactions.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-gray-50 p-4 text-center">
                        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-blue-100">
                          <DollarSign className="size-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalAmount}</div>
                        <div className="mt-1 text-xs text-gray-500">Total Value</div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4 text-center">
                        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-purple-100">
                          <Users className="size-5 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalHolders}</div>
                        <div className="mt-1 text-xs text-gray-500">Active Holders</div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4 text-center">
                        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-emerald-100">
                          <ArrowUpRight className="size-5 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</div>
                        <div className="mt-1 text-xs text-gray-500">Transactions</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Cash Holders List */}
                <div className="rounded-lg bg-gray-100 p-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Recent Cash Holders</h4>
                  <div className="space-y-2">
                    {cashHoldersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="mr-2 size-4 animate-spin text-gray-400" />
                        <div className="text-sm text-gray-500">Loading cash holders...</div>
                      </div>
                    ) : cashHoldersError ? (
                      <div className="flex items-center justify-center py-8">
                        <AlertCircle className="mr-2 size-4 text-red-400" />
                        <div className="text-sm text-red-500">{cashHoldersError}</div>
                      </div>
                    ) : cashHolders.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <Wallet className="mr-2 size-4 text-gray-400" />
                        <div className="text-sm text-gray-500">No cash holders found</div>
                      </div>
                    ) : (
                      cashHolders.slice(0, 5).map((holder, index) => (
                        <div
                          key={holder.holderId}
                          className="flex items-center justify-between rounded-lg bg-white p-3 transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{holder.holderName}</div>
                              <div className="text-xs text-gray-500">{holder.holderType}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              ₦{holder.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">{holder.paymentCount} transactions</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Empty State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Wallet className="size-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Cash Holder Data</h3>
              <p className="mt-2 text-sm text-gray-500">No cash holder data available. Try refreshing the data.</p>
              <div className="mt-6">
                <button
                  onClick={handleRefreshData}
                  disabled={cashHoldersLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <RefreshCw className={`size-4 ${cashHoldersLoading ? "animate-spin" : ""}`} />
                  Refresh Data
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default CashHolders
