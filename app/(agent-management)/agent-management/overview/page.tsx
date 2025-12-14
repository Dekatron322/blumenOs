"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  CustomeraIcon,
  MetersProgrammedIcon,
  PlayIcon,
  PlusIcon,
  TamperIcon,
  TokenGeneratedIcon,
  VendingIcon,
} from "components/Icons/Icons"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { ButtonModule } from "components/ui/Button/Button"
import AgentManagementInfo from "components/AgentManagementInfo/AgentManagementInfo"

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
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
          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
            <div className="size-6 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Skeleton for Customer Categories
const CategoriesSkeleton = () => {
  return (
    <div className="w-full rounded-md border bg-white p-5 lg:w-80">
      <div className="border-b pb-4">
        <div className="h-6 w-40 rounded bg-gray-200"></div>
      </div>

      <div className="mt-4 space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 rounded bg-gray-200"></div>
                <div className="h-5 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-6 rounded-lg bg-gray-50 p-3">
        <div className="mb-2 h-5 w-20 rounded bg-gray-200"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-4 w-12 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Skeleton for the table and grid view
const TableSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-80"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200 max-sm:w-20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-5 w-32 rounded bg-gray-200"></div>
                  <div className="mt-1 flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                    <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                  </div>
                </div>
              </div>
              <div className="size-6 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-gray-200"></div>
                  <div className="h-4 w-16 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// List View Skeleton
const ListSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-80"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200 max-sm:w-20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* List View Skeleton */}
      <div className="divide-y">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b bg-white p-4">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center">
                    <div className="h-5 w-40 rounded bg-gray-200"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                      <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 w-24 rounded bg-gray-200"></div>
                    ))}
                  </div>
                  <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-3 lg:w-auto">
                <div className="text-right">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 rounded bg-gray-200"></div>
                  <div className="size-6 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// Main Loading Component
const LoadingState = ({ showCategories = true }) => {
  return (
    <div className="relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
      {showCategories ? (
        <>
          <TableSkeleton />
          <CategoriesSkeleton />
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

// Generate mock agent data
const generateAgentData = () => {
  return {
    activeAgents: 48,
    collectionsToday: 7200000, // ₦7.2M in kobo
    targetAchievement: 85.2,
    lowFloatAlerts: 3,
  }
}

export default function AgentManagementDashboard() {
  const router = useRouter()
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agentData, setAgentData] = useState(generateAgentData())

  // Use mock data
  const { activeAgents, collectionsToday, targetAchievement, lowFloatAlerts } = agentData

  // Format currency
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(amount / 1000000) + "M"
    ) // Convert from kobo to millions
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleAddAgentSuccess = async () => {
    setIsAddAgentModalOpen(false)
    // Refresh data after adding agent
    setAgentData(generateAgentData())
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setAgentData(generateAgentData())
      setIsLoading(false)
    }, 1000)
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 lg:container sm:px-4 xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col items-start justify-between gap-4 py-4 sm:py-6 md:flex-row md:gap-6 lg:my-8">
              <div className="flex-1">
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">Agent Management</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Field agent onboarding, commissions, and performance tracking
                </p>
              </div>

              <motion.div
                className="flex items-center justify-start gap-3 md:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<PlusIcon />}
                  onClick={() => router.push("/agent-management/add-new-agent")}
                >
                  <span className="hidden sm:inline">Add New Agent</span>
                  <span className="sm:hidden">Add Agent</span>
                </ButtonModule>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full flex-col gap-6 lg:flex-row">
              <div className="w-full">
                {isLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State - Updated Agent Management Dashboard
                  <>
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-full">
                        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {/* Active Agents Card */}
                          <motion.div
                            className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                            whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          >
                            <div className="flex items-center gap-2 border-b pb-4">
                              <div className="text-blue-600">
                                <CustomeraIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">Active Agents</span>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <div className="flex w-full justify-between">
                                <p className="text-sm text-gray-600 sm:text-base">Total Active:</p>
                                <p className="text-secondary text-lg font-bold sm:text-xl">
                                  {formatNumber(activeAgents)}
                                </p>
                              </div>
                              <div className="flex w-full justify-between">
                                <p className="text-sm text-gray-600 sm:text-base">Status:</p>
                                <div className="flex items-center gap-1">
                                  <div className="size-2 rounded-full bg-green-500"></div>
                                  <p className="text-secondary text-sm font-medium sm:text-base">All Active</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* Collections Today Card */}
                          <motion.div
                            className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                            whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          >
                            <div className="flex items-center gap-2 border-b pb-4">
                              <div className="text-green-600">
                                <MetersProgrammedIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">Collections Today</span>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <div className="flex w-full justify-between">
                                <p className="text-sm text-gray-600 sm:text-base">Amount:</p>
                                <p className="text-secondary text-lg font-bold sm:text-xl">
                                  {formatCurrency(collectionsToday)}
                                </p>
                              </div>
                              <div className="flex w-full justify-between">
                                <p className="text-sm text-gray-600 sm:text-base">Trend:</p>
                                <p className="text-secondary text-sm font-medium sm:text-base">
                                  <span className="text-green-500">↑ 8%</span>{" "}
                                  <span className="hidden sm:inline">from yesterday</span>
                                </p>
                              </div>
                            </div>
                          </motion.div>

                          {/* Target Achievement Card */}
                          <motion.div
                            className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                            whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          >
                            <div className="flex items-center gap-2 border-b pb-4">
                              <div className="text-green-600">
                                <VendingIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">Target Achievement</span>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <div className="flex w-full justify-between">
                                <p className="text-sm text-gray-600 sm:text-base">Achievement Rate:</p>
                                <p className="text-secondary text-lg font-bold sm:text-xl">{targetAchievement}%</p>
                              </div>
                              <div className="flex w-full justify-between">
                                <p className="text-sm text-gray-600 sm:text-base">Status:</p>
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`size-2 rounded-full ${
                                      targetAchievement >= 90
                                        ? "bg-green-500"
                                        : targetAchievement >= 80
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  <p className="text-secondary text-sm font-medium sm:text-base">
                                    {targetAchievement >= 90
                                      ? "Excellent"
                                      : targetAchievement >= 80
                                      ? "Good"
                                      : "Needs Attention"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* Low Float Alerts Card */}
                          <motion.div
                            className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                            whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          >
                            <div className="flex items-center gap-2 border-b pb-4">
                              <div className="text-red-600">
                                <TamperIcon />
                              </div>
                              <span className="text-sm font-medium sm:text-base">Low Float Alerts</span>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <div className="flex w-full justify-between">
                                <p className="text-sm text-gray-600 sm:text-base">Active Alerts:</p>
                                <div className="flex items-center gap-1">
                                  <p className="text-secondary text-lg font-bold sm:text-xl">
                                    {formatNumber(lowFloatAlerts)}
                                  </p>
                                  <ArrowIcon className="size-4" />
                                </div>
                              </div>
                              <div className="flex w-full justify-between">
                                <p className="text-sm text-gray-600 sm:text-base">Priority:</p>
                                <p className="text-secondary text-sm font-medium sm:text-base">
                                  <span className="text-red-500">High</span>{" "}
                                  <span className="hidden sm:inline">- Requires Action</span>
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <AgentManagementInfo />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onRequestClose={() => setIsAddAgentModalOpen(false)}
        onSuccess={handleAddAgentSuccess}
      />
    </section>
  )
}
