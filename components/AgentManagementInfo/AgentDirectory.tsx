"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { SearchModule } from "components/ui/Search/search-module"
import {
  AddAgentIcon,
  BillsIcon,
  FloatIcon,
  MapIcon,
  PerformanceIcon,
  PhoneIcon,
  RateIcon,
  RouteIcon,
  TargetIcon,
  UserIcon,
} from "components/Icons/Icons"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { type Agent, clearAgents, fetchAgents } from "lib/redux/agentSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { EyeIcon } from "lucide-react"
import { VscEye } from "react-icons/vsc"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

// Skeleton Loader Components
const AgentCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 shadow-sm"
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
    <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
      <div className="flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="size-5 rounded-full bg-gray-200"></div>
          <div className="h-5 w-40 rounded bg-gray-200 sm:w-48"></div>
          <div className="h-6 w-20 rounded-full bg-gray-200"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-4 w-40 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
        <div className="h-5 w-24 rounded bg-gray-200"></div>
        <div className="h-3 w-16 rounded bg-gray-200"></div>
        <div className="h-9 w-24 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 sm:gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200 sm:size-5"></div>
          <div className="space-y-1">
            <div className="h-3 w-20 rounded bg-gray-200 sm:w-24"></div>
            <div className="h-4 w-16 rounded bg-gray-200 sm:w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const MobileAgentCardSkeleton = () => (
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
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200"></div>
          <div className="h-5 w-32 rounded bg-gray-200"></div>
        </div>
        <div className="mt-1 h-4 w-20 rounded-full bg-gray-200"></div>
        <div className="mt-2 space-y-1">
          <div className="h-3 w-40 rounded bg-gray-200"></div>
          <div className="h-3 w-32 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="ml-2 flex flex-col items-end gap-1">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
        <div className="h-8 w-20 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-gray-200"></div>
          <div className="space-y-1">
            <div className="h-2 w-16 rounded bg-gray-200"></div>
            <div className="h-3 w-12 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <motion.div
    className="mb-6"
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
    <div className="mb-2 h-7 w-40 rounded bg-gray-200 sm:h-8"></div>
    <div className="h-12 w-full rounded-lg bg-gray-200 sm:w-96"></div>
  </motion.div>
)

interface AgentDirectoryProps {
  onStartNewCycle?: () => void
}

const AgentDirectory: React.FC<AgentDirectoryProps> = ({ onStartNewCycle }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { agents, loading, error } = useAppSelector((state) => state.agents)
  const [searchText, setSearchText] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleCancelSearch = () => {
    setSearchText("")
  }

  useEffect(() => {
    dispatch(
      fetchAgents({
        pageNumber: 1,
        pageSize: 10,
      })
    )

    return () => {
      dispatch(clearAgents())
    }
  }, [dispatch])

  const filteredAgents: Agent[] = agents.filter((agent) => {
    if (!searchText.trim()) return true
    const search = searchText.toLowerCase()
    return (
      agent.user.fullName.toLowerCase().includes(search) ||
      agent.user.phoneNumber.toLowerCase().includes(search) ||
      agent.areaOfficeName.toLowerCase().includes(search) ||
      agent.serviceCenterName.toLowerCase().includes(search)
    )
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusConfig = (status: string, canCollectCash: boolean) => {
    const normalized = status.toLowerCase()
    if (normalized === "active") {
      return { label: "Active", bg: "bg-green-100", text: "text-green-800" }
    }
    if (normalized === "inactive") {
      return { label: "Inactive", bg: "bg-gray-100", text: "text-gray-800" }
    }
    return canCollectCash
      ? { label: "Active", bg: "bg-green-100", text: "text-green-800" }
      : { label: "Inactive", bg: "bg-gray-100", text: "text-gray-800" }
  }

  // Desktop Agent Card
  const DesktopAgentCard = ({ agent }: { agent: Agent }) => {
    const statusConfig = getStatusConfig(agent.status, agent.canCollectCash)
    const phone = agent.user.phoneNumber
    const location = agent.areaOfficeName || agent.serviceCenterName || "N/A"

    return (
      <div
        key={agent.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 transition-shadow duration-200 hover:shadow-sm"
      >
        <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="text-gray-600">
                <UserIcon />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{agent.user.fullName}</h4>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <PhoneIcon />
                <p className="text-sm text-gray-600">{phone}</p>
              </div>
              <div className="flex items-center gap-1">
                <MapIcon />
                <p className="text-sm text-gray-600">{location}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
            <p className="text-sm font-semibold text-gray-900 sm:text-base">{formatCurrency(agent.cashAtHand)}</p>
            <p className="text-xs text-gray-500 sm:text-sm">Cash at hand</p>
            <ButtonModule
              variant="outline"
              type="button"
              size="sm"
              onClick={() => router.push(`/agent-management/all-agents/agent-detail/${agent.id}`)}
              className="mt-1 bg-white text-xs sm:text-sm"
              icon={<VscEye className="size-3 sm:size-4" />}
              iconPosition="start"
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </ButtonModule>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 text-xs sm:gap-4 sm:text-sm">
          <div className="flex items-center gap-2">
            <BillsIcon />
            <div>
              <p className="text-gray-500">Collection limit</p>
              <p className="font-medium text-green-600">{formatCurrency(agent.cashCollectionLimit)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RateIcon />
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium text-green-600">{agent.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PerformanceIcon />
            <div>
              <p className="text-gray-500">Last collection</p>
              <p className="font-medium text-green-600">
                {agent.lastCashCollectionDate
                  ? new Date(agent.lastCashCollectionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile Agent Card
  const MobileAgentCard = ({ agent }: { agent: Agent }) => {
    const statusConfig = getStatusConfig(agent.status, agent.canCollectCash)
    const phone = agent.user.phoneNumber
    const location = agent.areaOfficeName || agent.serviceCenterName || "N/A"

    return (
      <div
        key={agent.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 transition-shadow duration-200 hover:shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-gray-600">
                <UserIcon />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">{agent.user.fullName}</h4>
            </div>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
            >
              {statusConfig.label}
            </span>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1">
                <PhoneIcon />
                <p className="text-xs text-gray-600">{phone}</p>
              </div>
              <div className="flex items-center gap-1">
                <MapIcon />
                <p className="text-xs text-gray-600">{location}</p>
              </div>
            </div>
          </div>
          <div className="ml-2 flex flex-col items-end gap-1">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900">{formatCurrency(agent.cashAtHand)}</p>
              <p className="text-[10px] text-gray-500">Cash at hand</p>
            </div>
            <ButtonModule
              variant="outline"
              type="button"
              size="sm"
              onClick={() => router.push(`/agent-management/all-agents/agent-detail/${agent.id}`)}
              className="bg-white text-xs"
              icon={<VscEye className="size-3" />}
              iconPosition="start"
            >
              View
            </ButtonModule>
          </div>
        </div>

        {/* Status Indicators - Mobile */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
          <div className="flex items-center gap-1">
            <BillsIcon />
            <div>
              <p className="text-gray-500">Limit</p>
              <p className="text-[10px] font-medium text-green-600">
                {agent.cashCollectionLimit > 1000000
                  ? `₦${(agent.cashCollectionLimit / 1000000).toFixed(1)}M`
                  : formatCurrency(agent.cashCollectionLimit)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <RateIcon />
            <div>
              <p className="text-gray-500">Status</p>
              <p className="text-[10px] font-medium text-green-600">{agent.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PerformanceIcon />
            <div>
              <p className="text-gray-500">Last collect</p>
              <p className="text-[10px] font-medium text-green-600">
                {agent.lastCashCollectionDate
                  ? new Date(agent.lastCashCollectionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FloatIcon />
            <div>
              <p className="text-gray-500">Float</p>
              <p className="text-[10px] font-medium text-blue-600">
                {agent.cashAtHand > 1000000
                  ? `₦${(agent.cashAtHand / 1000000).toFixed(1)}M`
                  : formatCurrency(agent.cashAtHand)}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && agents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="rounded-lg border bg-white p-4 sm:p-6">
          <HeaderSkeleton />

          <div className="space-y-3 sm:space-y-4">
            {isMobileView ? (
              <>
                <MobileAgentCardSkeleton />
                <MobileAgentCardSkeleton />
                <MobileAgentCardSkeleton />
              </>
            ) : (
              <>
                <AgentCardSkeleton />
                <AgentCardSkeleton />
                <AgentCardSkeleton />
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
      {/* Main Content - Agent Directory */}
      <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">Agent Directory</h3>
          <div className="w-full sm:w-96">
            <SearchModule
              placeholder="Search agents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              className="w-full"
            />
          </div>
          {error && (
            <div className="mt-2 rounded-lg bg-red-50 p-2 sm:p-3">
              <p className="text-xs text-red-600 sm:text-sm">Error loading agents: {error}</p>
            </div>
          )}
        </div>

        {/* Agents List */}
        <div className="space-y-3 sm:space-y-4">
          {loading && agents.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 text-center">
              <p className="text-sm text-gray-600">Loading more agents...</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center sm:p-4">
              <p className="text-sm text-red-700 sm:text-base">{error}</p>
            </div>
          )}

          {!loading && !error && filteredAgents.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 text-center">
              <div className="flex flex-col items-center justify-center py-4 sm:py-8">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 sm:size-16">
                  <UserIcon />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No Agents Found</h3>
                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                  {searchText.trim() ? "Try adjusting your search criteria" : "No agents available in the system"}
                </p>
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            filteredAgents.map((agent) =>
              isMobileView ? (
                <MobileAgentCard key={agent.id} agent={agent} />
              ) : (
                <DesktopAgentCard key={agent.id} agent={agent} />
              )
            )}
        </div>

        {/* Load More Button */}
        {!loading && filteredAgents.length > 0 && agents.length > filteredAgents.length && (
          <div className="mt-4 flex justify-center border-t pt-4">
            <ButtonModule
              variant="outline"
              size="sm"
              onClick={() => {
                // Load more agents logic
                console.log("Load more agents")
              }}
              className="text-sm"
            >
              Load More Agents
            </ButtonModule>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AgentDirectory
