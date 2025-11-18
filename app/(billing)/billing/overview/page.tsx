"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MetersProgrammedIcon, PlayIcon, TamperIcon, TokenGeneratedIcon, VendingIcon } from "components/Icons/Icons"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import BillingInfo from "components/BillingInfo/BillingInfo"
import { ButtonModule } from "components/ui/Button/Button"

import { fetchPostpaidBillingAnalytics, clearPostpaidBillingAnalytics } from "lib/redux/analyticsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
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
    <div className="w-80 rounded-md border bg-white p-5">
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
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex gap-4">
          <div className="h-10 w-80 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <div className="mt-4 flex items-center justify-between">
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
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex gap-4">
          <div className="h-10 w-80 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>

      {/* List View Skeleton */}
      <div className="divide-y">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
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

              <div className="flex items-center gap-3">
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
      <div className="mt-4 flex items-center justify-between">
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
    <div className="flex-3 relative mt-5 flex items-start gap-6">
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

// Postpaid Billing Analytics Cards Component
const PostpaidBillingAnalyticsCards = ({ data, loading }: { data: any; loading: boolean }) => {
  if (loading) {
    return <SkeletonLoader />
  }

  if (!data) {
    return (
      <div className="flex w-full items-center justify-center rounded-lg bg-yellow-50 p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-yellow-800">No billing data available</p>
          <p className="text-sm text-yellow-600">Start a billing run to generate analytics data</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
      {/* Total Bills Card */}
      <motion.div
        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
          <div className="text-blue-600">
            <TokenGeneratedIcon />
          </div>
          <span className="font-medium">Total Bills</span>
        </div>
        <div className="flex flex-col items-end justify-between gap-3 pt-4">
          <div className="flex w-full justify-between">
            <p className="text-grey-200">Generated:</p>
            <p className="text-secondary text-xl font-bold">{formatNumber(data.totalBills)}</p>
          </div>
          <div className="flex w-full justify-between">
            <p className="text-grey-200">Period:</p>
            <p className="text-secondary font-medium">{data.period || "Current"}</p>
          </div>
        </div>
      </motion.div>

      {/* Revenue Card */}
      <motion.div
        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
          <div className="text-green-600">
            <MetersProgrammedIcon />
          </div>
          <span className="font-medium">Revenue</span>
        </div>
        <div className="flex flex-col items-end justify-between gap-3 pt-4">
          <div className="flex w-full justify-between">
            <p className="text-grey-200">Current Bill:</p>
            <p className="text-secondary text-xl font-bold">{formatCurrency(data.totalCurrentBillAmount)}</p>
          </div>
          <div className="flex w-full justify-between">
            <p className="text-grey-200">Total Due:</p>
            <p className="text-secondary font-medium">{formatCurrency(data.totalAmountDue)}</p>
          </div>
        </div>
      </motion.div>

      {/* Consumption Card */}
      <motion.div
        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
          <div className="text-purple-600">
            <VendingIcon />
          </div>
          <span className="font-medium">Consumption</span>
        </div>
        <div className="flex flex-col items-end justify-between gap-3 pt-4">
          <div className="flex w-full justify-between">
            <p className="text-grey-200">Total kWh:</p>
            <p className="text-secondary text-xl font-bold">{formatNumber(data.totalConsumptionKwh)} kWh</p>
          </div>
          <div className="flex w-full justify-between">
            <p className="text-grey-200">Forecast:</p>
            <p className="text-secondary font-medium">{formatNumber(data.forecastConsumptionKwh)} kWh</p>
          </div>
        </div>
      </motion.div>

      {/* Disputes & Adjustments Card */}
      <motion.div
        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
          <div className="text-red-600">
            <TamperIcon />
          </div>
          <span className="font-medium">Disputes</span>
        </div>
        <div className="flex flex-col items-end justify-between gap-3 pt-4">
          <div className="flex w-full justify-between">
            <p className="text-grey-200">Active:</p>
            <div className="flex gap-1">
              <p className="text-secondary text-xl font-bold">{formatNumber(data.activeDisputes)}</p>
              <ArrowIcon />
            </div>
          </div>
          <div className="flex w-full justify-between">
            <p className="text-grey-200">Resolved:</p>
            <p className="text-secondary font-medium">{formatNumber(data.resolvedDisputes)} this period</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Billing Status Summary Component
const BillingStatusSummary = ({ data }: { data: any }) => {
  if (!data) return null

  const billingStatus = [
    { name: "Draft Bills", value: data.draftBills, color: "bg-yellow-500" },
    { name: "Finalized Bills", value: data.finalizedBills, color: "bg-green-500" },
    { name: "Reversed Bills", value: data.reversedBills, color: "bg-red-500" },
    { name: "Estimated Bills", value: data.estimatedBills, color: "bg-blue-500" },
  ]

  const totalBills = data.totalBills || 1

  return (
    <motion.div
      className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {billingStatus.map((status, index) => (
        <div key={status.name} className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{status.name}</p>
              <p className="text-2xl font-bold text-gray-900">{status.value}</p>
            </div>
            <div className="text-right">
              <div className={`h-3 w-3 rounded-full ${status.color}`}></div>
              <p className="mt-1 text-sm text-gray-500">{Math.round((status.value / totalBills) * 100)}%</p>
            </div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${status.color}`}
              style={{ width: `${(status.value / totalBills) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

export default function BillingDashboard() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [billingParams, setBillingParams] = useState({
    period: new Date().toISOString().slice(0, 7), // YYYY-MM format
    status: 1 as 0 | 1 | 2, // Default to finalized bills
    category: 2 as 1 | 2, // Default to postpaid
  })

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)

  const dispatch = useAppDispatch()
  const { postpaidBillingAnalyticsData, postpaidBillingAnalyticsLoading, postpaidBillingAnalyticsError } =
    useAppSelector((state) => state.analytics)

  // Fetch billing analytics on component mount and when params change
  useEffect(() => {
    dispatch(fetchPostpaidBillingAnalytics(billingParams))
  }, [dispatch, billingParams])

  const handleStartBillingRun = () => {
    setIsLoading(true)
    // Simulate billing run start
    setTimeout(() => {
      // Refresh analytics data after billing run
      dispatch(fetchPostpaidBillingAnalytics(billingParams))
      setIsLoading(false)
    }, 2000)
  }

  const handleRefreshData = () => {
    dispatch(fetchPostpaidBillingAnalytics(billingParams))
  }

  const handlePeriodChange = (period: string) => {
    setBillingParams((prev) => ({ ...prev, period }))
  }

  const handleStatusChange = (status: 0 | 1 | 2) => {
    setBillingParams((prev) => ({ ...prev, status }))
  }

  const getStatusLabel = (status: 0 | 1 | 2) => {
    switch (status) {
      case 0:
        return "Draft"
      case 1:
        return "Finalized"
      case 2:
        return "Reversed"
      default:
        return "Status"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Billing Engine</h4>
                <p>Tariff management, bill generation, and billing cycles</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="outline"
                  size="md"
                  className="mt-2"
                  onClick={handleRefreshData}
                  disabled={postpaidBillingAnalyticsLoading}
                >
                  Refresh Data
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="mt-2"
                  icon={<PlayIcon />}
                  onClick={handleStartBillingRun}
                  disabled={isLoading}
                >
                  {isLoading ? "Starting..." : "Start Billing Run"}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Period Filter */}
            <div className="mb-6 px-16 max-md:px-0 max-sm:px-3">
              <div className="flex items-center gap-4">
                <div>
                  <label htmlFor="period" className="mb-1 block text-sm font-medium text-gray-700">
                    Billing Period
                  </label>
                  <input
                    type="month"
                    id="period"
                    value={billingParams.period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="rounded-md border border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                    Bill Status
                  </label>
                  <div
                    id="status"
                    className="flex h-[38px] cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
                    onClick={() => setStatusDropdownOpen((prev) => !prev)}
                  >
                    <span>{getStatusLabel(billingParams.status)}</span>
                    <svg
                      className={`size-4 text-gray-500 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12a1 1 0 01-.707-.293l-6-6a1 1 0 011.414-1.414L10 9.586l5.293-5.293A1 1 0 0117.707 5.293l-6 6A1 1 0 0110 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {statusDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                      {[
                        { value: 0 as 0 | 1 | 2, label: "Draft" },
                        { value: 1 as 0 | 1 | 2, label: "Finalized" },
                        { value: 2 as 0 | 1 | 2, label: "Reversed" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                            billingParams.status === option.value ? "bg-gray-50 font-medium" : ""
                          }`}
                          onClick={() => {
                            handleStatusChange(option.value)
                            setStatusDropdownOpen(false)
                          }}
                        >
                          <span>{option.label}</span>
                          {billingParams.status === option.value && (
                            <svg
                              className="size-4 text-blue-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {postpaidBillingAnalyticsLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={false} />
                  </>
                ) : postpaidBillingAnalyticsError ? (
                  // Error State
                  <div className="mb-6 rounded-lg bg-red-50 p-6">
                    <div className="text-center">
                      <p className="text-lg font-medium text-red-800">Error Loading Billing Data</p>
                      <p className="text-sm text-red-600">{postpaidBillingAnalyticsError}</p>
                      <ButtonModule variant="outline" size="sm" className="mt-3" onClick={handleRefreshData}>
                        Retry
                      </ButtonModule>
                    </div>
                  </div>
                ) : (
                  // Loaded State - Billing Dashboard
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <PostpaidBillingAnalyticsCards
                        data={postpaidBillingAnalyticsData}
                        loading={postpaidBillingAnalyticsLoading}
                      />

                      <BillingStatusSummary data={postpaidBillingAnalyticsData} />

                      {/* Financial Summary */}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mt-6"
                    >
                      <BillingInfo />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstallMeterModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={() => setIsAddCustomerModalOpen(false)}
      />
    </section>
  )
}
