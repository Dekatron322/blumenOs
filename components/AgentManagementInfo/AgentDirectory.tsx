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

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface AgentDirectoryProps {
  onStartNewCycle?: () => void
}

const AgentDirectory: React.FC<AgentDirectoryProps> = ({ onStartNewCycle }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { agents, loading, error } = useAppSelector((state) => state.agents)
  const [searchText, setSearchText] = useState("")

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
      return { label: "active", bg: "bg-green-100", text: "text-green-800" }
    }
    if (normalized === "inactive") {
      return { label: "inactive", bg: "bg-gray-100", text: "text-gray-800" }
    }
    return canCollectCash
      ? { label: "active", bg: "bg-green-100", text: "text-green-800" }
      : { label: "inactive", bg: "bg-gray-100", text: "text-gray-800" }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Agent Directory */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Agent Directory</h3>
            <SearchModule
              placeholder="Search agents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
            />
          </div>

          {/* Agents List */}
          <div className="space-y-4">
            {loading && (
              <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 text-sm text-gray-600">
                Loading agents...
              </div>
            )}

            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            {!loading && !error && filteredAgents.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 text-sm text-gray-600">
                No agents found.
              </div>
            )}

            {!loading &&
              !error &&
              filteredAgents.map((agent) => {
                const statusConfig = getStatusConfig(agent.status, agent.canCollectCash)
                const phone = agent.user.phoneNumber
                const location = agent.areaOfficeName || agent.serviceCenterName || "N/A"

                return (
                  <div key={agent.id} className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <UserIcon />
                            <h4 className="font-semibold text-gray-900">{agent.user.fullName}</h4>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <PhoneIcon />
                            <p className="mt-1 text-sm text-gray-600">{phone}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapIcon />
                            <p className="text-sm text-gray-600">{location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{formatCurrency(agent.cashAtHand)}</p>
                          <p className="text-gray-500">Cash at hand</p>
                        </div>
                        <div className="flex justify-end">
                          <ButtonModule
                            variant="outline"
                            type="button"
                            size="sm"
                            onClick={() => router.push(`/agent-management/all-agents/agent-detail/${agent.id}`)}
                          >
                            View details
                          </ButtonModule>
                        </div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <BillsIcon />
                          <p className="text-gray-500">Collection limit:</p>
                        </div>
                        <p className="font-medium text-green-600">{formatCurrency(agent.cashCollectionLimit)}</p>
                      </div>
                      <div>
                        <div className="flex gap-2">
                          <RateIcon />
                          <div>
                            <p className="text-gray-500">Status:</p>
                            <p className="font-medium text-green-600">{agent.status}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <PerformanceIcon />
                        <div>
                          <p className="text-gray-500">Last cash collection:</p>
                          <p className="font-medium text-green-600">{agent.lastCashCollectionDate || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AgentDirectory
