"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import {
  CustomeraIcon,
  DateIcon,
  MapIcon,
  PerformanceIcon,
  RouteIcon,
  StatusIcon,
  UserIcon,
} from "components/Icons/Icons"

interface Route {
  id: number
  name: string
  assignedTo: string
  status: "active" | "needs attention"
  customers: number
  coverage: string
  lastVisit: string
}

interface RouteManagementProps {
  onStartNewCycle?: () => void
}

// Skeleton Loader Components
const RouteCardSkeleton = () => (
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
        </div>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 sm:gap-4">
      {[...Array(3)].map((_, i) => (
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

const MobileRouteCardSkeleton = () => (
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
        <div className="mt-1 h-4 w-24 rounded-full bg-gray-200"></div>
        <div className="mt-2 space-y-1">
          <div className="h-3 w-40 rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="ml-2">
        <div className="h-6 w-24 rounded-full bg-gray-200"></div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
      {[...Array(3)].map((_, i) => (
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

const RouteManagement: React.FC<RouteManagementProps> = ({ onStartNewCycle }) => {
  const [searchText, setSearchText] = useState("")
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

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const routes: Route[] = [
    {
      id: 1,
      name: "Victoria Island Commercial",
      assignedTo: "Tunde Bakare",
      status: "active",
      customers: 142,
      coverage: "95.8%",
      lastVisit: "2024-01-15",
    },
    {
      id: 2,
      name: "Ikeja Residential Block A",
      assignedTo: "Amina Abdullahi",
      status: "active",
      customers: 198,
      coverage: "88.4%",
      lastVisit: "2024-01-14",
    },
    {
      id: 3,
      name: "Surulere Mixed Zone",
      assignedTo: "Emeka Okonkwo",
      status: "needs attention",
      customers: 176,
      coverage: "72.1%",
      lastVisit: "2024-01-13",
    },
  ]

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchText.toLowerCase()) ||
      route.assignedTo.toLowerCase().includes(searchText.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: isMobileView ? undefined : "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          bg: "bg-green-100",
          text: "text-green-800",
          icon: "🟢",
        }
      case "needs attention":
        return {
          label: isMobileView ? "Needs Attn" : "Needs Attention",
          bg: "bg-red-100",
          text: "text-red-800",
          icon: "🔴",
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

  // Desktop Route Card
  const DesktopRouteCard = ({ route }: { route: Route }) => {
    const statusConfig = getStatusConfig(route.status)

    return (
      <motion.div
        key={route.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 transition-all duration-200 hover:shadow-md sm:p-4"
        whileHover={{ y: -4 }}
      >
        <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="text-gray-600">
                <RouteIcon />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{route.name}</h4>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <UserIcon />
                <p className="text-sm text-gray-600">
                  Assigned to: <span className="font-medium">{route.assignedTo}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-3 flex flex-wrap justify-between gap-3 border-t pt-3 text-xs sm:gap-4 sm:text-sm">
          <div className="flex items-center gap-2">
            <CustomeraIcon />
            <div>
              <p className="text-gray-500">Customers</p>
              <p className="font-medium text-green-600">{route.customers.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PerformanceIcon />
            <div>
              <p className="text-gray-500">Coverage</p>
              <p className={`font-medium ${route.status === "needs attention" ? "text-red-600" : "text-green-600"}`}>
                {route.coverage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DateIcon />
            <div>
              <p className="text-gray-500">Last Visit</p>
              <p className="font-medium text-green-600">{formatDate(route.lastVisit)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Mobile Route Card
  const MobileRouteCard = ({ route }: { route: Route }) => {
    const statusConfig = getStatusConfig(route.status)

    return (
      <motion.div
        key={route.id}
        className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 transition-colors duration-200 hover:border-blue-300"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-gray-600">
                <RouteIcon />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">{route.name}</h4>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <UserIcon />
              <p className="text-xs text-gray-600">
                Agent: <span className="font-medium">{route.assignedTo}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicators - Mobile */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
          <div className="flex items-center gap-1">
            <CustomeraIcon />
            <div>
              <p className="text-gray-500">Customers</p>
              <p className="text-sm font-medium text-green-600">{route.customers.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PerformanceIcon />
            <div>
              <p className="text-gray-500">Coverage</p>
              <p
                className={`font-medium ${
                  route.status === "needs attention" ? "text-red-600" : "text-green-600"
                } text-sm`}
              >
                {route.coverage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DateIcon />
            <div>
              <p className="text-gray-500">Last Visit</p>
              <p className="text-sm font-medium text-green-600">{formatDate(route.lastVisit)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <MapIcon />
            <div>
              <p className="text-gray-500">Status</p>
              <p className={`font-medium ${statusConfig.text} text-sm`}>{statusConfig.label}</p>
            </div>
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
          <div className="space-y-3 sm:space-y-4">
            {isMobileView ? (
              <>
                <MobileRouteCardSkeleton />
                <MobileRouteCardSkeleton />
                <MobileRouteCardSkeleton />
              </>
            ) : (
              <>
                <RouteCardSkeleton />
                <RouteCardSkeleton />
                <RouteCardSkeleton />
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
      {/* Main Content - Route Management */}
      <div className="rounded-lg border bg-white p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">Route Management</h3>
          <div className="w-full sm:w-96">
            <SearchModule
              placeholder="Search routes..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              className="w-full"
            />
          </div>
        </div>

        {/* Routes List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredRoutes.length === 0 && searchText ? (
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 text-center sm:p-6">
              <div className="flex flex-col items-center justify-center py-4 sm:py-8">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 sm:size-16">
                  <RouteIcon />
                </div>
                <h3 className="mt-3 text-base font-medium text-gray-900 sm:mt-4 sm:text-lg">No Routes Found</h3>
                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                  No routes match "{searchText}". Try a different search term.
                </p>
              </div>
            </div>
          ) : (
            filteredRoutes.map((route) =>
              isMobileView ? (
                <MobileRouteCard key={route.id} route={route} />
              ) : (
                <DesktopRouteCard key={route.id} route={route} />
              )
            )
          )}

          {/* Route Summary Stats */}
          {filteredRoutes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4"
            >
              <h4 className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">Route Summary</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 sm:text-sm">Total Routes</p>
                  <p className="text-lg font-semibold text-gray-900 sm:text-xl">{routes.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 sm:text-sm">Active Routes</p>
                  <p className="text-lg font-semibold text-green-600 sm:text-xl">
                    {routes.filter((r) => r.status === "active").length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 sm:text-sm">Total Customers</p>
                  <p className="text-lg font-semibold text-gray-900 sm:text-xl">
                    {routes.reduce((acc, route) => acc + route.customers, 0).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 sm:text-sm">Avg Coverage</p>
                  <p className="text-lg font-semibold text-green-600 sm:text-xl">
                    {(routes.reduce((acc, route) => acc + parseFloat(route.coverage), 0) / routes.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add New Route Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="pt-4"
          >
            <button
              onClick={onStartNewCycle}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center transition-colors hover:border-blue-300 hover:bg-blue-50 sm:p-6"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:size-12">
                  <svg
                    className="size-5 sm:size-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 sm:text-base">Add New Route</p>
                  <p className="text-xs text-gray-500 sm:text-sm">Create a new collection route</p>
                </div>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default RouteManagement
