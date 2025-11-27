"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CustomeraIcon,
  MetersProgrammedIcon,
  PlayIcon,
  PlusIcon,
  TamperIcon,
  TokenGeneratedIcon,
  VendingIcon,
} from "components/Icons/Icons"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import AddAgentModal from "components/ui/Modal/add-agent-modal"
import BillingInfo from "components/BillingInfo/BillingInfo"
import { ButtonModule } from "components/ui/Button/Button"
import AgentManagementInfo from "components/AgentManagementInfo/AgentManagementInfo"
import AgentDirectory from "components/AgentManagementInfo/AgentDirectory"
import VendorManagement from "components/VendorManagementInfo/VendorManagment"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchVendorSummaryAnalytics } from "lib/redux/analyticsSlice"

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
          <div className="container mx-auto flex flex-col">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Vendor Management</h4>
                <p>Vendor onboarding, commissions, and performance tracking</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="mt-2"
                  icon={<PlusIcon />}
                  onClick={() => setIsAddVendorModalOpen(true)}
                >
                  Add New Vendor
                </ButtonModule>
              </motion.div>
            </div>

            {/* Error State */}
            {vendorSummaryError && (
              <div className="mx-16 mb-4 rounded-md bg-red-50 p-4 max-md:mx-0 max-sm:mx-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TamperIcon />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Failed to load vendor analytics</h3>
                      <p className="mt-2 text-sm text-red-700">{vendorSummaryError}</p>
                    </div>
                  </div>
                  <ButtonModule variant="secondary" size="sm" onClick={handleRefreshData} disabled={isLoading}>
                    Retry
                  </ButtonModule>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
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
                      className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex w-full max-sm:flex-col">
                        <div className="w-full">
                          <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
                            {/* Total Vendors Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-blue-600">
                                  <CustomeraIcon />
                                </div>
                                <span className="font-medium">Total Vendors</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">All Vendors:</p>
                                  <p className="text-secondary text-xl font-bold">
                                    {derivedMetrics ? formatNumber(derivedMetrics.totalVendors) : 0}
                                  </p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Active/Suspended:</p>
                                  <div className="flex items-center gap-1">
                                    <div className="size-2 rounded-full bg-green-500"></div>
                                    <p className="text-secondary font-medium">
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
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-green-600">
                                  <MetersProgrammedIcon />
                                </div>
                                <span className="font-medium">Active Vendors</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Currently Active:</p>
                                  <p className="text-secondary text-xl font-bold">
                                    {derivedMetrics ? formatNumber(derivedMetrics.activeVendors) : 0}
                                  </p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Percentage:</p>
                                  <p className="text-secondary font-medium">
                                    {derivedMetrics && derivedMetrics.totalVendors > 0
                                      ? `${Math.round(
                                          (derivedMetrics.activeVendors / derivedMetrics.totalVendors) * 100
                                        )}% of total`
                                      : "0%"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Estimated Collections Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-purple-600">
                                  <VendingIcon />
                                </div>
                                <span className="font-medium">Suspended Vendors</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Currently Suspended:</p>
                                  <p className="text-secondary text-xl font-bold">
                                    {derivedMetrics ? formatNumber(derivedMetrics.suspendedVendors) : 0}
                                  </p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Share of Total:</p>
                                  <p className="text-secondary font-medium">
                                    {derivedMetrics && derivedMetrics.totalVendors > 0
                                      ? `${Math.round(
                                          (derivedMetrics.suspendedVendors / derivedMetrics.totalVendors) * 100
                                        )}% of total`
                                      : "0%"}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Performance Metrics Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-orange-600">
                                  <TamperIcon />
                                </div>
                                <span className="font-medium">Coverage Metrics</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">States Covered:</p>
                                  <p className="text-secondary text-xl font-bold">
                                    {derivedMetrics && derivedMetrics.vendorsByState
                                      ? formatNumber(derivedMetrics.vendorsByState.length)
                                      : 0}
                                  </p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Avg Vendors / State:</p>
                                  <p className="text-secondary font-medium">
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
                        </div>
                      </div>
                    </motion.div>

                    {/* State Distribution Section */}
                    {derivedMetrics && derivedMetrics.vendorsByState && derivedMetrics.vendorsByState.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 rounded-lg bg-white p-6 shadow-sm"
                      >
                        <h3 className="mb-4 text-lg font-semibold">Vendor Distribution by State</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {derivedMetrics.vendorsByState.slice(0, 6).map((state, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                              <span className="font-medium">{state.state}</span>
                              <span className="font-bold text-blue-600">{formatNumber(state.count)} vendors</span>
                            </div>
                          ))}
                        </div>
                        {derivedMetrics.vendorsByState.length > 6 && (
                          <div className="mt-4 text-center">
                            <p className="text-gray-600">+{derivedMetrics.vendorsByState.length - 6} more states</p>
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
