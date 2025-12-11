"use client"

import React from "react"
import { motion } from "framer-motion"
import { MapIcon } from "components/Icons/Icons"

interface AgentPerformance {
  id: number
  name: string
  location: string
  targetPercentage: string
  target: string
  achieved: string
  customers: number
  commission: string
  progress: number
}

// Skeleton Loader Components
const PerformanceCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6"
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
    {/* Agent Header Skeleton */}
    <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row">
      <div className="flex-1">
        <div className="mb-2 h-6 w-32 rounded bg-gray-200 sm:h-7"></div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200"></div>
          <div className="h-4 w-24 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="h-5 w-28 rounded bg-gray-200 sm:w-32"></div>
    </div>

    {/* Metrics Skeleton */}
    <div className="rounded-lg bg-[#F9F9F9] p-3 sm:p-4">
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-20 rounded bg-gray-200"></div>
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mt-4">
        <div className="mb-2 flex justify-between">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-4 w-8 rounded bg-gray-200"></div>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 w-3/4 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const MobilePerformanceCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-white p-3"
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
    {/* Agent Header Skeleton */}
    <div className="mb-3 flex justify-between">
      <div className="flex-1">
        <div className="mb-1 h-5 w-28 rounded bg-gray-200"></div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-gray-200"></div>
          <div className="h-3 w-20 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="h-4 w-20 rounded bg-gray-200"></div>
    </div>

    {/* Metrics Skeleton */}
    <div className="rounded-lg bg-[#F9F9F9] p-3">
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-16 rounded bg-gray-200"></div>
            <div className="h-4 w-12 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mt-3">
        <div className="mb-1 flex justify-between">
          <div className="h-3 w-16 rounded bg-gray-200"></div>
          <div className="h-3 w-6 rounded bg-gray-200"></div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200">
          <div className="h-1.5 w-2/3 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

const Performance = () => {
  const [isMobileView, setIsMobileView] = React.useState(false)

  // Check for mobile view
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768) // Changed to 768 for tablet consideration
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const agents: AgentPerformance[] = [
    {
      id: 1,
      name: "Tunde Bakare",
      location: "Lagos Island",
      targetPercentage: "85% of target",
      target: "₦50,000",
      achieved: "₦42,500",
      customers: 420,
      commission: "₦1,062.5",
      progress: 85,
    },
    {
      id: 2,
      name: "Amina Abdullahi",
      location: "Ikeja",
      targetPercentage: "92.2% of target",
      target: "₦45,000",
      achieved: "₦41,500",
      customers: 380,
      commission: "₦1,037.5",
      progress: 92.2,
    },
    {
      id: 3,
      name: "Emeka Okonkwo",
      location: "Surulere",
      targetPercentage: "78.4% of target",
      target: "₦38,000",
      achieved: "₦29,800",
      customers: 315,
      commission: "₦745",
      progress: 78.4,
    },
  ]

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500"
    if (progress >= 80) return "bg-blue-500"
    if (progress >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getProgressLabel = (progress: number) => {
    if (progress >= 90) return "Excellent"
    if (progress >= 80) return "Good"
    if (progress >= 70) return "Average"
    return "Needs Improvement"
  }

  // Desktop Performance Card
  const DesktopPerformanceCard = ({ agent }: { agent: AgentPerformance }) => (
    <motion.div
      key={agent.id}
      className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md sm:p-6"
      whileHover={{ y: -4 }}
    >
      {/* Agent Header */}
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{agent.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <MapIcon />
            <p className="text-sm text-gray-600">{agent.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-700 sm:text-base">{agent.targetPercentage}</p>
          <span
            className={`hidden rounded-full px-2 py-1 text-xs font-medium sm:block ${getProgressColor(
              agent.progress
            )}/10 ${getProgressColor(agent.progress).replace("bg-", "text-")}`}
          >
            {getProgressLabel(agent.progress)}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-[#F9F9F9] p-3 sm:p-4">
        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Target</span>
            <span className="text-sm font-semibold text-gray-900 sm:text-base">{agent.target}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Achieved</span>
            <span className="text-sm font-semibold text-gray-900 sm:text-base">{agent.achieved}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Customers</span>
            <span className="text-sm font-semibold text-gray-900 sm:text-base">{agent.customers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Commission</span>
            <span className="text-sm font-semibold text-gray-900 sm:text-base">{agent.commission}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">Target Progress</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{agent.progress}%</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-medium sm:hidden ${getProgressColor(
                  agent.progress
                )}/10 ${getProgressColor(agent.progress).replace("bg-", "text-")}`}
              >
                {getProgressLabel(agent.progress)}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${getProgressColor(agent.progress)}`}
              style={{ width: `${agent.progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  // Mobile Performance Card
  const MobilePerformanceCard = ({ agent }: { agent: AgentPerformance }) => (
    <motion.div
      key={agent.id}
      className="rounded-lg border border-gray-200 bg-white p-3 transition-colors duration-200 hover:border-blue-300"
      whileTap={{ scale: 0.98 }}
    >
      {/* Agent Header */}
      <div className="mb-3 flex justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{agent.name}</h3>
          <div className="mt-1 flex items-center gap-1">
            <MapIcon />
            <p className="text-xs text-gray-600">{agent.location}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xs font-semibold text-gray-700">{agent.targetPercentage}</p>
          <span
            className={`mt-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getProgressColor(
              agent.progress
            )}/10 ${getProgressColor(agent.progress).replace("bg-", "text-")}`}
          >
            {getProgressLabel(agent.progress)}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-[#F9F9F9] p-3">
        {/* Performance Metrics - Grid Layout for Mobile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-sm font-semibold text-gray-900">{agent.target}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Achieved</p>
            <p className="text-sm font-semibold text-gray-900">{agent.achieved}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Customers</p>
            <p className="text-sm font-semibold text-gray-900">{agent.customers.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Commission</p>
            <p className="text-sm font-semibold text-gray-900">{agent.commission}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="mb-1 flex justify-between">
            <p className="text-xs text-gray-500">Progress</p>
            <p className="text-xs font-semibold text-gray-900">{agent.progress}%</p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className={`h-1.5 rounded-full ${getProgressColor(agent.progress)}`}
              style={{ width: `${agent.progress}%` }}
            ></div>
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  // Loading state (optional - can be controlled by parent)
  const isLoading = false // Set this based on your actual loading state

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <React.Fragment key={index}>
              {isMobileView ? <MobilePerformanceCardSkeleton /> : <PerformanceCardSkeleton />}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Performance Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) =>
          isMobileView ? (
            <MobilePerformanceCard key={agent.id} agent={agent} />
          ) : (
            <DesktopPerformanceCard key={agent.id} agent={agent} />
          )
        )}
      </div>

      {/* Performance Summary Stats (Optional - for larger screens) */}
      <div className="hidden lg:block">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">Performance Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Average Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.round(agents.reduce((acc, agent) => acc + agent.progress, 0) / agents.length)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Total Customers</p>
              <p className="text-lg font-semibold text-gray-900">
                {agents.reduce((acc, agent) => acc + agent.customers, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Total Commission</p>
              <p className="text-lg font-semibold text-gray-900">
                ₦
                {agents
                  .reduce((acc, agent) => acc + parseFloat(agent.commission.replace("₦", "").replace(",", "")), 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Summary Stats */}
      <div className="lg:hidden">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h4 className="mb-2 text-xs font-semibold text-gray-900">Summary</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Avg Progress</p>
              <p className="text-sm font-semibold text-gray-900">
                {Math.round(agents.reduce((acc, agent) => acc + agent.progress, 0) / agents.length)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Customers</p>
              <p className="text-sm font-semibold text-gray-900">
                {agents.reduce((acc, agent) => acc + agent.customers, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500">Commission</p>
              <p className="text-xs font-semibold text-gray-900">
                ₦
                {agents
                  .reduce((acc, agent) => acc + parseFloat(agent.commission.replace("₦", "").replace(",", "")), 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Performance
