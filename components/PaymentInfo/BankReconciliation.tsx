"use client"

import React, { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi"

const BankReconciliationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M5 7H15V9H5V7ZM5 11H12V13H5V11ZM5 15H9V17H5V15ZM14 11L17 14L14 17V11Z" fill="currentColor" />
  </svg>
)

interface ReconciliationStats {
  reconciledToday: string
  pendingMatch: string
  unmatchedItems: string
  bankCredits: {
    amount: string
    transactions: number
  }
  systemRecords: {
    amount: string
    transactions: number
  }
}

interface BankReconciliationProps {
  onViewDetails?: () => void
  onReconcileNow?: () => void
  onExportReport?: () => void
}

const BankReconciliation: React.FC<BankReconciliationProps> = ({ onViewDetails, onReconcileNow, onExportReport }) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [showMobileActions, setShowMobileActions] = useState(false)

  const reconciliationData: ReconciliationStats = {
    reconciledToday: "₦248.5M",
    pendingMatch: "₦2.1M",
    unmatchedItems: "₦450K",
    bankCredits: {
      amount: "₦251.1M",
      transactions: 2845,
    },
    systemRecords: {
      amount: "₦250.6M",
      transactions: 2830,
    },
  }

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
          <div className="text-blue-600">
            <BankReconciliationIcon />
          </div>
          <h2 className="text-base font-semibold md:text-lg lg:text-xl">Bank Reconciliation</h2>
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

            {showMobileActions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMobileActions(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg"
                >
                  <div className="p-2">
                    <button
                      onClick={() => {
                        onExportReport?.()
                        setShowMobileActions(false)
                      }}
                      className="mb-1 w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      Export Report
                    </button>
                    <button
                      onClick={() => {
                        onReconcileNow?.()
                        setShowMobileActions(false)
                      }}
                      className="w-full rounded-md bg-[#004B23] px-3 py-2 text-left text-sm text-white hover:bg-[#000000]"
                    >
                      Reconcile Now
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Desktop buttons */}
          <div className="hidden sm:flex sm:gap-2 md:gap-3">
            <button
              onClick={onExportReport}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 md:px-4 md:py-2 md:text-sm"
            >
              Export Report
            </button>
            <button
              onClick={onReconcileNow}
              className="rounded-md bg-[#004B23] px-3 py-1.5 text-xs text-white hover:bg-[#000000] md:px-4 md:py-2 md:text-sm"
            >
              Reconcile Now
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        <StatCard
          title="Reconciled Today"
          value={reconciliationData.reconciledToday}
          badge={
            <div className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-800 md:px-2 md:py-1">
              Completed
            </div>
          }
        />

        <StatCard
          title="Pending Match"
          value={reconciliationData.pendingMatch}
          badge={
            <div className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 md:px-2 md:py-1">
              Processing
            </div>
          }
        />

        <StatCard
          title="Unmatched Items"
          value={reconciliationData.unmatchedItems}
          badge={
            <div className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-800 md:px-2 md:py-1">
              Attention needed
            </div>
          }
        />
      </div>

      {/* Today's Reconciliation Summary */}
      <div className="rounded-lg border bg-[#F9F9F9] p-3 md:p-4 lg:p-6">
        <button
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="mb-3 flex w-full items-center justify-between md:mb-4"
          aria-expanded={isSummaryOpen}
        >
          <h3 className="text-base font-semibold md:text-lg">Today&apos;s Reconciliation Summary</h3>
          <span className="md:hidden">
            {isSummaryOpen ? <HiOutlineChevronUp className="size-4" /> : <HiOutlineChevronDown className="size-4" />}
          </span>
        </button>

        <AnimatePresence>
          {isSummaryOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-3 md:gap-4 lg:grid-cols-2 lg:gap-6">
                <SummaryCard
                  title="Bank Credits"
                  badge={
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 md:px-2 md:py-1">
                      Bank Side
                    </span>
                  }
                  amount={reconciliationData.bankCredits.amount}
                  transactions={reconciliationData.bankCredits.transactions}
                  color="text-blue-600"
                />

                <SummaryCard
                  title="System Records"
                  badge={
                    <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800 md:px-2 md:py-1">
                      System Side
                    </span>
                  }
                  amount={reconciliationData.systemRecords.amount}
                  transactions={reconciliationData.systemRecords.transactions}
                  color="text-purple-600"
                />
              </div>

              {/* Summary Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 md:mt-6 md:gap-4 md:pt-4">
                <MetricCard label="Difference" value="₦500K" color="text-orange-600" />
                <MetricCard label="Match Rate" value="99.2%" color="text-green-600" />
                <MetricCard label="Discrepancies" value="15 items" color="text-red-600" />
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

export default BankReconciliation
