"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchMetersSummary } from "lib/redux/metersSlice"
import MeteringInfo from "components/MeteringInfo/MeteringInfo"
import {
  Activity,
  AlertCircle,
  BarChart3,
  Battery,
  Building2,
  CheckCircle,
  Clock,
  Cpu,
  Factory,
  FileText,
  Home,
  Layers,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import { VscAdd } from "react-icons/vsc"

// Interface for category data
interface CategoryData {
  name: string
  description: string
  count: number
  active: number
  inactive: number
  percentage: number
  color: string
  icon: any
}

// Dropdown Popover Component (redesigned)
const DropdownPopover = ({
  options,
  selectedValue,
  onSelect,
  children,
}: {
  options: { value: number; label: string }[]
  selectedValue: number
  onSelect: (value: number) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {children}
        <svg
          className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSelect(option.value)
                    setIsOpen(false)
                  }}
                  className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
                    option.value === selectedValue
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Modern Analytics Card Component
const AnalyticsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  trendValue,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color?: "blue" | "green" | "purple" | "amber" | "emerald" | "red"
  trend?: "up" | "down"
  trendValue?: string
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${colorClasses[color].split(" ")[0]}`}>
          <Icon className={`size-5 ${iconColors[color]}`} />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trendValue}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

// Modern Skeleton Loader for Analytics Cards
const AnalyticsCardSkeleton = () => (
  <motion.div
    className="rounded-xl border border-gray-200 bg-white p-5"
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
      <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
      <div className="h-6 w-16 rounded-full bg-gray-200"></div>
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-4 w-24 rounded bg-gray-200"></div>
      <div className="h-8 w-32 rounded bg-gray-200"></div>
      <div className="h-3 w-20 rounded bg-gray-200"></div>
    </div>
  </motion.div>
)

// Modern Skeleton Loader for Categories Section
const MeterCategoriesSkeleton = () => {
  return (
    <motion.div
      className="mt-6 rounded-xl border border-gray-200 bg-white p-5"
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
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-48 rounded bg-gray-200"></div>
        <div className="h-6 w-24 rounded-full bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-gray-200"></div>
                <div className="h-3 w-12 rounded bg-gray-200"></div>
              </div>
              <div className="h-1.5 w-full rounded bg-gray-200"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-gray-100 p-3">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-2 space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-20 rounded bg-gray-200"></div>
                <div className="h-3 w-12 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 p-3">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-2 h-20 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    </motion.div>
  )
}

// Loading State Component
const LoadingState = () => {
  return (
    <div className="w-full">
      {/* Analytics Cards Skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <AnalyticsCardSkeleton key={i} />
        ))}
      </div>

      {/* Categories Section Skeleton */}
      <MeterCategoriesSkeleton />

      {/* Metering Info Skeleton */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <div className="h-7 w-48 rounded bg-gray-200"></div>
          <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 w-full rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Meter Categories Section Component
const MeterCategoriesSection = ({ meterData }: { meterData: any }) => {
  const categories = [
    {
      name: "Residential Meters",
      count: Math.round(meterData.totalMeters * 0.65),
      percentage: 65,
      color: "blue",
      icon: Home,
      description: "Household and apartment meters",
      active: Math.round(meterData.totalMeters * 0.65 * 0.9),
      inactive: Math.round(meterData.totalMeters * 0.65 * 0.1),
    },
    {
      name: "Commercial Meters",
      count: Math.round(meterData.totalMeters * 0.25),
      percentage: 25,
      color: "purple",
      icon: Building2,
      description: "Business and office meters",
      active: Math.round(meterData.totalMeters * 0.25 * 0.85),
      inactive: Math.round(meterData.totalMeters * 0.25 * 0.15),
    },
    {
      name: "Industrial Meters",
      count: Math.round(meterData.totalMeters * 0.1),
      percentage: 10,
      color: "amber",
      icon: Factory,
      description: "Manufacturing and industrial meters",
      active: Math.round(meterData.totalMeters * 0.1 * 0.95),
      inactive: Math.round(meterData.totalMeters * 0.1 * 0.05),
    },
  ]

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      light: "bg-blue-100",
      dark: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      light: "bg-emerald-100",
      dark: "bg-emerald-600",
      gradient: "from-emerald-500 to-emerald-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      light: "bg-purple-100",
      dark: "bg-purple-600",
      gradient: "from-purple-500 to-purple-600",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      light: "bg-amber-100",
      dark: "bg-amber-600",
      gradient: "from-amber-500 to-amber-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      light: "bg-red-100",
      dark: "bg-red-600",
      gradient: "from-red-500 to-red-600",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      light: "bg-gray-100",
      dark: "bg-gray-600",
      gradient: "from-gray-500 to-gray-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      light: "bg-indigo-100",
      dark: "bg-indigo-600",
      gradient: "from-indigo-500 to-indigo-600",
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-xl border border-gray-200 bg-white p-5"
    >
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 p-2">
            <Layers className="size-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Meter Category Breakdown</h2>
            <p className="text-sm text-gray-600">Distribution by customer type and status</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Total: {meterData.totalMeters.toLocaleString()}
        </span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            name: "Total Meters",
            description: "All registered meters",
            count: meterData.totalMeters,
            active: meterData.totalMeters,
            inactive: 0,
            percentage: 100,
            color: "blue",
            icon: BarChart3,
          },
          {
            name: "Active Meters",
            description: "Currently operational meters",
            count: meterData.activeMeters,
            active: meterData.activeMeters,
            inactive: meterData.totalMeters - meterData.activeMeters,
            percentage: Math.round((meterData.activeMeters / meterData.totalMeters) * 100),
            color: "emerald",
            icon: CheckCircle,
          },
          {
            name: "Smart Meters",
            description: "Advanced digital meters",
            count: meterData.smartMeters,
            active: meterData.smartMeters,
            inactive: meterData.conventionalMeters,
            percentage: Math.round((meterData.smartMeters / meterData.totalMeters) * 100),
            color: "purple",
            icon: Cpu,
          },
          {
            name: "Prepaid Meters",
            description: "Pay-as-you-go meters",
            count: meterData.prepaidMeters,
            active: meterData.prepaidMeters,
            inactive: meterData.postpaidMeters,
            percentage: Math.round((meterData.prepaidMeters / meterData.totalMeters) * 100),
            color: "amber",
            icon: Zap,
          },
          {
            name: "Deactivated Meters",
            description: "Currently inactive meters",
            count: meterData.deactivatedMeters,
            active: 0,
            inactive: meterData.deactivatedMeters,
            percentage: Math.round((meterData.deactivatedMeters / meterData.totalMeters) * 100),
            color: "red",
            icon: XCircle,
          },
          {
            name: "Retired Meters",
            description: "Permanently decommissioned meters",
            count: meterData.retiredMeters,
            active: 0,
            inactive: meterData.retiredMeters,
            percentage: Math.round((meterData.retiredMeters / meterData.totalMeters) * 100),
            color: "gray",
            icon: Activity,
          },
        ].map((category: CategoryData, index) => {
          const colors = colorClasses[category.color as keyof typeof colorClasses]
          const Icon = category.icon

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${colors.bg}`}>
                    <Icon className={`size-4 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${colors.text}`}>{category.count.toLocaleString()}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Distribution</span>
                  <span className="font-medium text-gray-900">{category.percentage}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                  />
                </div>
              </div>

              {/* Status Breakdown */}
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
        {/* Left Column - Meter Types */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Meter Type Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-100 p-1">
                  <Cpu className="size-3 text-purple-700" />
                </div>
                <span className="text-sm text-gray-700">Smart Meters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{meterData.smartMeters.toLocaleString()}</span>
                <span className="text-xs text-gray-500">
                  ({Math.round((meterData.smartMeters / meterData.totalMeters) * 100)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-amber-100 p-1">
                  <Activity className="size-3 text-amber-700" />
                </div>
                <span className="text-sm text-gray-700">Conventional Meters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {meterData.conventionalMeters.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.round((meterData.conventionalMeters / meterData.totalMeters) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Billing Types */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-600">Billing Type Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 p-1">
                  <Zap className="size-3 text-emerald-700" />
                </div>
                <span className="text-sm text-gray-700">Prepaid Meters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{meterData.prepaidMeters.toLocaleString()}</span>
                <span className="text-xs text-gray-500">
                  ({Math.round((meterData.prepaidMeters / meterData.totalMeters) * 100)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1">
                  <FileText className="size-3 text-blue-700" />
                </div>
                <span className="text-sm text-gray-700">Postpaid Meters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{meterData.postpaidMeters.toLocaleString()}</span>
                <span className="text-xs text-gray-500">
                  ({Math.round((meterData.postpaidMeters / meterData.totalMeters) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Distribution Analysis Tabs Component
const DistributionAnalysis = ({ meterData, colorClasses }: { meterData: any; colorClasses: any }) => {
  const [activeTab, setActiveTab] = useState("type")

  const tabs = [
    { id: "type", name: "By Type", icon: Zap },
    { id: "status", name: "By Status", icon: CheckCircle },
    { id: "state", name: "By State", icon: Activity },
    { id: "serviceBand", name: "By Service Band", icon: BarChart3 },
  ]

  const getTabData = (): CategoryData[] => {
    switch (activeTab) {
      case "type":
        return meterData.byType.map((type: any, index: number) => ({
          name: type.name,
          description: `${type.name} meters`,
          count: type.count,
          active: type.count,
          inactive: meterData.totalMeters - type.count,
          percentage: Math.round((type.count / meterData.totalMeters) * 100),
          color: index === 0 ? "emerald" : "blue",
          icon: index === 0 ? Zap : FileText,
        }))
      case "status":
        return meterData.byStatus.map((status: any) => ({
          name: status.name,
          description: `${status.name} status meters`,
          count: status.count,
          active: status.name === "Active" ? status.count : 0,
          inactive: status.name !== "Active" ? status.count : 0,
          percentage: Math.round((status.count / meterData.totalMeters) * 100),
          color: status.name === "Active" ? "emerald" : status.name === "Deactivated" ? "red" : "gray",
          icon: status.name === "Active" ? CheckCircle : status.name === "Deactivated" ? XCircle : Activity,
        }))
      case "state":
        return meterData.byState.map((state: any) => ({
          name: state.name,
          description: `${state.name} condition meters`,
          count: state.count,
          active: state.name === "Good" ? state.count : 0,
          inactive: state.name !== "Good" ? state.count : 0,
          percentage: Math.round((state.count / meterData.totalMeters) * 100),
          color: state.name === "Good" ? "emerald" : state.name === "Faulty" ? "red" : "amber",
          icon: state.name === "Good" ? CheckCircle : state.name === "Faulty" ? XCircle : Clock,
        }))
      case "serviceBand":
        return meterData.byServiceBand.map((band: any, index: number) => ({
          name: `Service Band ${band.name}`,
          description: `Band ${band.name} distribution`,
          count: band.count,
          active: band.count,
          inactive: meterData.totalMeters - band.count,
          percentage: Math.round((band.count / meterData.totalMeters) * 100),
          color:
            index === 0
              ? "purple"
              : index === 1
              ? "blue"
              : index === 2
              ? "emerald"
              : index === 3
              ? "amber"
              : index === 4
              ? "red"
              : "gray",
          icon:
            index === 0
              ? BarChart3
              : index === 1
              ? PieChart
              : index === 2
              ? TrendingUp
              : index === 3
              ? Activity
              : index === 4
              ? Battery
              : FileText,
        }))
      default:
        return []
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-6 rounded-xl border border-gray-200 bg-white p-5"
    >
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-100 p-2">
            <PieChart className="size-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Distribution Analysis</h2>
            <p className="text-sm text-gray-600">Meter distribution by various dimensions</p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
          Total: {meterData.totalMeters.toLocaleString()}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className="size-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {getTabData().map((category: CategoryData, index: number) => {
          const colors = colorClasses[category.color as keyof typeof colorClasses]
          const Icon = category.icon

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${colors.bg}`}>
                    <Icon className={`size-4 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${colors.text}`}>{category.count.toLocaleString()}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Distribution</span>
                  <span className="font-medium text-gray-900">{category.percentage}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                  />
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="size-3 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">
                      {category.name.includes("Active") ||
                      category.name.includes("Good") ||
                      category.name.includes("Prepaid") ||
                      category.name.includes("Service Band")
                        ? "Active"
                        : "Primary"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-emerald-900">{category.active.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="size-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">
                      {category.name.includes("Active") ||
                      category.name.includes("Good") ||
                      category.name.includes("Prepaid") ||
                      category.name.includes("Service Band")
                        ? "Others"
                        : "Secondary"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-amber-900">{category.inactive.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
const StatusBreakdown = ({ meterData }: { meterData: any }) => {
  const statuses = [
    { name: "Active", count: meterData.activeMeters, color: "emerald", icon: CheckCircle },
    { name: "Suspended", count: meterData.suspendedMeters, color: "amber", icon: Clock },
    { name: "Deactivated", count: meterData.deactivatedMeters, color: "red", icon: XCircle },
    { name: "Retired", count: meterData.retiredMeters, color: "gray", icon: Activity },
  ]

  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-gray-50 text-gray-700",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 rounded-xl border border-gray-200 bg-white p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-purple-100 p-2">
          <BarChart3 className="size-5 text-purple-700" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Meter Status Overview</h2>
          <p className="text-sm text-gray-600">Current operational status distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statuses.map((status, index) => {
          const Icon = status.icon
          const percentage = Math.round((status.count / meterData.totalMeters) * 100)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="rounded-lg border border-gray-100 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-lg p-2 ${colorClasses[status.color as keyof typeof colorClasses].split(" ")[0]}`}
                >
                  <Icon className={`size-4 ${colorClasses[status.color as keyof typeof colorClasses].split(" ")[1]}`} />
                </div>
                <span className="text-lg font-bold text-gray-900">{percentage}%</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">{status.name}</p>
              <p className="text-xs text-gray-600">{status.count.toLocaleString()} meters</p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Main Component
export default function MeteringDashboard() {
  const router = useRouter()
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // 8 minutes default

  const dispatch = useAppDispatch()
  const { summary, summaryLoading, summaryError } = useAppSelector((state) => state.meters)
  const { user } = useAppSelector((state) => state.auth)

  // Check if user has Write permission for meter installation
  const canInstallMeter = !!user?.privileges?.some(
    (p) =>
      (p.key === "metering-meter-changeout-activation-de-activation" && p.actions?.includes("W")) ||
      (p.key === "meters" && p.actions?.includes("W")) ||
      (p.key === "new-service-new-capture-separation" && p.actions?.includes("W"))
  )

  // Fetch meters summary on component mount
  useEffect(() => {
    dispatch(fetchMetersSummary())
  }, [dispatch])

  const handleRefreshData = useCallback(() => {
    dispatch(fetchMetersSummary())
  }, [dispatch])

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Polling interval options
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 660000, label: "11m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Short polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      handleRefreshData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [dispatch, isPolling, pollingInterval, handleRefreshData])

  // Calculate derived values from summary data
  const meterData = {
    smartMeters: summary?.smartMeters || 0,
    conventionalMeters: summary ? summary.totalMeters - summary.smartMeters : 0,
    totalMeters: summary?.totalMeters || 0,
    activeMeters: summary?.activeMeters || 0,
    deactivatedMeters: summary?.deactivatedMeters || 0,
    suspendedMeters: summary?.suspendedMeters || 0,
    retiredMeters: summary?.retiredMeters || 0,
    prepaidMeters: summary?.prepaidMeters || 0,
    postpaidMeters: summary?.postpaidMeters || 0,
    byStatus: summary?.byStatus || [],
    byState: summary?.byState || [],
    byType: summary?.byType || [],
    byServiceBand: summary?.byServiceBand || [],
  }

  // Color classes for distribution analysis
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      light: "bg-blue-100",
      dark: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      light: "bg-emerald-100",
      dark: "bg-emerald-600",
      gradient: "from-emerald-500 to-emerald-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      light: "bg-purple-100",
      dark: "bg-purple-600",
      gradient: "from-purple-500 to-purple-600",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      light: "bg-amber-100",
      dark: "bg-amber-600",
      gradient: "from-amber-500 to-amber-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      light: "bg-red-100",
      dark: "bg-red-600",
      gradient: "from-red-500 to-red-600",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      light: "bg-gray-100",
      dark: "bg-gray-600",
      gradient: "from-gray-500 to-gray-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      light: "bg-indigo-100",
      dark: "bg-indigo-600",
      gradient: "from-indigo-500 to-indigo-600",
    },
  }

  // Calculate percentages
  const calculatePercentage = (value: number) => {
    return meterData.totalMeters > 0 ? Math.round((value / meterData.totalMeters) * 100) : 0
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleInstallMeter = () => {
    router.push("/metering/install-new-meter")
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl">Metering & AMI</h1>
                  <p className="mt-1 text-sm text-gray-600">Advanced Metering Infrastructure and meter management</p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                  {canInstallMeter && (
                    <ButtonModule
                      variant="primary"
                      size="md"
                      onClick={handleInstallMeter}
                      icon={<VscAdd className="size-4" />}
                      iconPosition="start"
                      className="bg-[#004B23] text-white hover:bg-[#003618]"
                    >
                      Install Meter
                    </ButtonModule>
                  )}

                  {/* Polling Controls */}
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1">
                    <button
                      onClick={togglePolling}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isPolling ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <RefreshCw className={`size-3.5 ${isPolling ? "animate-spin" : ""}`} />
                      {isPolling ? "ON" : "OFF"}
                    </button>

                    {isPolling && (
                      <DropdownPopover
                        options={pollingOptions}
                        selectedValue={pollingInterval}
                        onSelect={handlePollingIntervalChange}
                      >
                        {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                      </DropdownPopover>
                    )}
                  </div>

                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={summaryLoading}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className={`mr-2 size-4 ${summaryLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {summaryError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Failed to load meter data</p>
                      <p className="text-sm text-red-700">{summaryError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            {summaryLoading && !summary ? (
              <LoadingState />
            ) : summary ? (
              <div className="w-full">
                {/* Analytics Cards Row */}

                {/* Meter Categories Section */}
                <MeterCategoriesSection meterData={meterData} />

                {/* Status Breakdown */}
                <StatusBreakdown meterData={meterData} />

                {/* Distribution Stats */}
                <DistributionAnalysis meterData={meterData} colorClasses={colorClasses} />

                {/* Metering Info Component */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <MeteringInfo />
                </motion.div>
              </div>
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Layers className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Meter Data</h3>
                  <p className="mt-2 text-sm text-gray-500">No meter data available. Try refreshing the data.</p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1">
                      <button
                        onClick={togglePolling}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                          isPolling ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <RefreshCw className={`size-3.5 ${isPolling ? "animate-spin" : ""}`} />
                        {isPolling ? "ON" : "OFF"}
                      </button>

                      {isPolling && (
                        <DropdownPopover
                          options={pollingOptions}
                          selectedValue={pollingInterval}
                          onSelect={handlePollingIntervalChange}
                        >
                          {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                        </DropdownPopover>
                      )}
                    </div>

                    <ButtonModule
                      variant="primary"
                      size="sm"
                      onClick={handleRefreshData}
                      icon={<RefreshCw className="size-4" />}
                      iconPosition="start"
                      className="bg-[#004B23] text-white hover:bg-[#003618]"
                    >
                      Refresh Data
                    </ButtonModule>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {summaryLoading && !summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#004B23] border-t-transparent" />
                <div className="text-center">
                  <p className="font-medium text-gray-900">Loading Meter Data</p>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
