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

const Performance = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Performance Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm"
          >
            {/* Agent Header */}
            <div className="mb-4 flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                <div className="flex items-center gap-2">
                  <MapIcon />
                  <p className="text-sm text-gray-600">{agent.location}</p>
                </div>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-700">{agent.targetPercentage}</p>
            </div>
            <div className="flex flex-col rounded-lg bg-[#F9F9F9] p-4">
              {/* Performance Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Target</span>
                  <span className="font-semibold text-gray-900">{agent.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Achieved</span>
                  <span className="font-semibold text-gray-900">{agent.achieved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customers</span>
                  <span className="font-semibold text-gray-900">{agent.customers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commission</span>
                  <span className="font-semibold text-gray-900">{agent.commission}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">Target Progress</span>
                  <span className="font-semibold text-gray-900">{agent.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(agent.progress)}`}
                    style={{ width: `${agent.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default Performance
