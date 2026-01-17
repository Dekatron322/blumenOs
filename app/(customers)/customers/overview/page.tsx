"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useCallback, useEffect, useState } from "react"
import AddCustomerModal from "components/ui/Modal/add-customer-modal"
import { motion } from "framer-motion"
import {
  AddCustomerIcon,
  BillingIcon,
  CustomeraIcon,
  PostpaidIcon,
  RefreshCircleIcon,
  VendingIcon,
} from "components/Icons/Icons"
import AllCustomers from "components/Tables/AllCustomers"
import { ButtonModule } from "components/ui/Button/Button"
import { clearCustomerAnalytics, fetchCustomerAnalytics } from "lib/redux/analyticsSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { useRouter } from "next/navigation"
import { VscAdd } from "react-icons/vsc"

// Dropdown Popover Component
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

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left ${
                  option.value === selectedValue ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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

// Customer Analytics Summary Cards Component
const CustomerAnalyticsCards = ({ analyticsData }: { analyticsData: any }) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const calculatePercentage = (part: number, total: number) => {
    return total > 0 ? Math.round((part / total) * 100) : 0
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex w-full max-sm:flex-col">
        <div className="w-full">
          <div className="grid w-full cursor-pointer grid-cols-1 gap-3 max-md:px-3 md:grid-cols-2 lg:mb-4 2xl:grid-cols-4">
            {/* Total Customers Card */}
            <motion.div
              className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                <CustomeraIcon />
                Total Customers
              </div>
              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">All Accounts:</p>
                  <p className="text-secondary font-medium">{formatNumber(analyticsData.totalCustomers)}</p>
                </div>
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Active:</p>
                  <p className="text-secondary font-medium">{formatNumber(analyticsData.activeCustomers)}</p>
                </div>
              </div>
            </motion.div>

            {/* Prepaid Customers Card */}
            <motion.div
              className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                <VendingIcon />
                Prepaid Customers
              </div>
              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Token Meters:</p>
                  <p className="text-secondary font-medium">{formatNumber(analyticsData.prepaidCustomers)}</p>
                </div>
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Percentage:</p>
                  <p className="text-secondary font-medium">
                    {calculatePercentage(analyticsData.prepaidCustomers, analyticsData.totalCustomers)}%
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Postpaid Customers Card */}
            <motion.div
              className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                <PostpaidIcon />
                Postpaid Customers
              </div>
              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Billed Monthly:</p>
                  <p className="text-secondary font-medium">{formatNumber(analyticsData.postpaidCustomers)}</p>
                </div>
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">Percentage:</p>
                  <p className="text-secondary font-medium">
                    {calculatePercentage(analyticsData.postpaidCustomers, analyticsData.totalCustomers)}%
                  </p>
                </div>
              </div>
            </motion.div>

            {/* PPM & MD Customers Card */}
            <motion.div
              className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                <BillingIcon />
                Special Categories
              </div>
              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">PPM Customers:</p>
                  <div className="flex gap-1">
                    <p className="text-secondary font-medium">{formatNumber(analyticsData.isPpmCustomers)}</p>
                    <ArrowIcon />
                  </div>
                </div>
                <div className="flex w-full justify-between">
                  <p className="text-grey-200">MD Customers:</p>
                  <p className="text-secondary font-medium">{formatNumber(analyticsData.isMdCustomers)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AllTransactions() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // 8 minutes default

  const router = useRouter()

  // Redux hooks
  const dispatch = useAppDispatch()
  const { customerAnalyticsData, customerAnalyticsLoading, customerAnalyticsError, customerAnalyticsSuccess } =
    useAppSelector((state) => state.analytics)
  const { user } = useAppSelector((state) => state.auth)

  // Check if user has Write permission for customers
  const canAddCustomer = !!user?.privileges?.some((p) => p.key === "customers" && p.actions?.includes("W"))

  // Fetch customer analytics on component mount
  useEffect(() => {
    dispatch(fetchCustomerAnalytics())
  }, [dispatch])

  const handleRefreshData = useCallback(() => {
    dispatch(clearCustomerAnalytics())
    dispatch(fetchCustomerAnalytics())
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

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh customer analytics after adding customer
    dispatch(fetchCustomerAnalytics())
  }

  const handleOpenAddCustomerModal = () => {
    router.push("/customers/add-customers")
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col 2xl:container">
            {/* Page Header - Always Visible */}
            <div className="my-4 flex w-full items-start justify-between gap-6 px-3 max-md:flex-col max-md:px-3 max-sm:my-4 max-sm:px-3 sm:px-4 md:my-8 md:px-6 2xl:px-16">
              <div>
                <h4 className="text-lg font-semibold sm:text-xl md:text-2xl">Customer Management</h4>
                <p className="text-sm sm:text-base">Manage customer accounts, KYC, and service connections</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {canAddCustomer && (
                  <ButtonModule
                    variant="primary"
                    size="md"
                    onClick={handleOpenAddCustomerModal}
                    icon={<VscAdd />}
                    iconPosition="start"
                  >
                    Add Customer
                  </ButtonModule>
                )}
                {/* Polling Controls */}
                <div className="flex items-center gap-2 rounded-md border-r bg-white p-2 pr-3">
                  <span className="text-sm font-medium text-gray-500">Auto-refresh:</span>
                  <button
                    onClick={togglePolling}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isPolling
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {isPolling ? (
                      <>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        ON
                      </>
                    ) : (
                      <>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        OFF
                      </>
                    )}
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
              </motion.div>
            </div>

            {/* Error Message */}
            {customerAnalyticsError && (
              <motion.div
                className="mx-16 mb-4 rounded-md bg-red-50 p-4 text-red-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p>Error loading customer analytics: {customerAnalyticsError}</p>
              </motion.div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-3 max-md:flex-col max-md:px-0 max-sm:my-4 sm:px-4 md:px-6 2xl:px-16">
              <div className="w-full">
                {customerAnalyticsLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State
                  <>
                    {customerAnalyticsData && (
                      <>
                        <CustomerAnalyticsCards analyticsData={customerAnalyticsData} />

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <AllCustomers />
                        </motion.div>
                      </>
                    )}

                    {/* Empty State */}
                    {!customerAnalyticsData && !customerAnalyticsLoading && !customerAnalyticsError && (
                      <motion.div
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="text-center">
                          <CustomeraIcon />
                          <h3 className="mt-4 text-lg font-medium text-gray-900">No Customer Data</h3>
                          <p className="mt-2 text-sm text-gray-500">
                            No customer analytics data available. Try refreshing the data.
                          </p>
                          <div className="mt-4 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">Auto-refresh:</span>
                              <button
                                onClick={togglePolling}
                                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                  isPolling
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              >
                                {isPolling ? (
                                  <>
                                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                      />
                                    </svg>
                                    ON
                                  </>
                                ) : (
                                  <>
                                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    OFF
                                  </>
                                )}
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
                              size="md"
                              onClick={handleRefreshData}
                              icon={<RefreshCircleIcon />}
                              iconPosition="start"
                            >
                              Refresh Data
                            </ButtonModule>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
    </section>
  )
}
