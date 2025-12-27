"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { CashHolder, fetchCashHolders } from "lib/redux/paymentSlice"

const CashHoldersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M5 7H15V9H5V7ZM5 11H12V13H5V11ZM5 15H9V17H5V15ZM14 11L17 14L14 17V11Z" fill="currentColor" />
  </svg>
)

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

  const StatCard = ({ title, value, badge }: { title: string; value: string; badge: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border bg-[#F9F9F9] p-3 md:p-4 lg:p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-500 md:text-sm">{title}</h3>
        {badge}
      </div>
      <p className="mt-1 text-lg font-bold md:mt-2 md:text-xl lg:text-2xl">{value}</p>
    </motion.div>
  )

  const SummaryCard = ({
    title,
    badge,
    amount,
    transactions,
    color,
  }: {
    title: string
    badge: React.ReactNode
    amount: string
    transactions: number
    color: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-3 rounded-lg bg-white p-3 md:p-4 lg:p-6"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 md:text-base">{title}</h4>
        {badge}
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-gray-500 md:text-sm">Amount:</span>
          <span className="text-sm font-semibold md:text-base">{amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500 md:text-sm">Transactions:</span>
          <span className={`text-sm font-semibold md:text-base ${color}`}>{transactions.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  )

  const MetricCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <div className="text-center">
      <div className="text-xs text-gray-500 md:text-sm">{label}</div>
      <div className={`text-sm font-semibold md:text-base lg:text-lg ${color}`}>{value}</div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 bg-white p-3 md:space-y-6 md:p-4 lg:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="text-base font-semibold md:text-lg lg:text-xl">Cash Holders</h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {/* Mobile actions dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="flex w-full items-center justify-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <span>Actions</span>
              {showMobileActions ? (
                <HiOutlineChevronUp className="size-3" />
              ) : (
                <HiOutlineChevronDown className="size-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        <StatCard
          title="Total Amount"
          value={stats.totalAmount}
          badge={
            <div className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-800 md:px-2 md:py-1">Active</div>
          }
        />

        <StatCard
          title="Total Holders"
          value={stats.totalHolders.toLocaleString()}
          badge={
            <div className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 md:px-2 md:py-1">
              Registered
            </div>
          }
        />

        <StatCard
          title="Transactions"
          value={stats.totalTransactions.toLocaleString()}
          badge={
            <div className="rounded-full bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800 md:px-2 md:py-1">
              Total
            </div>
          }
        />
      </div>

      {/* Cash Holders Summary */}
      <div className="rounded-lg border bg-[#F9F9F9] p-3 md:p-4 lg:p-6">
        <button
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="mb-3 flex w-full items-center justify-between md:mb-4"
          aria-expanded={isSummaryOpen}
        >
          <h3 className="text-base font-semibold md:text-lg">Cash Holders Summary</h3>
          <span className="md:hidden">
            {isSummaryOpen ? <HiOutlineChevronUp className="size-4" /> : <HiOutlineChevronDown className="size-4" />}
          </span>
        </button>

        <AnimatePresence>
          {isSummaryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden md:space-y-6"
            >
              {/* Top Holder Summary */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SummaryCard
                  title="Top Holder"
                  badge={<div className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Leading</div>}
                  amount={stats.topHolder.amount}
                  transactions={stats.topHolder.transactions}
                  color="text-green-600"
                />

                <div className="rounded-lg bg-white p-4 md:p-6">
                  <h4 className="mb-4 text-sm font-medium text-gray-700 md:text-base">Distribution</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                      label="Average per Holder"
                      value={`₦${
                        cashHolders.length > 0
                          ? (
                              cashHolders.reduce((sum, h) => sum + h.totalAmount, 0) /
                              cashHolders.length /
                              1000000
                            ).toFixed(1)
                          : 0
                      }M`}
                      color="text-blue-600"
                    />
                    <MetricCard
                      label="Avg Transactions"
                      value={
                        cashHolders.length > 0
                          ? Math.round(
                              cashHolders.reduce((sum, h) => sum + h.paymentCount, 0) / cashHolders.length
                            ).toString()
                          : "0"
                      }
                      color="text-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Cash Holders List */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h4 className="mb-4 text-sm font-medium text-gray-700">All Cash Holders</h4>
                <div className="space-y-3">
                  {cashHoldersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">Loading cash holders...</div>
                    </div>
                  ) : cashHoldersError ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-red-500">{cashHoldersError}</div>
                    </div>
                  ) : cashHolders.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">No cash holders found</div>
                    </div>
                  ) : (
                    cashHolders.slice(0, 5).map((holder, index) => (
                      <div
                        key={holder.holderId}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Details Button - Mobile only */}
      <div className="sm:hidden">
        <button
          onClick={onViewDetails}
          className="w-full rounded-md border border-[#004B23] bg-white px-4 py-2.5 text-sm text-[#004B23] hover:bg-[#F9F9F9]"
        >
          View All Details
        </button>
      </div>
    </motion.div>
  )
}

export default CashHolders
