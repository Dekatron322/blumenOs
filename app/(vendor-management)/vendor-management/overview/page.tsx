"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CustomeraIcon, MetersProgrammedIcon, PlusIcon, TamperIcon, VendingIcon } from "components/Icons/Icons"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import { ButtonModule } from "components/ui/Button/Button"
import VendorManagement from "components/VendorManagementInfo/VendorManagment"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendorSummaryAnalytics } from "lib/redux/analyticsSlice"

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
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
          <div className="flex items-center gap-2 border-b pb-4">
            <div className="size-6 rounded-full bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200 sm:w-32"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-20 rounded bg-gray-200 sm:w-24"></div>
                <div className="h-4 w-14 rounded bg-gray-200 sm:w-16"></div>
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
    <div className="w-full rounded-md border bg-white p-5 lg:w-80">
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
    <div className="flex-1 rounded-md border bg-white p-4 sm:p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-80"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-20 rounded bg-gray-200 sm:w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gray-200 sm:size-12"></div>
                <div>
                  <div className="h-5 w-28 rounded bg-gray-200 sm:w-32"></div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <div className="h-6 w-14 rounded-full bg-gray-200 sm:w-16"></div>
                    <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20"></div>
                  </div>
                </div>
              </div>
              <div className="size-6 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-gray-200 sm:w-20"></div>
                  <div className="h-4 w-12 rounded bg-gray-200 sm:w-16"></div>
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
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
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
    <div className="flex-1 rounded-md border bg-white p-4 sm:p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-80"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-20 rounded bg-gray-200 sm:w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* List View Skeleton */}
      <div className="divide-y">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b bg-white p-4">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center">
                    <div className="h-5 w-40 rounded bg-gray-200"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-14 rounded-full bg-gray-200 sm:w-16"></div>
                      <div className="h-6 w-16 rounded-full bg-gray-200 sm:w-20"></div>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 w-20 rounded bg-gray-200 sm:w-24"></div>
                    ))}
                  </div>
                  <div className="mt-1 h-4 w-full rounded bg-gray-200 sm:w-64"></div>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-3 lg:w-auto">
                <div className="text-right">
                  <div className="h-4 w-20 rounded bg-gray-200 sm:w-24"></div>
                  <div className="mt-1 h-4 w-16 rounded bg-gray-200 sm:w-20"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-16 rounded bg-gray-200 sm:w-20"></div>
                  <div className="size-6 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
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
    <div className="relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
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

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

export default function VendorManagementDashboard() {
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false)
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)

  const dispatch = useAppDispatch()
  const { vendorSummaryData, vendorSummaryLoading, vendorSummaryError, vendorSummarySuccess } = useAppSelector(
    (state) => state.analytics
  )

  // Calculate derived metrics from vendor data
  const calculateDerivedMetrics = () => {
    if (!vendorSummaryData) return null

    const { totalVendors, activeVendors, suspendedVendors, vendorsByState } = vendorSummaryData

    return {
      totalVendors,
      activeVendors,
      suspendedVendors,
      vendorsByState,
    }
  }

  const derivedMetrics = calculateDerivedMetrics()

  useEffect(() => {
    // Fetch vendor analytics when component mounts
    dispatch(fetchVendorSummaryAnalytics({}))
  }, [dispatch])

  const handleAddVendorSuccess = async () => {
    setIsAddVendorModalOpen(false)
    // Refresh vendor analytics after adding vendor
    dispatch(fetchVendorSummaryAnalytics({}))
  }

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh vendor analytics after adding customer
    dispatch(fetchVendorSummaryAnalytics({}))
  }

  const handleRefreshData = () => {
    dispatch(fetchVendorSummaryAnalytics({}))
  }

  // Show loading state
  const isLoading = vendorSummaryLoading

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col px-3 2xl:container sm:px-4 xl:px-16">
            {/* Page Header - Always Visible */}
            <div className="flex w-full flex-col justify-between gap-4 py-4 sm:py-6 md:flex-row md:gap-6 lg:my-8">
              <div className="flex-1">
                <h4 className="text-xl font-semibold sm:text-2xl">Vendor Management</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Vendor onboarding, commissions, and performance tracking
                </p>
              </div>

              <motion.div
                className="flex items-center justify-start gap-3 md:justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<PlusIcon />}
                  onClick={() => setIsAddVendorModalOpen(true)}
                >
                  <span className="hidden sm:inline">Add New Vendor</span>
                  <span className="sm:hidden">Add Vendor</span>
                </ButtonModule>
              </motion.div>
            </div>

            {/* Error State */}
            {vendorSummaryError && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <TamperIcon />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Failed to load vendor analytics</h3>
                      <p className="mt-1 text-sm text-red-700">{vendorSummaryError}</p>
                    </div>
                  </div>
                  <ButtonModule
                    variant="secondary"
                    size="sm"
                    onClick={handleRefreshData}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Retry
                  </ButtonModule>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full flex-col gap-6 lg:flex-row">
              <div className="w-full">
                {isLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State - Updated Vendor Management Dashboard with real data
                  <>
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Vendors Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-blue-600">
                              <CustomeraIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Total Vendors</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">All Vendors:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {derivedMetrics ? formatNumber(derivedMetrics.totalVendors) : 0}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Active/Suspended:</p>
                              <div className="flex items-center gap-1">
                                <div className="size-2 rounded-full bg-green-500"></div>
                                <p className="text-secondary text-sm font-medium sm:text-base">
                                  {derivedMetrics
                                    ? `${derivedMetrics.activeVendors}/${derivedMetrics.suspendedVendors}`
                                    : "0/0"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Active Vendors Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-green-600">
                              <MetersProgrammedIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Active Vendors</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Currently Active:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {derivedMetrics ? formatNumber(derivedMetrics.activeVendors) : 0}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Percentage:</p>
                              <p className="text-secondary text-sm font-medium sm:text-base">
                                {derivedMetrics && derivedMetrics.totalVendors > 0
                                  ? `${Math.round(
                                      (derivedMetrics.activeVendors / derivedMetrics.totalVendors) * 100
                                    )}% of total`
                                  : "0%"}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Suspended Vendors Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-purple-600">
                              <VendingIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Suspended Vendors</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Currently Suspended:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {derivedMetrics ? formatNumber(derivedMetrics.suspendedVendors) : 0}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Share of Total:</p>
                              <p className="text-secondary text-sm font-medium sm:text-base">
                                {derivedMetrics && derivedMetrics.totalVendors > 0
                                  ? `${Math.round(
                                      (derivedMetrics.suspendedVendors / derivedMetrics.totalVendors) * 100
                                    )}% of total`
                                  : "0%"}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Coverage Metrics Card */}
                        <motion.div
                          className="small-card rounded-md bg-white p-4 shadow-sm transition duration-500 md:border"
                          whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex items-center gap-2 border-b pb-4">
                            <div className="text-orange-600">
                              <TamperIcon />
                            </div>
                            <span className="text-sm font-medium sm:text-base">Coverage Metrics</span>
                          </div>
                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">States Covered:</p>
                              <p className="text-secondary text-lg font-bold sm:text-xl">
                                {derivedMetrics && derivedMetrics.vendorsByState
                                  ? formatNumber(derivedMetrics.vendorsByState.length)
                                  : 0}
                              </p>
                            </div>
                            <div className="flex w-full justify-between">
                              <p className="text-sm text-gray-600 sm:text-base">Avg Vendors / State:</p>
                              <p className="text-secondary text-sm font-medium sm:text-base">
                                {derivedMetrics &&
                                derivedMetrics.vendorsByState &&
                                derivedMetrics.vendorsByState.length > 0
                                  ? formatNumber(
                                      Math.round(derivedMetrics.totalVendors / derivedMetrics.vendorsByState.length)
                                    )
                                  : 0}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* State Distribution Section */}
                    {derivedMetrics && derivedMetrics.vendorsByState && derivedMetrics.vendorsByState.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 rounded-lg bg-white p-4 shadow-sm sm:p-6"
                      >
                        <h3 className="mb-4 text-lg font-semibold">Vendor Distribution by State</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {derivedMetrics.vendorsByState.slice(0, 6).map((state, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                              <span className="text-sm font-medium sm:text-base">{state.state}</span>
                              <span className="text-sm font-bold text-blue-600 sm:text-base">
                                {formatNumber(state.count)} vendors
                              </span>
                            </div>
                          ))}
                        </div>
                        {derivedMetrics.vendorsByState.length > 6 && (
                          <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                              +{derivedMetrics.vendorsByState.length - 6} more states
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <VendorManagement />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <AddAgentModal
        isOpen={isAddVendorModalOpen}
        onRequestClose={() => setIsAddVendorModalOpen(false)}
        onSuccess={handleAddVendorSuccess}
      />
    </section>
  )
}
