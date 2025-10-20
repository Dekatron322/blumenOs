"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { ProfitChart } from "components/Dashboard/ProfitChart"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FiDollarSign } from "react-icons/fi"
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

// Time filter types
type TimeFilter = "day" | "week" | "month" | "all"

export default function Dashboard() {
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number>(1)
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState<string>("NGN")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
      className={`flex items-center justify-center rounded-md px-3 py-1 pt-2 text-sm font-medium ${
        timeFilter === filter ? "bg-[#0a0a0a] text-[#FFFFFF]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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

          <div className="container mx-auto px-16 py-8 max-sm:px-3">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Utility Dashboard Overview</h1>
                <p className="text-sm font-medium text-gray-500">
                  Real-time overview of customer accounts, revenue, and operational metrics
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Time Range:</span>
                  <TimeFilterButton filter="day" label="Today" />
                  <TimeFilterButton filter="week" label="This Week" />
                  <TimeFilterButton filter="month" label="This Month" />
                  <TimeFilterButton filter="all" label="All Time" />
                </div>
              </div>
            </div>

            {/* Customer Metrics */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Financial Metrics */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

              <Card title="Outstanding Arrears" icon={<OutstandingIcon />}>
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

            {/* Operational Metrics */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Additional Financial Metric */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card title="Arrears Collected (MTD)" icon={<FiDollarSign className="size-6" />}>
                <div className="mb-2 flex items-center justify-between border-b py-2">
                  <Text>Via Prepaid Deductions</Text>
                  <Text className="text-xs">Month to Date</Text>
                </div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-32 rounded bg-gray-200"></div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Metric>
                      {selectedCurrencySymbol}
                      {utilityData.arrearsCollectedMTD.toLocaleString()}
                    </Metric>
                    <div className="flex items-center">
                      <TrendIndicator value="18.4%" positive={true} />
                    </div>
                  </div>
                )}
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span>{selectedCurrencySymbol}15,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Achievement:</span>
                    <span>{((utilityData.arrearsCollectedMTD / 15000000) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>

              {/* Transaction Volume Charts */}
              <Card
                title={`Revenue Trend - ${
                  timeFilter === "day"
                    ? "Today"
                    : timeFilter === "week"
                    ? "This Week"
                    : timeFilter === "month"
                    ? "This Month"
                    : "All Time"
                }`}
              >
                <div className="mt-4 h-64">
                  <ProfitChart timeFilter={timeFilter} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
