"use client"

import React from "react"
import { motion } from "framer-motion"
import AgentClearanceTable from "components/Tables/AgentClearanceTable"
import { useAppSelector } from "lib/hooks/useRedux"
import DashboardNav from "components/Navbar/DashboardNav"
import { CashClearanceStatus } from "lib/redux/agentSlice"

const ViewCashClearanceHistoryPage: React.FC = () => {
  const { agent } = useAppSelector((state) => state.auth)
  const { clearances } = useAppSelector((state) => state.agents)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate statistics from Redux state
  const totalAmount = clearances.reduce((sum, c) => sum + c.amountCleared, 0)
  const approvedCount = clearances.filter((c) => c.status === CashClearanceStatus.Approved).length
  const pendingCount = clearances.filter((c) => c.status === CashClearanceStatus.Pending).length
  const declinedCount = clearances.filter((c) => c.status === CashClearanceStatus.Declined).length
  const approvedWithConditionCount = clearances.filter(
    (c) => c.status === CashClearanceStatus.ApprovedWithCondition
  ).length
  const totalCount = clearances.length

  // If for some reason we don't have an agent in auth state, show a friendly message
  if (!agent) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-md border bg-white p-6 text-center text-sm text-gray-700">
          <p className="font-medium">We couldn&apos;t find your agent profile.</p>
          <p className="mt-2 text-xs text-gray-500">
            Please sign in as a sales representative again or contact support if this problem continues.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <DashboardNav />
      <div className="flex w-full">
        <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-4 lg:px-6 2xl:px-16">
          {/* Hero Header Section */}
          <motion.div
            className="relative mb-6 mt-4 overflow-hidden rounded-xl bg-gradient-to-r from-[#004B23] to-[#006B33] p-4 shadow-lg md:p-6 lg:p-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/20" />
              <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/10" />
              <div className="absolute right-1/4 top-1/2 size-20 rounded-full bg-white/10" />
            </div>

            {/* Header Content */}
            <div className="relative z-10">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">Cash Clearance History</h1>
                  <p className="mt-1 text-sm text-white/80 md:text-base">Overview of all cash clearance records</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span className="flex size-2 animate-pulse rounded-full bg-emerald-400" />
                  Live data
                </div>
              </div>

              {/* Statistics Cards - rendered directly from Redux state */}
              <motion.div
                className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {/* Total Amount Card */}
                <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                  <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/5 transition-transform group-hover:scale-110" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                        <span className="text-sm">₦</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total Cleared</p>
                    <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">
                      {formatCurrency(totalAmount)}
                    </p>
                    <p className="mt-1 text-xs text-white/60">{totalCount} clearances</p>
                  </div>
                </div>

                {/* Approved Card */}
                <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                  <div className="absolute -right-4 -top-4 size-16 rounded-full bg-emerald-400/10 transition-transform group-hover:scale-110" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/20">
                        <span className="text-sm text-emerald-300">✓</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/70">Approved</p>
                    <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{approvedCount}</p>
                    <p className="mt-1 text-xs text-emerald-300/80">
                      {totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : 0}% approval rate
                    </p>
                  </div>
                </div>

                {/* Pending Card */}
                <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                  <div className="absolute -right-4 -top-4 size-16 rounded-full bg-amber-400/10 transition-transform group-hover:scale-110" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20">
                        <span className="text-sm text-amber-300">⏳</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/70">Pending</p>
                    <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{pendingCount}</p>
                    <p className="mt-1 text-xs text-amber-300/80">Awaiting approval</p>
                  </div>
                </div>

                {/* Declined Card */}
                <div className="group relative overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5">
                  <div className="absolute -right-4 -top-4 size-16 rounded-full bg-red-400/10 transition-transform group-hover:scale-110" />
                  <div className="relative">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-red-400/20">
                        <span className="text-sm text-red-300">✕</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/70">Declined</p>
                    <p className="mt-1 text-lg font-bold text-white md:text-xl lg:text-2xl">{declinedCount}</p>
                    <p className="mt-1 text-xs text-red-300/80">
                      {approvedWithConditionCount > 0
                        ? `+${approvedWithConditionCount} with conditions`
                        : "Requires review"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Content - Single AgentClearanceTable instance */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-md border bg-white p-3 md:p-5"
          >
            <AgentClearanceTable agentId={agent.id} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ViewCashClearanceHistoryPage
