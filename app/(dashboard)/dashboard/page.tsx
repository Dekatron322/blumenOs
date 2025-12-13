"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  BillingIcon,
  CollectionIcon,
  ConnectionIcon,
  CustomeraIcon,
  MetersProgrammedIcon,
  OutstandingIcon,
  PostpaidIcon,
  PrepaidIcon,
  RevenueIcon,
  TokenGeneratedIcon,
  VendingIcon,
} from "components/Icons/Icons"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Time filter types
type TimeFilter = "day" | "week" | "month" | "all"

export default function Dashboard() {
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number>(1)
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState<string>("NGN")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [activeView, setActiveView] = useState<"kpi" | "statistics">("kpi")
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const router = useRouter()

  // Mock data for charts based on the image
  const energyData = [
    { name: "B1D1F", delivered: 1200, billed: 1150 },
    { name: "B2D2F", delivered: 1800, billed: 1720 },
    { name: "B3D3F", delivered: 1500, billed: 1420 },
    { name: "B4D4F", delivered: 2200, billed: 2100 },
    { name: "B5D5F", delivered: 1900, billed: 1850 },
    { name: "B6D6F", delivered: 2400, billed: 2300 },
    { name: "B7D7F", delivered: 2100, billed: 2050 },
    { name: "B8D8F", delivered: 1700, billed: 1650 },
    { name: "B9D9F", delivered: 1300, billed: 1250 },
    { name: "B10D10F", delivered: 1600, billed: 1550 },
  ]

  const collectionByBandData = [
    { name: "Band A", value: 18900023.46, percentage: 54 },
    { name: "Band B", value: 18900023.46, percentage: 56.93 },
    { name: "Band C", value: 18900023.46, percentage: 56.93 },
    { name: "Band D", value: 18900023.46, percentage: 56.93 },
    { name: "Total", value: 75600093.84, percentage: 56.93 },
  ]

  const dailyCollectionData = [
    { day: "Mon", collection: 4200000 },
    { day: "Tue", collection: 5200000 },
    { day: "Wed", collection: 3800000 },
    { day: "Thu", collection: 6100000 },
    { day: "Fri", collection: 4900000 },
    { day: "Sat", collection: 3200000 },
    { day: "Sun", collection: 2800000 },
  ]

  const cboPerformanceData = [
    { name: "Hero.db", performance: 95 },
    { name: "Mt2.db", performance: 87 },
    { name: "Hto.db", performance: 92 },
    { name: "Hta.db", performance: 78 },
  ]

  const serviceTypeData = [
    { name: "H1A", collection: 85, total: 100 },
    { name: "Other", collection: 60, total: 100 },
  ]

  const atcLossesData = [
    { month: "Sep", losses: 12.5 },
    { month: "Oct", losses: 11.2 },
    { month: "Nov", losses: 9.8 },
  ]

  const activeCustomersData = [
    { name: "Postpaid", value: 35000 },
    { name: "Prepaid", value: 85000 },
  ]

  const COLORS = ["#004B23", "#006400", "#007200", "#38b000", "#70e000"]

  // Mock currencies data
  const currenciesData = {
    data: [
      { id: 1, symbol: "NGN", name: "Nigerian Naira" },
      { id: 2, symbol: "USD", name: "US Dollar" },
      { id: 3, symbol: "EUR", name: "Euro" },
    ],
  }

  // Generate random utility data based on time filter
  const generateUtilityData = () => {
    const baseMultiplier = timeFilter === "day" ? 0.03 : timeFilter === "week" ? 0.2 : timeFilter === "month" ? 1 : 4

    return {
      // Customer metrics
      totalCustomers: Math.floor(125000 + Math.random() * 5000),
      prepaidCustomers: Math.floor(85000 + Math.random() * 3000),
      postpaidCustomers: Math.floor(35000 + Math.random() * 2000),
      estimatedBillingCustomers: Math.floor(5000 + Math.random() * 1000),

      // Financial metrics
      totalRevenue: Math.floor(25000000 + Math.random() * 5000000) * baseMultiplier,
      collectionEfficiency: 85 + Math.random() * 10, // Percentage
      outstandingArrears: Math.floor(45000000 + Math.random() * 5000000),

      // Operational metrics
      newConnectionsMTD: Math.floor(1200 + Math.random() * 300) * baseMultiplier,
      prepaidVends: Math.floor(50000 + Math.random() * 10000) * baseMultiplier,
      tokensGenerated: Math.floor(75000 + Math.random() * 15000) * baseMultiplier,
      metersProgrammed: Math.floor(1800 + Math.random() * 400) * baseMultiplier,
      pendingMeterProgramming: 425,
      arrearsCollectedMTD: Math.floor(12000000 + Math.random() * 3000000) * baseMultiplier,
    }
  }

  const [utilityData, setUtilityData] = useState(generateUtilityData())

  useEffect(() => {
    // Refresh utility data when time filter changes
    setUtilityData(generateUtilityData())
  }, [timeFilter])

  useEffect(() => {
    if (currenciesData?.data) {
      const selectedCurrency = currenciesData.data.find((currency) => currency.id === selectedCurrencyId)
      if (selectedCurrency) {
        setSelectedCurrencySymbol(selectedCurrency.symbol)
      }
    }
  }, [selectedCurrencyId])

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrencyId = Number(event.target.value)
    setSelectedCurrencyId(newCurrencyId)
  }

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter)
    setIsMobileFilterOpen(false)
  }

  const getTimeFilterLabel = (filter: TimeFilter) => {
    if (filter === "day") return "Today"
    if (filter === "week") return "This Week"
    if (filter === "month") return "This Month"
    return "All Time"
  }

  const Card = ({
    children,
    className = "",
    title,
    icon,
    trend,
  }: {
    children: React.ReactNode
    className?: string
    title?: string
    icon?: React.ReactNode
    trend?: { value: string; positive: boolean }
  }) => (
    <div className={`rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      {children}
      {trend && (
        <div className={`mt-2 text-sm ${trend.positive ? "text-green-500" : "text-red-500"}`}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </div>
      )}
    </div>
  )

  const Metric = ({ children, size = "lg" }: { children: React.ReactNode; size?: "sm" | "lg" }) => (
    <p className={`flex items-end gap-2 font-bold text-gray-900 ${size === "lg" ? "text-3xl" : "text-2xl"}`}>
      {children}
    </p>
  )

  const Text = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm font-medium text-gray-500 ${className}`}>{children}</p>
  )

  const TrendIndicator = ({ value, positive }: { value: string; positive: boolean }) => (
    <span className={`inline-flex items-center ${positive ? "text-green-500" : "text-red-500"}`}>
      {positive ? (
        <svg className="mr-1 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="mr-1 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {value}
    </span>
  )

  const TimeFilterButton = ({ filter, label }: { filter: TimeFilter; label: string }) => (
    <button
      onClick={() => handleTimeFilterChange(filter)}
      className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        timeFilter === filter ? "bg-[#004B23] text-[#FFFFFF]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  )

  // Calculate derived metrics
  const collectionEfficiencyColor =
    utilityData.collectionEfficiency >= 90
      ? "text-green-500"
      : utilityData.collectionEfficiency >= 80
      ? "text-yellow-500"
      : "text-red-500"

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto w-full px-3 py-8 xl:container xl:px-16">
            <div className="mb-6 flex w-full flex-col gap-4">
              <div className="flex w-full items-start justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-3xl">Utility Dashboard Overview</h1>
                  <p className="text-sm font-medium text-gray-500 sm:text-base">
                    Real-time overview of customer accounts, revenue, and operational metrics
                  </p>
                </div>
                <div className="hidden rounded-lg p-3 sm:bg-white sm:p-2 sm:shadow-sm xl:flex">
                  <div className="flex flex-row items-center gap-2 max-sm:justify-between sm:gap-3">
                    <span className="text-sm  font-medium text-gray-500">Time Range:</span>

                    {/* Desktop Layout */}
                    <div className="hidden items-center gap-2 sm:flex">
                      <TimeFilterButton filter="day" label="Today" />
                      <TimeFilterButton filter="week" label="This Week" />
                      <TimeFilterButton filter="month" label="This Month" />
                      <TimeFilterButton filter="all" label="All Time" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Time Filter Section with Mobile Slider */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:w-auto">
                  <div className="rounded-lg p-3 sm:bg-white sm:p-2 sm:shadow-sm xl:hidden">
                    <div className="flex flex-row items-center gap-2 max-sm:justify-between sm:gap-3">
                      <span className="text-sm font-medium text-gray-500">Time Range:</span>

                      {/* <div className="hidden items-center gap-2 sm:flex">
                        <TimeFilterButton filter="day" label="Today" />
                        <TimeFilterButton filter="week" label="This Week" />
                        <TimeFilterButton filter="month" label="This Month" />
                        <TimeFilterButton filter="all" label="All Time" />
                      </div> */}

                      {/* Mobile Dropdown Layout */}
                      <div className="relative xl:hidden">
                        <button
                          type="button"
                          onClick={() => setIsMobileFilterOpen((prev) => !prev)}
                          className="inline-flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          <span>{getTimeFilterLabel(timeFilter)}</span>
                          <svg
                            className="size-4 text-gray-500"
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

                        {isMobileFilterOpen && (
                          <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border border-gray-100 bg-white py-1 text-sm shadow-lg">
                            <button
                              type="button"
                              onClick={() => handleTimeFilterChange("day")}
                              className={`block w-full px-3 py-2 text-left ${
                                timeFilter === "day" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              Today
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTimeFilterChange("week")}
                              className={`block w-full px-3 py-2 text-left ${
                                timeFilter === "week" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              This Week
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTimeFilterChange("month")}
                              className={`block w-full px-3 py-2 text-left ${
                                timeFilter === "month" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              This Month
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTimeFilterChange("all")}
                              className={`block w-full px-3 py-2 text-left ${
                                timeFilter === "all" ? "bg-[#004B23] text-white" : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              All Time
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {activeView === "kpi" && (
              <>
                {/* Customer Metrics */}
                <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4">
                  <Card title="Total Customers" icon={<CustomeraIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>All Customer Accounts</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric>{utilityData.totalCustomers.toLocaleString()}</Metric>
                        <TrendIndicator value="2.5%" positive={true} />
                      </div>
                    )}
                  </Card>

                  <Card title="Prepaid Customers" icon={<PrepaidIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>Token-based Meters</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric>{utilityData.prepaidCustomers.toLocaleString()}</Metric>
                        <TrendIndicator value="4.1%" positive={true} />
                      </div>
                    )}
                  </Card>

                  <Card title="Postpaid Customers" icon={<PostpaidIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>Billed Monthly</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric>{utilityData.postpaidCustomers.toLocaleString()}</Metric>
                        <TrendIndicator value="0.8%" positive={true} />
                      </div>
                    )}
                  </Card>

                  <Card title="Estimated Billing" icon={<BillingIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>Unmetered Customers</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric>{utilityData.estimatedBillingCustomers.toLocaleString()}</Metric>
                        <TrendIndicator value="-1.2%" positive={false} />
                      </div>
                    )}
                  </Card>
                </div>

                {/* ENERGY DELIVERED vs ENERGY BILLED Chart */}
                <Card title="ENERGY DELIVERED vs ENERGY BILLED" className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={energyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="delivered" name="Energy Delivered" fill="#004B23" />
                      <Bar dataKey="billed" name="Energy Billed" fill="#38b000" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Financial Metrics */}
                <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                  <Card title="Total Revenue" icon={<RevenueIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>All Channels</Text>
                      <Text className="text-xs">
                        {timeFilter === "day"
                          ? "Today"
                          : timeFilter === "week"
                          ? "This Week"
                          : timeFilter === "month"
                          ? "MTD"
                          : "YTD"}
                      </Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric>
                          {selectedCurrencySymbol}
                          {utilityData.totalRevenue.toLocaleString()}
                        </Metric>
                        <TrendIndicator value="12.5%" positive={true} />
                      </div>
                    )}
                  </Card>

                  <Card title="Collection Efficiency" icon={<CollectionIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>Revenue Collection Rate</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <Metric>{utilityData.collectionEfficiency.toFixed(1)}%</Metric>
                    )}
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${
                          utilityData.collectionEfficiency >= 90
                            ? "bg-green-500"
                            : utilityData.collectionEfficiency >= 80
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${utilityData.collectionEfficiency}%` }}
                      ></div>
                    </div>
                  </Card>

                  <Card title="Outstanding Arrears" icon={<OutstandingIcon />} className="lg:col-span-2 2xl:col-span-1">
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>Total Receivables</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric>
                          {selectedCurrencySymbol}
                          {utilityData.outstandingArrears.toLocaleString()}
                        </Metric>
                        <TrendIndicator value="-3.2%" positive={false} />
                      </div>
                    )}
                  </Card>
                </div>

                {/* Collection by BAND Section */}
                <div className="mb-6 grid grid-cols-1 gap-6 2xl:grid-cols-2">
                  <Card title="Collection by BAND">
                    <div className="mb-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Band</th>
                            <th className="py-2 text-right">Collection</th>
                            <th className="py-2 text-right">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {collectionByBandData.map((item, index) => (
                            <tr key={item.name} className="border-b">
                              <td className="py-2">{item.name}</td>
                              <td className="py-2 text-right">
                                {selectedCurrencySymbol}
                                {item.value.toLocaleString()}
                              </td>
                              <td className="py-2 text-right">{item.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={collectionByBandData.slice(0, -1)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="percentage" name="Collection %" fill="#004B23" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <div className="grid grid-cols-1  gap-6">
                    <Card title="Daily Collection">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={dailyCollectionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="collection"
                            stroke="#004B23"
                            fill="#004B23"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card title="CBO Performance">
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={cboPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="performance" name="Performance %" fill="#004B23" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </div>

                {/* Operational Metrics */}
                <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4">
                  <Card title="New Connections (MTD)" icon={<ConnectionIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>Meter Installations</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric size="lg">{utilityData.newConnectionsMTD.toLocaleString()}</Metric>
                        <TrendIndicator value="8.7%" positive={true} />
                      </div>
                    )}
                  </Card>

                  <Card title="Prepaid Vends" icon={<VendingIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>Token Transactions</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric size="lg">{utilityData.prepaidVends.toLocaleString()}</Metric>
                        <TrendIndicator value="15.3%" positive={true} />
                      </div>
                    )}
                  </Card>

                  <Card title="Tokens Generated" icon={<TokenGeneratedIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>KCT, CTT, CCT Tokens</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric size="lg">{utilityData.tokensGenerated.toLocaleString()}</Metric>
                        <TrendIndicator value="12.1%" positive={true} />
                      </div>
                    )}
                  </Card>

                  <Card title="Meters Programmed" icon={<MetersProgrammedIcon />}>
                    <div className="mb-2 flex items-center justify-between border-b py-2">
                      <Text>{utilityData.pendingMeterProgramming} pending</Text>
                    </div>
                    {isLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-32 rounded bg-gray-200"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Metric size="lg">{utilityData.metersProgrammed.toLocaleString()}</Metric>
                        <TrendIndicator value="5.6%" positive={true} />
                      </div>
                    )}
                  </Card>
                </div>

                {/* Additional Charts Section */}
                <div className="mb-6 grid grid-cols-1 gap-6 2xl:grid-cols-3">
                  <Card title="SERVICE TYPE COLLECTION SUMMARY">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={serviceTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.collection}/${entry.total}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="collection"
                        >
                          {serviceTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card title="ATC AND C LOSSES 3 MONTH TREND ANALYSIS">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={atcLossesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 15]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="losses" stroke="#004B23" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card title="ACTIVE CUSTOMERS SUMMARY">
                    <div className="text-center">
                      <div className="mb-4 text-2xl font-bold text-gray-900">
                        {utilityData.totalCustomers.toLocaleString()}
                      </div>
                      <div className="mb-4 text-sm text-gray-600">Total Active Customers</div>
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={activeCustomersData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {activeCustomersData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">Postpaid</div>
                        <div className="text-gray-600">{utilityData.postpaidCustomers.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Prepaid</div>
                        <div className="text-gray-600">{utilityData.prepaidCustomers.toLocaleString()}</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Date Range */}
                <Card className="mb-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Text>Selected Date Range:</Text>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Text>From:</Text>
                        <span className="font-medium text-gray-900">11/03/2025</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Text>To:</Text>
                        <span className="font-medium text-gray-900">11/03/2025</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
