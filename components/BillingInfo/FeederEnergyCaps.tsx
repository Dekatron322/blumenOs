import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { BillsIcon, CycleIcon, DateIcon, RevenueGeneratedIcon, StatusIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearFeederEnergyCaps,
  FeederEnergyCap,
  fetchFeederEnergyCaps,
  setPagination,
} from "lib/redux/feederEnergyCapSlice"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface EnergyCapCycle {
  id: number
  name: string
  status: "Active" | "Expired" | "Pending"
  period: string
  feedersCount: string
  totalEnergyCap: string
  averageTariff: string
  appliedBy?: string
  appliedAt?: string
}

interface FeederEnergyCapsProps {
  onApplyNewCaps?: () => void
  onViewDetails?: (cycle: EnergyCapCycle) => void
}

const FeederEnergyCaps: React.FC<FeederEnergyCapsProps> = ({ onApplyNewCaps, onViewDetails }) => {
  const [searchText, setSearchText] = useState("")
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Get state from Redux store
  const { feederEnergyCaps, feederEnergyCapsLoading, feederEnergyCapsError, pagination, feederEnergyCapsSuccess } =
    useAppSelector((state) => state.feederEnergyCaps)

  console.log("Feeder Energy Caps State:", {
    capsCount: feederEnergyCaps?.length,
    loading: feederEnergyCapsLoading,
    error: feederEnergyCapsError,
    pagination,
    success: feederEnergyCapsSuccess,
  })

  // Fetch feeder energy caps on component mount and when pagination changes
  useEffect(() => {
    console.log("useEffect triggered - fetching feeder energy caps...")

    const fetchEnergyCaps = async () => {
      const requestParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
      }

      console.log("Dispatching fetchFeederEnergyCaps with params:", requestParams)

      const result = await dispatch(fetchFeederEnergyCaps(requestParams))

      console.log("Fetch result:", result)

      if (fetchFeederEnergyCaps.fulfilled.match(result)) {
        console.log("Feeder energy caps fetched successfully:", result.payload.data?.length)
      } else if (fetchFeederEnergyCaps.rejected.match(result)) {
        console.error("Failed to fetch feeder energy caps:", result.error)
      }
    }

    fetchEnergyCaps()
  }, [dispatch, pagination.currentPage, pagination.pageSize])

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text)
    // You can implement search filtering here if needed
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(clearFeederEnergyCaps())
  }

  const handleViewDetails = (cycle: EnergyCapCycle) => {
    router.push(`/billing/feeder-energy-caps/energy-cap-details/${cycle.id}`)
    onViewDetails?.(cycle)
  }

  // Transform API data to component format
  const transformCapsToCycles = (): EnergyCapCycle[] => {
    if (!feederEnergyCaps || feederEnergyCaps.length === 0) {
      console.log("No feeder energy caps to transform")
      return []
    }

    console.log("Transforming feeder energy caps to cycles, count:", feederEnergyCaps.length)

    // Group caps by period to create energy cap cycles
    const cyclesByPeriod = feederEnergyCaps.reduce(
      (acc, cap) => {
        const period = cap.period || "Unknown"
        if (!acc[period]) {
          acc[period] = {
            caps: [],
            totalEnergyCap: 0,
            feedersCount: new Set<number>(),
            totalTariff: 0,
          }
        }
        const periodData = acc[period]!
        periodData.caps.push(cap)
        periodData.totalEnergyCap += cap.energyCapKwh || 0
        periodData.feedersCount.add(cap.feederId)
        periodData.totalTariff += cap.tariffOverridePerKwh || 0
        return acc
      },
      {} as Record<
        string,
        {
          caps: FeederEnergyCap[]
          totalEnergyCap: number
          feedersCount: Set<number>
          totalTariff: number
        }
      >
    )

    console.log("Cycles by period:", cyclesByPeriod)

    // Transform to EnergyCapCycle format
    return Object.entries(cyclesByPeriod).map(([period, data], index) => {
      // Determine status based on period date
      let status: "Active" | "Expired" | "Pending" = "Active"
      try {
        const periodDate = new Date(period + "-01")
        const currentDate = new Date()
        const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

        if (period < currentPeriod) {
          status = "Expired"
        } else if (period > currentPeriod) {
          status = "Pending"
        }
      } catch {
        status = "Active"
      }

      const feedersCount = data.feedersCount.size
      const averageTariff = data.caps.length > 0 ? data.totalTariff / data.caps.length : 0

      // Format period for display
      let periodDate
      try {
        periodDate = new Date(period + "-01")
        if (isNaN(periodDate.getTime())) {
          periodDate = new Date()
        }
      } catch {
        periodDate = new Date()
      }

      const cycleName = `${periodDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} Energy Caps`

      return {
        id: data.caps[0]?.id || index + 1,
        name: cycleName,
        status,
        period,
        feedersCount: feedersCount.toLocaleString(),
        totalEnergyCap: data.totalEnergyCap > 0 ? `${(data.totalEnergyCap / 1000).toFixed(1)}M kWh` : "0 kWh",
        averageTariff: averageTariff > 0 ? `₦${averageTariff.toFixed(2)}` : "₦0.00",
        appliedBy: data.caps[0]?.capturedByName || "System",
        appliedAt: data.caps[0]?.capturedAtUtc,
      }
    })
  }

  const energyCapCycles = transformCapsToCycles()
  console.log("Transformed energy cap cycles:", energyCapCycles)

  // Only show fallback if no data and not loading
  const shouldShowFallback = !feederEnergyCapsLoading && energyCapCycles.length === 0

  // Fallback data if no API data
  const fallbackCycles: EnergyCapCycle[] = [
    {
      id: 1,
      name: "January 2024 Energy Caps",
      status: "Active",
      period: "2024-01",
      feedersCount: "1,250",
      totalEnergyCap: "45.2M kWh",
      averageTariff: "₦52.75",
      appliedBy: "Energy Manager",
      appliedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "February 2024 Energy Caps",
      status: "Pending",
      period: "2024-02",
      feedersCount: "0",
      totalEnergyCap: "Pending",
      averageTariff: "Pending",
    },
    {
      id: 3,
      name: "December 2023 Energy Caps",
      status: "Expired",
      period: "2023-12",
      feedersCount: "1,180",
      totalEnergyCap: "42.8M kWh",
      averageTariff: "₦50.25",
      appliedBy: "Energy Manager",
      appliedAt: "2023-12-01T00:00:00Z",
    },
  ]

  const displayCycles = shouldShowFallback ? fallbackCycles : energyCapCycles

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) {
        return "Invalid Date"
      }
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "Invalid Date"
    }
  }

  const formatPeriod = (period: string) => {
    try {
      const [year, month] = period.split("-")
      if (!year || !month) {
        return period
      }
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    } catch {
      return period
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Expired":
        return "bg-gray-100 text-gray-800"
      case "Pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCycleTypeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800"
      case "Expired":
        return "bg-purple-100 text-purple-800"
      case "Pending":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAmountColor = (amount: string) => {
    if (amount === "Pending" || amount === "0 kWh") {
      return "text-yellow-600"
    }
    return "text-green-600"
  }

  if (feederEnergyCapsLoading && energyCapCycles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-6"
      >
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">Feeder Energy Caps</h3>
              <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="animate-pulse rounded-lg border border-gray-200 bg-[#f9f9f9] p-4">
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="size-40 rounded bg-gray-200" />
                        <div className="h-5 w-20 rounded-full bg-gray-200" />
                        <div className="h-5 w-24 rounded-full bg-gray-200" />
                      </div>

                      <div className="size-48 rounded bg-gray-200" />
                      <div className="h-3 w-40 rounded bg-gray-200" />
                    </div>

                    <div className="space-y-1 text-right">
                      <div className="h-4 w-24 rounded bg-gray-200" />
                      <div className="h-3 w-20 rounded bg-gray-200" />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                    <div className="flex gap-2">
                      <div className="size-5 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-20 rounded bg-gray-200" />
                        <div className="h-4 w-24 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="size-5 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-20 rounded bg-gray-200" />
                        <div className="h-4 w-16 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="size-5 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-20 rounded bg-gray-200" />
                        <div className="h-4 w-16 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="size-5 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-24 rounded bg-gray-200" />
                        <div className="h-4 w-20 rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-80">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 h-6 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
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
      className="flex gap-6"
    >
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-black bg-opacity-80 p-4 text-xs text-white">
          <div>Feeder Energy Caps: {feederEnergyCaps?.length || 0}</div>
          <div>Loading: {feederEnergyCapsLoading ? "Yes" : "No"}</div>
          <div>Error: {feederEnergyCapsError || "None"}</div>
          <div>Using: {shouldShowFallback ? "Fallback Data" : "API Data"}</div>
        </div>
      )}

      {/* Left Column - Energy Cap Cycles */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Feeder Energy Caps</h3>
            <SearchModule
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by period or feeder..."
            />
            {feederEnergyCapsError && (
              <div className="mt-2 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-600">Error loading energy caps: {feederEnergyCapsError}</p>
              </div>
            )}
            {shouldShowFallback && (
              <div className="mt-2 rounded-lg bg-yellow-50 p-3">
                <p className="text-sm text-yellow-600">Showing sample data - no energy caps found</p>
              </div>
            )}
          </div>

          {/* Energy Cap Cycles List */}
          <div className="space-y-4">
            {displayCycles.map((cycle) => (
              <div
                key={cycle.id}
                className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 transition-shadow duration-200 hover:shadow-sm"
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="flex flex-1 flex-col">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex gap-3">
                        <DateIcon />
                        <h4 className="font-semibold text-gray-900">{cycle.name}</h4>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cycle.status)}`}>
                        {cycle.status}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCycleTypeColor(cycle.status)}`}>
                        Energy Caps
                      </span>
                    </div>

                    <p className="font-medium text-gray-900">Period: {formatPeriod(cycle.period)}</p>
                    <p className="text-sm text-gray-600">
                      {cycle.appliedBy ? `Applied by: ${cycle.appliedBy}` : "Pending application"}
                      {cycle.appliedAt && ` on ${formatDate(cycle.appliedAt)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="space-y-1 text-right text-sm">
                      <p className={`font-semibold ${getAmountColor(cycle.totalEnergyCap)}`}>{cycle.totalEnergyCap}</p>
                      <p className="text-gray-500">
                        {cycle.status === "Active" ? "Active" : cycle.status === "Expired" ? "Expired" : "Pending"}
                      </p>
                    </div>
                    <ButtonModule
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(cycle)}
                      icon={<VscEye className="size-4" />}
                      iconPosition="start"
                      className="bg-white"
                    >
                      View Details
                    </ButtonModule>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <BillsIcon />
                    <div>
                      <p className="text-gray-500">Feeders</p>
                      <p className={`font-medium ${getAmountColor(cycle.feedersCount)}`}>{cycle.feedersCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CycleIcon />
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p
                        className={`font-medium ${
                          cycle.status === "Active"
                            ? "text-green-600"
                            : cycle.status === "Expired"
                            ? "text-gray-600"
                            : "text-blue-600"
                        }`}
                      >
                        {cycle.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon />
                    <div>
                      <p className="text-gray-500">Avg Tariff</p>
                      <p
                        className={`font-medium ${
                          cycle.averageTariff === "Pending" ? "text-yellow-600" : "text-green-600"
                        }`}
                      >
                        {cycle.averageTariff}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RevenueGeneratedIcon />
                    <div>
                      <p className="text-gray-500">Total Cap</p>
                      <p className={`font-medium ${getAmountColor(cycle.totalEnergyCap)}`}>{cycle.totalEnergyCap}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{" "}
                {pagination.totalCount} cycles
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    dispatch(
                      setPagination({
                        page: pagination.currentPage - 1,
                        pageSize: pagination.pageSize,
                      })
                    )
                  }
                  disabled={!pagination.hasPrevious}
                  className={`rounded border px-3 py-1 ${
                    pagination.hasPrevious
                      ? "border-gray-300 bg-white hover:bg-gray-50"
                      : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    dispatch(
                      setPagination({
                        page: pagination.currentPage + 1,
                        pageSize: pagination.pageSize,
                      })
                    )
                  }
                  disabled={!pagination.hasNext}
                  className={`rounded border px-3 py-1 ${
                    pagination.hasNext
                      ? "border-gray-300 bg-white hover:bg-gray-50"
                      : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - System Overview */}
      <div className="w-80">
        <div className="space-y-6">
          {/* Energy Cap Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Energy Cap Actions</h3>
            <div className="space-y-3">
              <button
                className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm"
                onClick={onApplyNewCaps}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <svg className="size-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Apply New Caps</h4>
                    <p className="text-sm text-gray-600">Set new energy caps for feeders</p>
                  </div>
                </div>
              </button>

              <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <svg className="size-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Configure Templates</h4>
                    <p className="text-sm text-gray-600">Manage energy cap templates</p>
                  </div>
                </div>
              </button>

              <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <svg className="size-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Export Cap Data</h4>
                    <p className="text-sm text-gray-600">Download reports and data</p>
                  </div>
                </div>
              </button>

              <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2">
                    <svg className="size-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Review Caps</h4>
                    <p className="text-sm text-gray-600">Review and adjust caps</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Periods</span>
                <span className="font-semibold">{displayCycles.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="font-semibold text-green-600">
                  {displayCycles.filter((cycle) => cycle.status === "Active").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-semibold text-blue-600">
                  {displayCycles.filter((cycle) => cycle.status === "Pending").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expired</span>
                <span className="font-semibold text-gray-600">
                  {displayCycles.filter((cycle) => cycle.status === "Expired").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FeederEnergyCaps
