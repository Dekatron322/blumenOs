"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { BillsIcon, CycleIcon, DateIcon, RevenueGeneratedIcon, StatusIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
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

// Responsive Skeleton Components
const EnergyCapCardSkeleton = () => (
  <motion.div
    className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4"
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
          <div className="h-6 w-24 rounded-full bg-gray-200"></div>
        </div>
        <div className="space-y-1">
          <div className="h-4 w-56 rounded bg-gray-200 sm:w-64"></div>
          <div className="h-3 w-40 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
        <div className="h-5 w-20 rounded bg-gray-200"></div>
        <div className="h-3 w-16 rounded bg-gray-200"></div>
        <div className="h-9 w-24 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200 sm:size-5"></div>
          <div className="space-y-1">
            <div className="h-3 w-16 rounded bg-gray-200 sm:w-20"></div>
            <div className="h-4 w-12 rounded bg-gray-200 sm:w-16"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const MobileEnergyCapCardSkeleton = () => (
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
        <div className="h-4 w-16 rounded-full bg-gray-200"></div>
        <div className="h-8 w-20 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="size-3 rounded-full bg-gray-200"></div>
          <div className="space-y-1">
            <div className="h-2 w-12 rounded bg-gray-200"></div>
            <div className="h-3 w-8 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)

const PaginationSkeleton = () => (
  <motion.div
    className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row"
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
    <div className="order-2 h-4 w-40 rounded bg-gray-200 sm:order-1"></div>
    <div className="order-1 flex items-center gap-2 sm:order-2">
      <div className="size-8 rounded bg-gray-200"></div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="size-7 rounded bg-gray-200"></div>
        ))}
      </div>
      <div className="size-8 rounded bg-gray-200"></div>
    </div>
    <div className="order-3 hidden h-4 w-24 rounded bg-gray-200 sm:block"></div>
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
    <div className="mb-2 h-7 w-40 rounded bg-gray-200 sm:h-8 sm:w-48"></div>
    <div className="h-12 w-full rounded-lg bg-gray-200 sm:w-96"></div>
  </motion.div>
)

const FeederEnergyCaps: React.FC<FeederEnergyCapsProps> = ({ onApplyNewCaps, onViewDetails }) => {
  const [searchText, setSearchText] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Get state from Redux store
  const { feederEnergyCaps, feederEnergyCapsLoading, feederEnergyCapsError, pagination, feederEnergyCapsSuccess } =
    useAppSelector((state) => state.feederEnergyCaps)

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
        totalEnergyCap:
          data.totalEnergyCap > 0
            ? isMobileView
              ? `${(data.totalEnergyCap / 1000).toFixed(0)}M`
              : `${(data.totalEnergyCap / 1000).toFixed(1)}M kWh`
            : "0 kWh",
        averageTariff:
          averageTariff > 0
            ? isMobileView
              ? `₦${averageTariff.toFixed(0)}`
              : `₦${averageTariff.toFixed(2)}`
            : "₦0.00",
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
      totalEnergyCap: isMobileView ? "45M" : "45.2M kWh",
      averageTariff: isMobileView ? "₦53" : "₦52.75",
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
      totalEnergyCap: isMobileView ? "43M" : "42.8M kWh",
      averageTariff: isMobileView ? "₦50" : "₦50.25",
      appliedBy: "Energy Manager",
      appliedAt: "2023-12-01T00:00:00Z",
    },
  ]

  const displayCycles = shouldShowFallback ? fallbackCycles : energyCapCycles

  const totalPages = pagination.totalPages || 1
  const totalRecords = pagination.totalCount || displayCycles.length || 0

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      setPagination({
        page: 1,
        pageSize: newPageSize,
      })
    )
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      dispatch(
        setPagination({
          page,
          pageSize: pagination.pageSize,
        })
      )
    }
  }

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    items.push(1)

    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      items.push("...", current - 1, current, current + 1, "...")
    }

    if (!items.includes(total)) {
      items.push(total)
    }

    return items
  }

  const getMobilePageItems = (): (number | string)[] => {
    const total = totalPages
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 4) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) {
        return "Invalid Date"
      }
      const date = new Date(dateString)
      return isMobileView
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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
      return isMobileView
        ? date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
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

  const EnergyCapCard = ({ cycle }: { cycle: EnergyCapCycle }) => (
    <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 transition-shadow duration-200 hover:shadow-sm sm:p-4">
      <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="text-gray-600">
              <DateIcon />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{cycle.name}</h4>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cycle.status)}`}>
              {cycle.status}
            </span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCycleTypeColor(cycle.status)}`}>
              Energy Caps
            </span>
          </div>

          <p className="text-sm font-medium text-gray-900 sm:text-base">Period: {formatPeriod(cycle.period)}</p>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            {cycle.appliedBy ? `Applied by: ${cycle.appliedBy}` : "Pending application"}
            {cycle.appliedAt && ` on ${formatDate(cycle.appliedAt)}`}
          </p>
        </div>

        <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:gap-1">
          <p className={`text-sm font-semibold sm:text-base ${getAmountColor(cycle.totalEnergyCap)}`}>
            {cycle.totalEnergyCap}
          </p>
          <p className="text-xs text-gray-500 sm:text-sm">
            {cycle.status === "Active" ? "Active" : cycle.status === "Expired" ? "Expired" : "Pending"}
          </p>
          <ButtonModule
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(cycle)}
            icon={<VscEye className="size-3 sm:size-4" />}
            iconPosition="start"
            className="mt-1 bg-white text-xs sm:text-sm"
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
            <p className={`font-medium ${cycle.averageTariff === "Pending" ? "text-yellow-600" : "text-green-600"}`}>
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
  )

  const MobileEnergyCapCard = ({ cycle }: { cycle: EnergyCapCycle }) => (
    <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-gray-600">
              <DateIcon />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">{cycle.name}</h4>
          </div>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cycle.status)}`}
          >
            {cycle.status}
          </span>
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-gray-900">P: {formatPeriod(cycle.period)}</p>
            <p className="text-xs text-gray-600">
              {cycle.appliedBy ? `By: ${cycle.appliedBy}` : "Pending"}
              {cycle.appliedAt && ` ${formatDate(cycle.appliedAt)}`}
            </p>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCycleTypeColor(cycle.status)}`}>Caps</span>
          <ButtonModule
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(cycle)}
            icon={<VscEye />}
            iconPosition="start"
            className="bg-white text-xs"
          >
            View
          </ButtonModule>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
        <div className="flex items-center gap-1">
          <BillsIcon />
          <div>
            <p className="text-gray-500">Feeders</p>
            <p className={`font-medium ${getAmountColor(cycle.feedersCount)}`}>{cycle.feedersCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
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
              {cycle.status.charAt(0)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon />
          <div>
            <p className="text-gray-500">Tariff</p>
            <p className={`font-medium ${cycle.averageTariff === "Pending" ? "text-yellow-600" : "text-green-600"}`}>
              {cycle.averageTariff}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <RevenueGeneratedIcon />
          <div>
            <p className="text-gray-500">Cap</p>
            <p className={`font-medium ${getAmountColor(cycle.totalEnergyCap)} text-xs`}>{cycle.totalEnergyCap}</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (feederEnergyCapsLoading && energyCapCycles.length === 0) {
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
                <MobileEnergyCapCardSkeleton />
                <MobileEnergyCapCardSkeleton />
                <MobileEnergyCapCardSkeleton />
              </>
            ) : (
              <>
                <EnergyCapCardSkeleton />
                <EnergyCapCardSkeleton />
                <EnergyCapCardSkeleton />
              </>
            )}
          </div>

          <PaginationSkeleton />
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
      {/* Debug info - remove in production */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 hidden rounded-lg bg-black bg-opacity-80 p-2 text-xs text-white sm:block sm:p-4">
          <div>Feeder Energy Caps: {feederEnergyCaps?.length || 0}</div>
          <div>Loading: {feederEnergyCapsLoading ? "Yes" : "No"}</div>
          <div>Error: {feederEnergyCapsError || "None"}</div>
          <div>Using: {shouldShowFallback ? "Fallback Data" : "API Data"}</div>
        </div>
      )} */}

      {/* Main Content - Energy Cap Cycles */}
      <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">Feeder Energy Caps</h3>
          <div className="w-full sm:w-96">
            <SearchModule
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by period or feeder..."
              className="w-full"
            />
          </div>
          {feederEnergyCapsError && (
            <div className="mt-2 rounded-lg bg-red-50 p-2 sm:p-3">
              <p className="text-xs text-red-600 sm:text-sm">Error loading energy caps: {feederEnergyCapsError}</p>
            </div>
          )}
          {shouldShowFallback && (
            <div className="mt-2 rounded-lg bg-yellow-50 p-2 sm:p-3">
              <p className="text-xs text-yellow-600 sm:text-sm">Showing sample data - no energy caps found</p>
            </div>
          )}
        </div>

        {/* Energy Cap Cycles List */}
        <div className="space-y-3 sm:space-y-4">
          {displayCycles.map((cycle) =>
            isMobileView ? (
              <MobileEnergyCapCard key={cycle.id} cycle={cycle} />
            ) : (
              <EnergyCapCard key={cycle.id} cycle={cycle} />
            )
          )}
        </div>

        {/* Empty State */}
        {!feederEnergyCapsLoading && !feederEnergyCapsError && displayCycles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 sm:size-16">
                <CyclesIcon />
              </div>
              <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No Energy Caps Found</h3>
              <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                {searchText.trim() ? "Try adjusting your search criteria" : "No energy caps available"}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {displayCycles.length > 0 && totalPages > 1 && (
          <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t pt-4 sm:mt-6 sm:flex-row">
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-xs sm:text-sm">Show rows</p>
              <select
                value={pagination.pageSize}
                onChange={handleRowsChange}
                className="bg-[#F2F2F2] p-1 text-xs sm:text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                className={`px-2 py-1 sm:px-3 sm:py-2 ${
                  pagination.currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <BiSolidLeftArrow className="size-4 sm:size-5" />
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden items-center gap-1 sm:flex sm:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-xs sm:h-7 sm:w-8 sm:text-sm ${
                          pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => changePage(item)}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
                        {item}
                      </span>
                    )
                  )}
                </div>

                <div className="flex items-center gap-1 sm:hidden">
                  {getMobilePageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-xs ${
                          pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => changePage(item)}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-500">
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>

              <button
                className={`px-2 py-1 sm:px-3 sm:py-2 ${
                  pagination.currentPage === totalPages || totalPages === 0
                    ? "cursor-not-allowed text-gray-400"
                    : "text-[#000000]"
                }`}
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages || totalPages === 0}
              >
                <BiSolidRightArrow className="size-4 sm:size-5" />
              </button>
            </div>

            <p className="text-center text-xs text-gray-600 sm:text-right sm:text-sm">
              Page {pagination.currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()} total cycles)
              {searchText.trim() && " - filtered"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default FeederEnergyCaps
