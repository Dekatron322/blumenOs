"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapIcon, PostpaidIcon, RateIcon, UserIcon } from "components/Icons/Icons"
import { MoreVertical } from "lucide-react"

// Skeleton Loader Components
const CommissionCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 shadow-sm sm:p-4"
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
    <div className="flex w-full items-start justify-between">
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200 sm:size-5"></div>
          <div className="h-5 w-32 rounded bg-gray-200 sm:w-40"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="ml-2 text-right">
        <div className="h-5 w-20 rounded bg-gray-200"></div>
        <div className="mt-1 flex items-center justify-end gap-1">
          <div className="size-3 rounded-full bg-gray-200"></div>
          <div className="h-3 w-12 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const MobileCommissionCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3"
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
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <div className="size-3 rounded-full bg-gray-200"></div>
          <div className="h-4 w-28 rounded bg-gray-200"></div>
        </div>
        <div className="mb-2 h-3 w-20 rounded bg-gray-200"></div>
      </div>
      <div className="ml-2 flex flex-col items-end gap-1">
        <div className="h-4 w-16 rounded bg-gray-200"></div>
        <div className="flex items-center gap-1">
          <div className="size-2 rounded-full bg-gray-200"></div>
          <div className="h-2 w-8 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
    <div className="mt-2 border-t pt-2">
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-2 w-12 rounded bg-gray-200"></div>
            <div className="h-3 w-8 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

const OverviewCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 shadow-sm sm:p-4"
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
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="size-8 rounded-full bg-gray-200 sm:size-10"></div>
      <div className="space-y-1">
        <div className="h-3 w-20 rounded bg-gray-200 sm:w-24"></div>
        <div className="h-4 w-16 rounded bg-gray-200 sm:h-5 sm:w-20"></div>
      </div>
    </div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="mb-4 sm:mb-6"
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
    <div className="h-6 w-48 rounded bg-gray-200 sm:h-7 sm:w-56"></div>
  </motion.div>
)

interface AgentCommission {
  id: number
  name: string
  location: string
  commissionAmount: string
  commissionRate: string
  collections: string
  transactions: number
  status: "paid" | "pending" | "processing"
}

const Commissions = () => {
  const [isMobileView, setIsMobileView] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Simulate loading state
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const agentCommissions: AgentCommission[] = [
    {
      id: 1,
      name: "Tunde Bakare",
      location: "Lagos Island",
      commissionAmount: "₦1,062.5",
      commissionRate: "2.5%",
      collections: "₦42,500",
      transactions: 420,
      status: "paid",
    },
    {
      id: 2,
      name: "Amina Abdullahi",
      location: "Ikeja",
      commissionAmount: "₦1,037.5",
      commissionRate: "2.5%",
      collections: "₦41,500",
      transactions: 380,
      status: "paid",
    },
    {
      id: 3,
      name: "Emeka Okonkwo",
      location: "Surulere",
      commissionAmount: "₦745",
      commissionRate: "2%",
      collections: "₦29,800",
      transactions: 315,
      status: "pending",
    },
  ]

  const commissionStats = {
    totalCommissions: "₦2.84M",
    paidOut: "₦2.12M",
    pendingPayment: "₦720K",
    agentCount: 48,
    averageRate: "2.3%",
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid",
          bg: "bg-green-100",
          text: "text-green-800",
          icon: "✅",
        }
      case "pending":
        return {
          label: "Pending",
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: "⏳",
        }
      case "processing":
        return {
          label: "Processing",
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: "🔄",
        }
      default:
        return {
          label: status,
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: "⚫",
        }
    }
  }

  // Desktop Commission Card
  const DesktopCommissionCard = ({ agent }: { agent: AgentCommission }) => {
    const statusConfig = getStatusConfig(agent.status)

    return (
      <motion.div
        key={agent.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 transition-all duration-200 hover:shadow-md"
        whileHover={{ y: -4 }}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-50">
              <UserIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{agent.name}</h4>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <MapIcon />
                  <p className="text-sm text-gray-600">{agent.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="size-1 rounded-full bg-gray-300"></div>
                  <p className="text-sm text-gray-600">{agent.transactions} transactions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{agent.commissionAmount}</p>
              <div className="flex items-center justify-end gap-1">
                <RateIcon />
                <p className="text-sm text-gray-500">{agent.commissionRate} rate</p>
              </div>
            </div>
            <button className="rounded-full p-1 hover:bg-gray-200">
              <MoreVertical className="size-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-4 border-t pt-3 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500">Collections</p>
            <p className="font-medium text-green-600">{agent.collections}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Rate</p>
            <p className="font-medium text-blue-600">{agent.commissionRate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Status</p>
            <p className={`font-medium ${statusConfig.text}`}>{statusConfig.label}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Mobile Commission Card
  const MobileCommissionCard = ({ agent }: { agent: AgentCommission }) => {
    const statusConfig = getStatusConfig(agent.status)

    return (
      <motion.div
        key={agent.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 transition-colors duration-200 hover:border-blue-300"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-50">
                <UserIcon />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-semibold text-gray-900">{agent.name}</h4>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <MapIcon />
                  <p className="text-xs text-gray-600">{agent.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-2 flex flex-col items-end gap-1">
            <p className="text-sm font-semibold text-gray-900">{agent.commissionAmount}</p>
            <div className="flex items-center gap-1">
              <RateIcon />
              <p className="text-xs text-gray-500">{agent.commissionRate}</p>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 border-t pt-2 text-xs">
          <div className="space-y-1">
            <p className="text-gray-500">Collections</p>
            <p className="text-sm font-medium text-green-600">{agent.collections}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Rate</p>
            <p className="text-sm font-medium text-blue-600">{agent.commissionRate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Transactions</p>
            <p className="text-sm font-medium text-gray-900">{agent.transactions}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Overview Card Component
  const OverviewCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
  }: {
    title: string
    value: string
    icon: React.ElementType
    color?: "blue" | "green" | "orange" | "purple"
  }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
      purple: "bg-purple-100 text-purple-600",
    }

    return (
      <motion.div
        className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md sm:p-4"
        whileHover={{ y: -3 }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`rounded-full p-2 ${colorClasses[color]}`}>
            <Icon className="size-4 sm:size-5" />
          </div>
          <div>
            <p className="text-xs text-gray-600 sm:text-sm">{title}</p>
            <p className="text-base font-semibold text-gray-900 sm:text-xl">{value}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="rounded-lg border bg-white p-4 sm:p-6">
          <HeaderSkeleton />

          {/* Overview Cards Skeleton */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
          </div>

          {/* Agent Commissions Skeleton */}
          <div className="space-y-3 sm:space-y-4">
            {isMobileView ? (
              <>
                <MobileCommissionCardSkeleton />
                <MobileCommissionCardSkeleton />
                <MobileCommissionCardSkeleton />
              </>
            ) : (
              <>
                <CommissionCardSkeleton />
                <CommissionCardSkeleton />
                <CommissionCardSkeleton />
              </>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Main Content - Commission Summary */}
      <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Commission Summary - January 2024</h3>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {agentCommissions.length} agents, {commissionStats.agentCount} total
          </p>
        </div>

        {/* Commission Overview Cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            title="Total Commissions"
            value={commissionStats.totalCommissions}
            icon={RateIcon}
            color="blue"
          />
          <OverviewCard title="Paid Out" value={commissionStats.paidOut} icon={PostpaidIcon} color="green" />
          <OverviewCard
            title="Pending Payment"
            value={commissionStats.pendingPayment}
            icon={PostpaidIcon}
            color="orange"
          />
          <OverviewCard title="Average Rate" value={commissionStats.averageRate} icon={RateIcon} color="purple" />
        </div>

        {/* Commission Summary Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 sm:text-sm">Total Agents</p>
              <p className="text-base font-semibold text-gray-900 sm:text-lg">{commissionStats.agentCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 sm:text-sm">Paid Agents</p>
              <p className="text-base font-semibold text-green-600 sm:text-lg">
                {agentCommissions.filter((a) => a.status === "paid").length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 sm:text-sm">Pending Agents</p>
              <p className="text-base font-semibold text-orange-600 sm:text-lg">
                {agentCommissions.filter((a) => a.status === "pending").length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 sm:text-sm">Payment Rate</p>
              <p className="text-base font-semibold text-blue-600 sm:text-lg">
                {Math.round(
                  (agentCommissions.filter((a) => a.status === "paid").length / agentCommissions.length) * 100
                )}
                %
              </p>
            </div>
          </div>
        </motion.div>

        {/* Agent Commissions List Header */}
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-900 sm:text-lg">Agent Commissions</h4>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm">
              Export
            </button>
            <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm">
              Pay All
            </button>
          </div>
        </div>

        {/* Agent Commissions List */}
        <div className="space-y-3 sm:space-y-4">
          {agentCommissions.map((agent) =>
            isMobileView ? (
              <MobileCommissionCard key={agent.id} agent={agent} />
            ) : (
              <DesktopCommissionCard key={agent.id} agent={agent} />
            )
          )}

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="pt-2"
          >
            <button className="w-full rounded-lg border border-gray-300 bg-white p-3 text-center hover:bg-gray-50 sm:p-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-gray-900 sm:text-base">View All Agents</span>
                <svg
                  className="size-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 hidden sm:block">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <RateIcon />
              </div>
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-gray-900 sm:text-base">Commission Notes</h5>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                • Commissions are calculated based on collection amounts
                <br className="hidden sm:block" />
                • Standard rate: 2.5% for most agents, 2% for trainees
                <br className="hidden sm:block" />• Payments processed on the 5th of each month
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Commissions
